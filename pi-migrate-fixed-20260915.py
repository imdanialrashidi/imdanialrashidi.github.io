#!/usr/bin/env python3
"""Migrate/update an OMP or Pi workflow safely.

Run from a Git project root:
  python3 pi-migrate.py                 # plan, no writes
  python3 pi-migrate.py --apply         # apply after reviewing the plan
  python3 pi-migrate.py --rollback PATH # restore a printed backup
"""
from __future__ import annotations
import argparse, datetime as dt, hashlib, json, os, shutil, subprocess, sys, tempfile
from pathlib import Path

PI_URL = "https://github.com/imdanialrashidi/pi-production-workflow-template.git"
STATE = ".pi/workflow-migration.json"
# Deliberately small: these are the workflow's portable runtime surfaces.
COPY = [
    ".pi", "p", "Dockerfile.pi", ".mcp.json",
    "scripts/pi-doctor.sh", "scripts/pi-sandbox.sh",
    "scripts/verify-package-integrity.mjs",
    "scripts/run-workflow-evals.mjs",
    "scripts/lib/workflow-evals.mjs", "scripts/lib/eval-isolation.mjs",
    "docs/HARNESS.md", "docs/EVALUATION.md", "docs/RESEARCH.md",
    "docs/GIT_POLICY.md",
]
# Operator/project choices must survive an update.
PRESERVE = {
    ".pi/settings.json", ".pi/models.env", ".pi/APPEND_SYSTEM.md",
    ".pi/extensions/safety-guard.js", ".pi/extensions/harness-runtime.js",
    ".pi/verification.json",
}
ARCHIVE = [".omp", "o", "Dockerfile.omp", ".github/omp-runtime"]
IGNORED_BACKUP = {".git", ".pi-migration.lock"}

def git(*args, cwd=None, check=True):
    env = {k:v for k,v in os.environ.items() if not k.startswith("GIT_")}
    env["GIT_TERMINAL_PROMPT"] = "0"
    return subprocess.run(["git", *args], cwd=cwd, env=env, text=True,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=check)

def root():
    try:
        return Path(git("rev-parse", "--show-toplevel").stdout.strip()).resolve()
    except Exception:
        raise SystemExit("Run this command from inside a Git project.")

def sha(path):
    h = hashlib.sha256()
    if path.is_file() or path.is_symlink(): h.update(path.read_bytes())
    elif path.is_dir():
        for p in sorted(path.rglob("*")):
            if p.is_file() and ".git" not in p.parts:
                h.update(str(p.relative_to(path)).encode()); h.update(p.read_bytes())
    return h.hexdigest()

def copy_path(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.is_dir() and not src.is_symlink():
        if dst.exists() and not dst.is_dir(): dst.unlink()
        shutil.copytree(src, dst, dirs_exist_ok=True, symlinks=True)
    else:
        shutil.copy2(src, dst, follow_symlinks=False)

def remove_path(path):
    if path.is_dir() and not path.is_symlink(): shutil.rmtree(path)
    elif path.exists() or path.is_symlink(): path.unlink()

def snapshot(paths, base):
    out = {}
    for name in paths:
        p = base / name
        if p.exists() or p.is_symlink(): out[name] = sha(p)
    return out

def get_template(local):
    if local:
        p = Path(local).expanduser().resolve()
        if not (p / ".pi").is_dir() or not (p / "p").exists():
            raise SystemExit("--template must point to a Pi workflow checkout")
        return p, None
    temp = Path(tempfile.mkdtemp(prefix=".pi-template-"))
    try:
        git("clone", "--depth", "1", "--quiet", PI_URL, str(temp))
    except Exception:
        shutil.rmtree(temp, ignore_errors=True)
        raise SystemExit("Could not download the Pi workflow. Use --template PATH for offline use.")
    commit = git("rev-parse", "HEAD", cwd=temp).stdout.strip()
    return temp, commit

def make_backup(project, names, backup):
    for name in names:
        p = project / name
        if not (p.exists() or p.is_symlink()): continue
        copy_path(p, backup / name)

def restore_backup(project, backup):
    # Remove only known workflow paths first, so newly added Pi files disappear.
    for name in COPY + ARCHIVE + [STATE]: remove_path(project / name)
    # Replace each backed-up workflow root as a unit so newly added Pi files are removed.
    roots = set()
    for p in backup.rglob("*"):
        if p.is_file() and p.name != "README.txt":
            rel = p.relative_to(backup)
            roots.add(rel.parts[1] if rel.parts[0] == "old-omp" else rel.parts[0])
    for name in roots: remove_path(project / name)
    for p in sorted(backup.rglob("*"), key=lambda x: len(x.parts)):
        rel = p.relative_to(backup)
        if p.is_dir() or p.name == "README.txt": continue
        if rel.parts and rel.parts[0] == "old-omp": rel = Path(*rel.parts[1:])
        copy_path(p, project / rel)

def plan(project, template):
    old = (project / ".omp").exists()
    previous = {}
    state = project / STATE
    if state.exists():
        try: previous = json.loads(state.read_text()).get("managed", {})
        except Exception: raise SystemExit(f"Invalid migration state: {STATE}")
    changes, protected, missing = [], [], []
    for name in COPY:
        src, dst = template / name, project / name
        if not src.exists(): missing.append(name); continue
        if name in PRESERVE and dst.exists():
            protected.append(name); continue
        if not dst.exists() or sha(src) != sha(dst): changes.append(name)
    archived = [x for x in ARCHIVE if (project / x).exists() or (project / x).is_symlink()]
    # Never touch application files or existing CI. This is intentional.
    return {
        "mode": "OMP -> Pi" if old else ("Pi update" if (project / ".pi").exists() else "Pi install"),
        "copy": changes, "preserved": protected, "archive": archived,
        "missing_template_files": missing, "previous_state": bool(previous),
        "project": str(project),
    }

def apply(project, template, report):
    if git("diff", "--quiet", cwd=project, check=False).returncode != 0 or git("diff", "--cached", "--quiet", cwd=project, check=False).returncode != 0:
        raise SystemExit("Commit or stash existing Git changes before --apply.")
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d-%H%M%S")
    backup = project / ".workflow-backups" / stamp
    names = COPY + ARCHIVE + [STATE, ".gitignore"]
    backup.mkdir(parents=True, exist_ok=False)
    make_backup(project, names, backup)
    try:
        for name in report["copy"]:
            if name == ".pi":
                for item in (template / ".pi").rglob("*"):
                    rel = item.relative_to(template)
                    if str(rel) in PRESERVE and (project / rel).exists(): continue
                    if item.is_dir(): (project / rel).mkdir(parents=True, exist_ok=True)
                    else: copy_path(item, project / rel)
            else:
                copy_path(template / name, project / name)
        # Archive OMP rather than deleting it; it remains available for rollback/audit.
        old = project / "old-omp"
        for name in report["archive"]:
            src, dst = project / name, backup / "old-omp" / name
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(dst))
        (backup / "README.txt").write_text("Pi workflow migration backup. Product files were not included.\n")
        state = {"version": 1, "template": PI_URL, "template_commit": report.get("template_commit"),
                 "managed": {n: sha(project / n) for n in report["copy"] if (project / n).exists()},
                 "preserved": sorted(report["preserved"]), "backup": str(backup)}
        (project / STATE).parent.mkdir(parents=True, exist_ok=True)
        (project / STATE).write_text(json.dumps(state, indent=2) + "\n")
        print("APPLIED")
        print("BACKUP", backup)
    except Exception:
        restore_backup(project, backup)
        raise

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--template", help="local Pi template checkout; otherwise clone the official template")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--rollback", type=Path)
    args = ap.parse_args()
    project = root()
    if args.rollback:
        backup = args.rollback.resolve()
        if not (backup / "README.txt").exists() and not (backup / "old-omp").exists():
            raise SystemExit("Backup directory is not recognized.")
        restore_backup(project, backup)
        print("RESTORED", backup)
        return
    template, commit = get_template(args.template)
    try:
        report = plan(project, template)
        report["template_commit"] = commit
        print(json.dumps(report, indent=2))
        if report["missing_template_files"]:
            raise SystemExit("Template is incomplete; nothing changed.")
        if not args.apply:
            print("PLAN ONLY: no files changed. Review the plan, then add --apply.")
            return
        apply(project, template, report)
        print("Run: bash scripts/pi-doctor.sh --ci --static")
    finally:
        if commit is not None: shutil.rmtree(template, ignore_errors=True)

if __name__ == "__main__":
    try: main()
    except KeyboardInterrupt: raise SystemExit("Cancelled; no migration was applied.")

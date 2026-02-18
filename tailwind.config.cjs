/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        border: 'var(--border)'
      },
      boxShadow: {
        glass: '0 12px 36px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
};

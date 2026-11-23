import type { CollectionEntry } from 'astro:content'
import type { ImageMetadata } from 'astro'
import dalakhani from '../assets/travels/dalakhani.webp'
import darehMarg from '../assets/travels/dareh-marg.webp'
import yakhMorad from '../assets/travels/yakh-morad.webp'

export type TravelEntry = CollectionEntry<'travels'>

export const travelImageMap: Record<string, ImageMetadata> = {
  dalakhani,
  'dareh-marg': darehMarg,
  'yakh-morad': yakhMorad,
}

export function travelImage(entry: TravelEntry): ImageMetadata | undefined {
  return travelImageMap[entry.data.image]
}

export function sortTravels(entries: TravelEntry[]): TravelEntry[] {
  return [...entries].sort((a, b) => a.data.order - b.data.order)
}

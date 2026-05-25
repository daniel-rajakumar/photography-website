import { createClient } from "@sanity/client";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// ── Types ────────────────────────────────────────────────────────────────────

export type Category =
  | "all"
  | "landscape"
  | "portrait"
  | "street"
  | "abstract"
  | "architecture";

export interface SanityPhoto {
  _id: string;
  title: string;
  category: Exclude<Category, "all">;
  image: SanityImageSource;
  alt: string;
  location?: string;
  featured?: boolean;
  order?: number;
  // Populated by the GROQ asset-> dereference
  imageWidth?: number;
  imageHeight?: number;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export const ALL_PHOTOS_QUERY = `*[_type == "photo"] | order(order asc, _createdAt desc) {
  _id,
  title,
  category,
  image {
    ...,
    asset-> {
      _id,
      url,
      metadata {
        dimensions {
          width,
          height
        }
      }
    }
  },
  "imageWidth": image.asset->metadata.dimensions.width,
  "imageHeight": image.asset->metadata.dimensions.height,
  alt,
  location,
  featured,
  order
}`;

export async function getAllPhotos(): Promise<SanityPhoto[]> {
  return client.fetch(ALL_PHOTOS_QUERY, {}, { next: { tags: ["photos"] } });
}

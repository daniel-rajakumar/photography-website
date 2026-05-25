export interface Photo {
  id: string;
  title: string;
  category: "landscape" | "portrait" | "street" | "abstract" | "architecture";
  src: string;
  width: number;
  height: number;
  alt: string;
  featured?: boolean;
  location?: string;
}

export const photos: Photo[] = [
  {
    id: "p1",
    title: "Mountain Requiem",
    category: "landscape",
    src: "/photo-landscape-1.jpg",
    width: 1024,
    height: 1024,
    alt: "Aerial view of misty Pacific Northwest forest at golden sunrise",
    featured: true,
    location: "Cascade Range, WA",
  },
  {
    id: "p2",
    title: "Solitude",
    category: "portrait",
    src: "/photo-portrait-1.jpg",
    width: 1024,
    height: 1024,
    alt: "Dramatic moody portrait of a young woman with golden rim light",
    featured: true,
    location: "Studio",
  },
  {
    id: "p3",
    title: "Midnight City",
    category: "street",
    src: "/photo-street-1.jpg",
    width: 1024,
    height: 1024,
    alt: "Rainy city alley at night with neon reflections and lone figure",
    featured: true,
    location: "Tokyo, JP",
  },
  {
    id: "p4",
    title: "Iridescence",
    category: "abstract",
    src: "/photo-abstract-1.jpg",
    width: 1024,
    height: 1024,
    alt: "Macro photograph of iridescent water droplets on dark petals",
    featured: true,
    location: "Studio",
  },
  {
    id: "p5",
    title: "Grand Archive",
    category: "architecture",
    src: "/photo-architecture-1.jpg",
    width: 1024,
    height: 1024,
    alt: "Looking up at a magnificent ornate library spiral staircase",
    featured: false,
    location: "Vienna, AT",
  },
  {
    id: "p6",
    title: "The Haul",
    category: "portrait",
    src: "/photo-portrait-2.jpg",
    width: 1024,
    height: 1024,
    alt: "Documentary portrait of a fisherman on boat at fiery sunset",
    featured: false,
    location: "Nova Scotia, CA",
  },
  {
    id: "p7",
    title: "Mirror World",
    category: "landscape",
    src: "/photo-landscape-2.jpg",
    width: 1024,
    height: 1024,
    alt: "Lone dead tree silhouetted against purple dusk sky reflected in salt flats",
    featured: true,
    location: "Atacama, CL",
  },
  {
    id: "p8",
    title: "Ember Descent",
    category: "landscape",
    src: "/hero-bg.jpg",
    width: 1024,
    height: 1024,
    alt: "Dramatic golden hour light breaking through storm clouds over mountains",
    featured: false,
    location: "Dolomites, IT",
  },
];

export const categories = ["all", "landscape", "portrait", "street", "abstract", "architecture"] as const;
export type Category = typeof categories[number];

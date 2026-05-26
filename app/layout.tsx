import type { Metadata, Viewport } from "next";
import RotateLock from "@/components/RotateLock";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://photography.danielrajakumar.com"),
  title: {
    default: "Daniel Rajakumar | Phone Photography",
    template: "%s | Daniel Rajakumar",
  },
  description:
    "A personal gallery of phone photos edited in Lightroom, with original comparisons from Daniel Rajakumar.",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  applicationName: "Dan Photos",
  appleWebApp: {
    capable: true,
    title: "Dan Photos",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Daniel Rajakumar | Phone Photography",
    description:
      "A personal gallery of phone photos edited in Lightroom, with original comparisons.",
    url: "/",
    siteName: "Daniel Rajakumar Photography",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Daniel Rajakumar phone photography gallery preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniel Rajakumar | Phone Photography",
    description:
      "A personal gallery of phone photos edited in Lightroom, with original comparisons.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegistration />
        <RotateLock>
          <main>{children}</main>
        </RotateLock>
      </body>
    </html>
  );
}

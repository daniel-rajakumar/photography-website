import type { Metadata } from "next";
import RotateLock from "@/components/RotateLock";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RotateLock>
          <main>{children}</main>
        </RotateLock>
      </body>
    </html>
  );
}

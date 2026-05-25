import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina | Photography Gallery",
  description:
    "A curated collection of fine art landscape, portrait, and street photography.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}

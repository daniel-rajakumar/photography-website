import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daniel Rajakumar | Phone Photography",
  description:
    "A personal gallery of phone photos edited in Lightroom by Daniel Rajakumar.",
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

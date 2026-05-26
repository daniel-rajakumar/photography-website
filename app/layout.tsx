import type { Metadata } from "next";
import RotateLock from "@/components/RotateLock";
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
        <RotateLock>
          <main>{children}</main>
        </RotateLock>
      </body>
    </html>
  );
}

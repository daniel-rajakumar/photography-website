/* Locks the page to viewport - no page scrolling on the swipe route */
import type { ReactNode } from "react";

export const metadata = {
  title: "Daniel Rajakumar | Phone Photography",
};

export default function SwipeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

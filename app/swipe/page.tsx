import { getLocalPhotos } from "@/lib/photos";
import SwipeGrid from "@/components/SwipeGrid";

export const revalidate = 60;

export default async function SwipePage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const photos = await getLocalPhotos();
  
  let filtered = photos.filter((p) => !p.hidden);

  const phone = searchParams.phone as string | undefined;
  const orientation = searchParams.orientation as string | undefined;

  if (phone && phone !== "all") {
    filtered = filtered.filter(p => p.phone === phone);
  }
  if (orientation && orientation !== "all") {
    filtered = filtered.filter(p => p.category === orientation);
  }

  return (
    <>
      <style>{`html, body { overflow: hidden; height: 100dvh; }`}</style>
      <div style={{ height: "100dvh", overflow: "hidden", background: "var(--color-bg)" }}>
        {filtered.length > 0 ? (
          <SwipeGrid photos={filtered} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--color-text-secondary)" }}>
            <p>No photos match these filters.</p>
          </div>
        )}
      </div>
    </>
  );
}

import { getLocalPhotos } from "@/lib/photos";
import EmptySwipeState from "@/components/EmptySwipeState";
import SwipeGrid from "@/components/SwipeGrid";

export const revalidate = 60;

export default async function SwipePage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const photos = await getLocalPhotos();

  const visiblePhotos = photos.filter((p) => !p.hidden);
  let filtered = visiblePhotos;

  const phoneParam = searchParams.phone;
  const orientationParam = searchParams.orientation;
  const phone = Array.isArray(phoneParam) ? phoneParam[0] : phoneParam;
  const orientation = Array.isArray(orientationParam)
    ? orientationParam[0]
    : orientationParam;
  const phones = Array.from(
    new Set(visiblePhotos.map((photo) => photo.phone).filter(Boolean))
  ).sort();
  const orientations = Array.from(
    new Set(visiblePhotos.map((photo) => photo.category).filter(Boolean))
  ).sort();

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
          <SwipeGrid
            key={`${phone ?? "all"}-${orientation ?? "all"}`}
            photos={filtered}
            filters={{
              activePhone: phone ?? "all",
              activeOrientation: orientation ?? "all",
              phones,
              orientations,
            }}
          />
        ) : (
          <EmptySwipeState
            filters={{
              activePhone: phone ?? "all",
              activeOrientation: orientation ?? "all",
              phones,
              orientations,
            }}
          />
        )}
      </div>
    </>
  );
}

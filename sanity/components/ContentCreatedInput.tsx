import { useEffect, useMemo, useState } from "react";
import { useClient, useFormValue } from "sanity";

type ImageFieldValue = {
  asset?: {
    _ref?: string;
  };
};

function parsePhotoDateTime(value?: string) {
  if (!value) return null;

  const exifMatch = value.match(
    /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (exifMatch) {
    const [, year, month, day, hour, minute, second = "0"] = exifMatch;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatContentCreated(value?: string) {
  const date = parsePhotoDateTime(value);

  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function ContentCreatedInput() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const image = useFormValue(["image"]) as ImageFieldValue | undefined;
  const assetId = image?.asset?._ref;
  const [metadata, setMetadata] = useState<{
    assetId?: string;
    captureDateTime?: string;
  }>({});

  useEffect(() => {
    let isMounted = true;

    if (!assetId) return;

    client
      .fetch<string | null>(
        `*[_id == $assetId][0]{
          "captureDateTime": coalesce(
            metadata.exif.DateTimeOriginal,
            metadata.exif.DateTimeDigitized,
            metadata.image.ModifyDate
          )
        }.captureDateTime`,
        { assetId }
      )
      .then((value) => {
        if (!isMounted) return;
        setMetadata({
          assetId,
          captureDateTime: value ?? undefined,
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setMetadata({ assetId });
      });

    return () => {
      isMounted = false;
    };
  }, [assetId, client]);

  const value = useMemo(() => {
    if (!assetId) return "Select an image to read its content-created date.";
    if (metadata.assetId !== assetId) return "Reading image metadata...";

    return (
      formatContentCreated(metadata.captureDateTime) ||
      "No photo-created metadata found. Re-upload the original image with metadata."
    );
  }, [assetId, metadata]);

  return (
    <input
      readOnly
      value={value}
      style={{
        width: "100%",
        minHeight: "37px",
        border: "1px solid var(--card-border-color)",
        borderRadius: "3px",
        padding: "0 0.75rem",
        color: "var(--card-fg-color)",
        background: "var(--card-bg-color)",
        font: "inherit",
      }}
    />
  );
}

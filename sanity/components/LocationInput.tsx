import { useEffect, useId, useMemo, useState } from "react";
import type { StringInputProps } from "sanity";
import { useClient } from "sanity";

const FALLBACK_LOCATIONS = [
  "Saranac Village, NY",
  "Cascade Range, WA",
  "Tokyo, JP",
  "Vienna, AT",
  "Nova Scotia, CA",
  "Atacama, CL",
  "Dolomites, IT",
  "Studio",
];

export function LocationInput(props: StringInputProps) {
  const client = useClient({ apiVersion: "2024-01-01" });
  const datalistId = useId().replace(/:/g, "");
  const [locations, setLocations] = useState<string[]>(FALLBACK_LOCATIONS);

  useEffect(() => {
    let isMounted = true;

    client
      .fetch<string[]>(
        `array::unique(*[_type == "photo" && defined(location)].location)`
      )
      .then((existingLocations) => {
        if (!isMounted) return;
        setLocations([...FALLBACK_LOCATIONS, ...existingLocations]);
      })
      .catch(() => {
        if (!isMounted) return;
        setLocations(FALLBACK_LOCATIONS);
      });

    return () => {
      isMounted = false;
    };
  }, [client]);

  const suggestions = useMemo(
    () =>
      Array.from(new Set(locations.filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [locations]
  );
  const elementProps = {
    ...props.elementProps,
    list: datalistId,
  } as typeof props.elementProps & { list: string };

  return (
    <>
      {props.renderDefault({
        ...props,
        elementProps,
      })}
      <datalist id={datalistId}>
        {suggestions.map((location) => (
          <option key={location} value={location} />
        ))}
      </datalist>
    </>
  );
}

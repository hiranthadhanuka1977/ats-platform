"use client";

import { useRouter } from "next/navigation";

import { listingUrl } from "@/lib/listing-url";
import type { ListingSearchRecord } from "@/lib/listing-url";

type Props = {
  value: "recent" | "az";
  base: ListingSearchRecord;
};

export function SortSelect({ value, base }: Props) {
  const router = useRouter();
  return (
    <select
      className="form-select sort-select"
      aria-label="Sort jobs"
      value={value === "az" ? "az" : "recent"}
      onChange={(e) => {
        const v = e.target.value;
        router.push(listingUrl(base, { sort: v === "az" ? "az" : null }));
      }}
    >
      <option value="recent">Most Recent</option>
      <option value="az">Title A–Z</option>
    </select>
  );
}

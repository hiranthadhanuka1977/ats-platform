import { MobileFilterToggle } from "@/components/job-listing/MobileFilterToggle";
import { SortSelect } from "@/components/job-listing/SortSelect";
import type { ListingSearchRecord } from "@/lib/listing-url";

type Props = {
  total: number;
  base: ListingSearchRecord;
  sort: "recent" | "az";
};

export function JobListToolbar({ total, base, sort }: Props) {
  return (
    <div className="listings-toolbar">
      <p className="results-count" aria-live="polite">
        <strong>{total}</strong> jobs found
      </p>
      <div className="toolbar-controls">
        <MobileFilterToggle />
        <SortSelect value={sort} base={base} />
      </div>
    </div>
  );
}

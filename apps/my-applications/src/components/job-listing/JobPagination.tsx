import Link from "next/link";

import { listingUrl } from "@/lib/listing-url";
import type { ListingSearchRecord } from "@/lib/listing-url";

type Props = {
  page: number;
  totalPages: number;
  base: ListingSearchRecord;
};

export function JobPagination({ page, totalPages, base }: Props) {
  if (totalPages <= 1) return null;

  const prevHref = listingUrl(base, { page: page <= 2 ? null : String(page - 1) });
  const nextHref = listingUrl(base, { page: String(page + 1) });

  return (
    <nav className="pagination" aria-label="Pagination">
      {page <= 1 ? (
        <span className="pagination-btn" aria-disabled="true" style={{ opacity: 0.4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </span>
      ) : (
        <Link href={prevHref} className="pagination-btn" aria-label="Previous page">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
      )}

      <span className="results-count" style={{ margin: "0 var(--space-2)" }}>
        Page {page} / {totalPages}
      </span>

      {page >= totalPages ? (
        <span className="pagination-btn" aria-disabled="true" style={{ opacity: 0.4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      ) : (
        <Link href={nextHref} className="pagination-btn" aria-label="Next page">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      )}
    </nav>
  );
}

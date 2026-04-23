"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export type CandidateSearchItem = {
  id: string;
  name: string;
  email: string;
};

type CandidateSearchBoxProps = {
  candidates: CandidateSearchItem[];
  compact?: boolean;
};

export function CandidateSearchBox({ candidates, compact = false }: CandidateSearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return candidates
      .filter((candidate) => candidate.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [candidates, query]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className={`bo-candidate-search-wrap${compact ? " bo-candidate-search-wrap--compact" : ""}`} ref={wrapRef}>
      <input
        id="candidate-search-input"
        type="search"
        aria-label="Search candidates"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (query.trim()) setOpen(true);
        }}
        className="bo-candidate-search-input"
        placeholder="Type a candidate name..."
        autoComplete="off"
      />

      {open && query.trim() ? (
        <div className="bo-candidate-search-flyover" role="listbox" aria-label="Matching candidates">
          {matches.length === 0 ? (
            <p className="bo-candidate-search-empty">No matching candidates found.</p>
          ) : (
            <ul>
              {matches.map((candidate) => (
                <li key={candidate.id}>
                  <button
                    type="button"
                    className="bo-candidate-search-item"
                    onClick={() => {
                      setOpen(false);
                      setQuery(candidate.name);
                      router.push(`/candidates/${candidate.id}`);
                    }}
                  >
                    <span className="bo-candidate-search-name">{candidate.name}</span>
                    <span className="bo-candidate-search-email">{candidate.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * SkeletonLoader — shimmer-placeholders som matchar SchemaView-layouten.
 * Visas under Firebase-initial-load (första gången en månad hämtas).
 *
 * Exports:
 *   <SkeletonLoader />          — fullskärmsskelett för schemavy
 *   <SkeletonCard />            — ett enskilt aktivitetskort
 *   <SkeletonText w="60%" />    — en textrad
 */
import React from 'react';

/** En enkel shimmer-rad */
export function SkeletonText({ width = '100%', height = '1em', className = '' }) {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/** Ett aktivitetskort-skelett */
export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card-header">
        <SkeletonText width="40%" height="0.75rem" />
        <SkeletonText width="20%" height="0.75rem" />
      </div>
      <SkeletonText width="75%" height="1rem" className="mt-2" />
      <SkeletonText width="55%" height="0.85rem" className="mt-1" />
      <div className="skeleton-image-placeholder" />
    </div>
  );
}

/** Hel schemaladdningsskelett — 3 veckor à 3 dagar */
export function SkeletonLoader() {
  return (
    <div className="skeleton-layout" role="status" aria-label="Laddar schema…">
      {/* Månadshuvud */}
      <div className="skeleton-month-header">
        <SkeletonText width="160px" height="1.5rem" />
        <div className="skeleton-month-actions">
          <SkeletonText width="32px" height="32px" className="rounded-full" />
          <SkeletonText width="32px" height="32px" className="rounded-full" />
        </div>
      </div>

      {/* 3 veckosektioner */}
      {[0, 1, 2].map((week) => (
        <div key={week} className="skeleton-week">
          <SkeletonText width="80px" height="0.75rem" className="skeleton-week-label" />
          <div className="skeleton-days">
            {[0, 1, 2].map((day) => (
              <SkeletonCard key={day} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

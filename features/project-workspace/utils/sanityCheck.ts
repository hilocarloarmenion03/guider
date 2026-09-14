/**
 * Plain keyword-overlap check (no AI).
 * Returns the names of verbs whose text has no obvious keyword overlap
 * with the Scope "In" text. Advisory only — never blocks saving.
 */
export function findUnlinkedVerbs(
  scopeIn: string | null | undefined,
  verbNames: string[]
): string[] {
  if (!scopeIn || !scopeIn.trim()) return [];

  // Normalise and extract words from scope
  const scopeWords = new Set(
    scopeIn
      .toLowerCase()
      .split(/[\s,.\-;:!?()\[\]{}"']+/)
      .filter((w) => w.length > 2) // skip trivial words
  );

  return verbNames.filter((verb) => {
    const verbWords = verb
      .toLowerCase()
      .split(/[\s,.\-;:!?()\[\]{}"']+/)
      .filter((w) => w.length > 2);

    // A verb is "linked" if any of its words appear in scope
    return !verbWords.some((w) => scopeWords.has(w));
  });
}

export default function mergeAIDiagnoses(summaries: (string | undefined)[]): string {
  const valid = summaries.filter(Boolean) as string[];
  if (valid.length === 0) return '';
  const unique = Array.from(new Set(valid));
  return unique.join('; ');
}

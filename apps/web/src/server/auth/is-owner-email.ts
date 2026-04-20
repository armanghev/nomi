export function isOwnerEmail(
  candidate: string | null | undefined,
  ownerEmail: string,
): boolean {
  return (candidate ?? "").trim().toLowerCase() === ownerEmail.trim().toLowerCase();
}

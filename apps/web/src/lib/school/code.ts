/** A friendly, unambiguous class share code (no 0/O/1/I). */
export function makeClassCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `ZEB-${s}`;
}

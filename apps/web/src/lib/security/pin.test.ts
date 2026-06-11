import { describe, expect, it } from "vitest";
import { hashPin, isValidPin, makeSalt, verifyPin } from "./pin";

describe("parent PIN", () => {
  it("accepts only 4-digit PINs", () => {
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("0000")).toBe(true);
    expect(isValidPin("123")).toBe(false);
    expect(isValidPin("12345")).toBe(false);
    expect(isValidPin("12a4")).toBe(false);
    expect(isValidPin("")).toBe(false);
  });

  it("verifies the correct PIN and rejects wrong ones", async () => {
    const salt = makeSalt();
    const hash = await hashPin("4719", salt);
    expect(await verifyPin("4719", salt, hash)).toBe(true);
    expect(await verifyPin("4718", salt, hash)).toBe(false);
    expect(await verifyPin("0000", salt, hash)).toBe(false);
  });

  it("produces different hashes for different salts (no rainbow reuse)", async () => {
    const a = await hashPin("1234", makeSalt());
    const b = await hashPin("1234", makeSalt());
    expect(a).not.toBe(b);
  });
});

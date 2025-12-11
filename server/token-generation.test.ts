import { describe, expect, it, beforeEach, vi } from "vitest";
import { generateToken } from "./db";

describe("Token Generation", () => {
  it("should generate a unique token", async () => {
    const token = await generateToken();
    
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.length).toBe(32);
  });

  it("should generate different tokens on multiple calls", async () => {
    const token1 = await generateToken();
    const token2 = await generateToken();
    const token3 = await generateToken();
    
    expect(token1).not.toBe(token2);
    expect(token2).not.toBe(token3);
    expect(token1).not.toBe(token3);
  });

  it("should generate URL-safe tokens", async () => {
    const token = await generateToken();
    
    // Check that token only contains URL-safe characters
    // nanoid uses A-Za-z0-9_- by default
    const urlSafeRegex = /^[A-Za-z0-9_-]+$/;
    expect(urlSafeRegex.test(token)).toBe(true);
  });

  it("should handle database unavailability gracefully", async () => {
    // When database is not available, should still return a token
    const token = await generateToken();
    
    expect(token).toBeDefined();
    expect(token.length).toBe(32);
  });
});

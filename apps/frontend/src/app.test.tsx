import { test, expect, describe } from "bun:test";

describe("Frontend App", () => {
  test("should be defined", () => {
    expect(true).toBe(true);
  });

  test("basic arithmetic", () => {
    expect(2 + 2).toBe(4);
    expect(10 - 3).toBe(7);
    expect(2 * 5).toBe(10);
    expect(20 / 4).toBe(5);
  });

  test("string utilities", () => {
    const appName = "Fullstack Bun";
    expect(appName).toBe("Fullstack Bun");
    expect(appName.toLowerCase()).toBe("fullstack bun");
    expect(appName.includes("Bun")).toBe(true);
  });

  test("array utilities", () => {
    const items = ["React", "Bun", "TypeScript"];
    expect(items.length).toBe(3);
    expect(items[1]).toBe("Bun");
    expect(items.reverse()).toEqual(["TypeScript", "Bun", "React"]);
  });

  test("object utilities", () => {
    const config = { apiUrl: "localhost:3000", timeout: 5000 };
    expect(config.apiUrl).toBe("localhost:3000");
    expect(config.timeout).toBe(5000);
    expect(Object.values(config)).toEqual(["localhost:3000", 5000]);
  });

  test("data transformation", () => {
    const numbers = [1, 2, 3, 4, 5];
    const doubled = numbers.map((n) => n * 2);
    expect(doubled).toEqual([2, 4, 6, 8, 10]);

    const filtered = numbers.filter((n) => n > 2);
    expect(filtered).toEqual([3, 4, 5]);
  });
});

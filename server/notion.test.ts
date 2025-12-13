import { describe, expect, it } from "vitest";
import { fetchNotionEntries } from "./notion";

describe("Notion API Integration", () => {
  it("should successfully connect to Notion and fetch entries", async () => {
    // This test validates that the Notion API credentials are correct
    // and that we can successfully fetch entries from the database
    const entries = await fetchNotionEntries();
    
    // Should return an array (even if empty)
    expect(Array.isArray(entries)).toBe(true);
    
    // If there are entries, validate the structure
    if (entries.length > 0) {
      const firstEntry = entries[0];
      expect(firstEntry).toHaveProperty("id");
      expect(firstEntry).toHaveProperty("title");
      expect(typeof firstEntry.title).toBe("string");
      expect(firstEntry.title.length).toBeGreaterThan(0);
    }
  }, 30000); // 30 second timeout for API call
});

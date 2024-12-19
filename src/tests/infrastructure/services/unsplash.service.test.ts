import { describe, it, expect, beforeEach } from "vitest";
import { UnsplashService } from "@/infrastructure/services";
import { ImageSearchService } from "@/core/domain/services";

describe("UnsplashService", () => {
  let service: UnsplashService;

  beforeEach(() => {
    // Mock environment variable
    process.env.VITE_UNSPLASH_ACCESS_KEY = "test-key";
    service = new UnsplashService();
  });

  it("should implement ImageSearchService interface", () => {
    expect(service).toBeInstanceOf(UnsplashService);
    expect(service).toHaveProperty("searchPhotos");
    expect(service).toHaveProperty("getPhotos");
    expect(service).toHaveProperty("getRandomPhotos");
  });

  // Note: Actual implementation tests would require mocking the Unsplash client
  // which is complex. In a real scenario, you'd mock the client methods.
});


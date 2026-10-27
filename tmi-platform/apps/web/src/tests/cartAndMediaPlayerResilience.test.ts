import { isPrismaTableMissingError } from "../lib/prisma";

const mockCart = {
  findUnique: jest.fn(),
};
const mockOwnership = {
  findMany: jest.fn(),
};

// prisma.ts checks globalThis.prisma directly!
(globalThis as any).prisma = {
  cart: mockCart,
  mediaPlayerChassisOwnership: mockOwnership,
};

import { getCart } from "../lib/commerce/CartService";
import { provisionDefaultMediaPlayer } from "../lib/artifacts/MediaPlayerOwnershipService";

describe("Cart & Media Player Controlled Code Resilience Certification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. isPrismaTableMissingError precision", () => {
    it("identifies specifically Prisma P2021 TableDoesNotExist errors", () => {
      const p2021CartError = {
        code: "P2021",
        meta: { modelName: "Cart", driverAdapterError: "TableDoesNotExist" },
        message: "The table `public.carts` does not exist in the current database.",
      };
      expect(isPrismaTableMissingError(p2021CartError)).toBe(true);

      const p2021ChassisError = {
        code: "P2021",
        meta: { modelName: "MediaPlayerChassisOwnership" },
        message: "The table `public.media_player_chassis_ownerships` does not exist.",
      };
      expect(isPrismaTableMissingError(p2021ChassisError)).toBe(true);
    });

    it("identifies Postgres relation does not exist error code 42P01", () => {
      const pg42P01Error = {
        code: "42P01",
        message: 'relation "carts" does not exist',
      };
      expect(isPrismaTableMissingError(pg42P01Error)).toBe(true);
    });

    it("does NOT classify generic connection / auth errors as table missing", () => {
      const timeoutError = new Error("Query timeout after 5000ms");
      const authError = { code: "P1000", message: "Authentication failed against database server" };
      const syntaxError = { code: "P2010", message: "Raw query failed: syntax error" };

      expect(isPrismaTableMissingError(timeoutError)).toBe(false);
      expect(isPrismaTableMissingError(authError)).toBe(false);
      expect(isPrismaTableMissingError(syntaxError)).toBe(false);
      expect(isPrismaTableMissingError(null)).toBe(false);
      expect(isPrismaTableMissingError(undefined)).toBe(false);
    });
  });

  describe("2. Cart Resilience under P2021 vs Unexpected Errors", () => {
    it("returns degraded empty cart when public.carts is missing (P2021 TableDoesNotExist)", async () => {
      mockCart.findUnique.mockRejectedValueOnce({
        code: "P2021",
        meta: { modelName: "Cart" },
        message: "The table `public.carts` does not exist in the current database.",
      });

      const result = await getCart("test-user-123");

      expect(result.itemCount).toBe(0);
      expect(result.items).toEqual([]);
      expect(result.subtotalCents).toBe(0);
      expect(result.degradedMode).toBe(true);
    });

    it("re-throws unexpected database errors so outages remain observable", async () => {
      mockCart.findUnique.mockRejectedValueOnce(
        new Error("Query timeout after 5000ms")
      );

      await expect(getCart("test-user-123")).rejects.toThrow("Query timeout after 5000ms");
    });
  });

  describe("3. Media Player Resilience under P2021 vs Unexpected Errors", () => {
    it("returns canonical starter chassis when media_player_chassis_ownerships is missing (P2021)", async () => {
      mockOwnership.findMany.mockRejectedValueOnce({
        code: "P2021",
        meta: { modelName: "MediaPlayerChassisOwnership" },
        message: "The table `public.media_player_chassis_ownerships` does not exist in the current database.",
      });

      const result = await provisionDefaultMediaPlayer("test-user-123");

      expect(result.ownedChassisIds.length).toBe(4);
      expect(result.ownedChassisIds).toContain("standard");
      expect(result.ownedChassisIds).toContain("tmi_classic");
      expect(result.ownedChassisIds).toContain("tmi_dark");
      expect(result.ownedChassisIds).toContain("tmi_neon");
      expect(result.degradedMode).toBe(true);
    });

    it("re-throws unexpected database errors on media player queries so outages are not masked", async () => {
      mockOwnership.findMany.mockRejectedValueOnce(
        new Error("password authentication failed for user")
      );

      await expect(provisionDefaultMediaPlayer("test-user-123")).rejects.toThrow(
        "password authentication failed for user"
      );
    });
  });
});

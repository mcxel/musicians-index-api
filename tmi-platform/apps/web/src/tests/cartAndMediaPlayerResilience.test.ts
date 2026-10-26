import { isPrismaTableMissingError } from "../lib/prisma";
import { getCart } from "../lib/commerce/CartService";
import { provisionDefaultMediaPlayer } from "../lib/artifacts/MediaPlayerOwnershipService";

// Mock Prisma client methods specifically
jest.mock("../lib/prisma", () => {
  const actual = jest.requireActual("../lib/prisma");
  return {
    ...actual,
    __esModule: true,
    default: {
      cart: {
        findUnique: jest.fn(),
      },
      mediaPlayerChassisOwnership: {
        findMany: jest.fn(),
      },
    },
  };
});

import prisma from "../lib/prisma";

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
      expect(isPrismaTableMissingError(p2021CartError, "cart")).toBe(true);
      expect(isPrismaTableMissingError(p2021CartError, "media_player")).toBe(false);

      const p2021MpError = {
        code: "P2021",
        meta: { modelName: "MediaPlayerChassisOwnership", driverAdapterError: "TableDoesNotExist" },
        message: "The table `public.media_player_chassis_ownerships` does not exist in the current database.",
      };
      expect(isPrismaTableMissingError(p2021MpError)).toBe(true);
      expect(isPrismaTableMissingError(p2021MpError, "media_player")).toBe(true);
      expect(isPrismaTableMissingError(p2021MpError, "cart")).toBe(false);
    });

    it("rejects non-P2021 / unexpected errors so they are NOT swallowed", () => {
      // Connection termination
      const connectionError = new Error("Connection terminated unexpectedly");
      expect(isPrismaTableMissingError(connectionError)).toBe(false);

      // P2002 Unique constraint
      const p2002 = { code: "P2002", message: "Unique constraint failed" };
      expect(isPrismaTableMissingError(p2002)).toBe(false);

      // P2025 Record not found
      const p2025 = { code: "P2025", message: "Record to update not found." };
      expect(isPrismaTableMissingError(p2025)).toBe(false);

      // P1001 Cannot reach database server
      const p1001 = { code: "P1001", message: "Can't reach database server at localhost:5432" };
      expect(isPrismaTableMissingError(p1001)).toBe(false);
    });
  });

  describe("2. Cart Resilience under P2021 vs Unexpected Errors", () => {
    it("returns degraded empty cart when public.carts is missing (P2021 TableDoesNotExist)", async () => {
      const p2021CartError = {
        code: "P2021",
        meta: { modelName: "Cart", driverAdapterError: "TableDoesNotExist" },
        message: "The table `public.carts` does not exist in the current database.",
      };
      (prisma.cart.findUnique as jest.Mock).mockRejectedValueOnce(p2021CartError);

      const cart = await getCart("test-user-id");
      expect(cart).toEqual({
        items: [],
        subtotalCents: 0,
        itemCount: 0,
        degradedMode: true,
        degradedReason: "CART_SCHEMA_UNAVAILABLE",
      });
    });

    it("re-throws unexpected database errors so outages remain observable", async () => {
      const timeoutError = new Error("Query timeout after 5000ms");
      (prisma.cart.findUnique as jest.Mock).mockRejectedValueOnce(timeoutError);

      await expect(getCart("test-user-id")).rejects.toThrow("Query timeout after 5000ms");
    });
  });

  describe("3. Media Player Resilience under P2021 vs Unexpected Errors", () => {
    it("returns canonical starter chassis when media_player_chassis_ownerships is missing (P2021)", async () => {
      const p2021MpError = {
        code: "P2021",
        meta: { modelName: "MediaPlayerChassisOwnership", driverAdapterError: "TableDoesNotExist" },
        message: "The table `public.media_player_chassis_ownerships` does not exist in the current database.",
      };
      (prisma.mediaPlayerChassisOwnership.findMany as jest.Mock).mockRejectedValueOnce(p2021MpError);

      const ownership = await provisionDefaultMediaPlayer("test-user-id");
      expect(ownership).toEqual({
        userId: "test-user-id",
        ownedChassisIds: ["standard", "tmi_classic", "tmi_dark", "tmi_neon"],
        equippedChassisId: "standard",
        pointsBalance: 0,
        degradedMode: true,
        degradedReason: "MEDIA_PLAYER_SCHEMA_UNAVAILABLE",
      });
    });

    it("re-throws unexpected database errors on media player queries so outages are not masked", async () => {
      const authError = new Error("password authentication failed for user");
      (prisma.mediaPlayerChassisOwnership.findMany as jest.Mock).mockRejectedValueOnce(authError);

      await expect(provisionDefaultMediaPlayer("test-user-id")).rejects.toThrow(
        "password authentication failed for user",
      );
    });
  });
});

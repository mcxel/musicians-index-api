/**
 * CountryRoomBalancer.ts
 *
 * Room balancing by country and timezone
 * - Register rooms in countries
 * - Balance load across regions
 * - Find active rooms by location
 */

export interface RoomRegistration {
  roomId: string;
  countryCode: string;
  city: string;
  timezone: string;
  genres: string[];
  userCount: number;
  isLive: boolean;
  maxCapacity: number;
  language: string;
  timestamp: number;
}

const roomsByCountry = new Map<string, RoomRegistration[]>();
const roomsById = new Map<string, RoomRegistration>();

export class CountryRoomBalancer {
  /**
   * Register a room in a country
   */
  static registerRoom(
    roomId: string,
    countryCode: string,
    city: string,
    genres: string[],
    timezone = 'UTC',
    language = 'en',
    maxCapacity = 1000
  ): void {
    const registration: RoomRegistration = {
      roomId,
      countryCode: countryCode.toUpperCase(),
      city,
      timezone,
      genres,
      userCount: 0,
      isLive: false,
      maxCapacity,
      language,
      timestamp: Date.now(),
    };

    roomsById.set(roomId, registration);

    const rooms = roomsByCountry.get(countryCode) || [];
    rooms.push(registration);
    roomsByCountry.set(countryCode, rooms);
  }

  /**
   * Update room user count
   */
  static updateRoomUsers(roomId: string, userCount: number): void {
    const room = roomsById.get(roomId);
    if (room) {
      room.userCount = userCount;
      room.isLive = userCount > 0;
    }
  }

  /**
   * Get all rooms in a country
   */
  static getRoomsInCountry(countryCode: string): RoomRegistration[] {
    return roomsByCountry.get(countryCode.toUpperCase()) || [];
  }

  /**
   * Get rooms in country sorted by activity
   */
  static getActiveRoomsByCountry(countryCode: string): RoomRegistration[] {
    const rooms = this.getRoomsInCountry(countryCode);
    return rooms.sort((a, b) => b.userCount - a.userCount);
  }

  /**
   * Get rooms by genre in country
   */
  static getRoomsByGenre(countryCode: string, genre: string): RoomRegistration[] {
    const rooms = this.getRoomsInCountry(countryCode);
    return rooms.filter((r) =>
      r.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }

  /**
   * Get rooms by city
   */
  static getRoomsByCity(countryCode: string, city: string): RoomRegistration[] {
    const rooms = this.getRoomsInCountry(countryCode);
    return rooms.filter((r) => r.city.toLowerCase() === city.toLowerCase());
  }

  /**
   * Get room details
   */
  static getRoom(roomId: string): RoomRegistration | undefined {
    return roomsById.get(roomId);
  }

  /**
   * Remove room
   */
  static removeRoom(roomId: string): void {
    const room = roomsById.get(roomId);
    if (room) {
      const rooms = roomsByCountry.get(room.countryCode) || [];
      const index = rooms.findIndex((r) => r.roomId === roomId);
      if (index >= 0) {
        rooms.splice(index, 1);
      }
      roomsById.delete(roomId);
    }
  }

  /**
   * Get rooms that need balancing (quiet countries)
   */
  static getRoomsNeedingFallback(
    countryCode: string,
    minRooms = 3
  ): RoomRegistration[] {
    const rooms = this.getActiveRoomsByCountry(countryCode);
    if (rooms.length >= minRooms) {
      return [];
    }
    // Return empty - caller will fetch from nearby countries
    return [];
  }

  /**
   * Get total room count
   */
  static getTotalRoomCount(): number {
    return roomsById.size;
  }

  /**
   * Get room count by country
   */
  static getRoomCountByCountry(countryCode: string): number {
    return this.getRoomsInCountry(countryCode).length;
  }

  /**
   * Get average capacity usage by country
   */
  static getAverageCapacityUsage(countryCode: string): number {
    const rooms = this.getRoomsInCountry(countryCode);
    if (rooms.length === 0) return 0;
    const totalUsage = rooms.reduce((sum, r) => sum + r.userCount / r.maxCapacity, 0);
    return Math.round((totalUsage / rooms.length) * 100);
  }

  /**
   * Get peak hours for country
   */
  static getPeakHours(countryCode: string): number[] {
    // Simple implementation - would need time-series data in production
    return [18, 19, 20, 21, 22, 23];
  }

  /**
   * Clear all rooms (for testing)
   */
  static clearAll(): void {
    roomsByCountry.clear();
    roomsById.clear();
  }
}

export default CountryRoomBalancer;

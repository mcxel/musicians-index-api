import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Venue Booking Recommendation Engine — Phase 4 Full Implementation
 *
 * Scoring formula (locked):
 *   finalScore = distanceFit(0-25) + genreFit(0-20) + availabilityFit(0-15) + budgetFit(0-15)
 *              + underservedBoost(0-15) + participationBoost(0-5) + subscriptionBoost(0-5)
 *              - repeatPenalty(-20) - recentBookingPenalty(-10)
 *
 * Tags: FRESH_PICK, UNDISCOVERED, RISING, COOLDOWN_BLOCKED, HIGH_PARTICIPATION
 * Cooldown: 30-90 days same venue+artist, admin-configurable via BookingRules
 */

export interface BookingRequestDto {
  venueProfileId: string;
  venueUserId: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  genres: string[];
  eventDate: Date;
  budgetMin: number;
  budgetMax: number;
  eventType?: string;
  note?: string;
  limit?: number;
}

export interface ArtistCandidate {
  artistUserId: string;
  artistProfileId: string | null;
  name: string;
  genres: string[];
  distanceKm: number;
  score: number;
  scoreBreakdown: {
    distanceScore: number;
    genreScore: number;
    availabilityScore: number;
    budgetScore: number;
    exposureBoost: number;
    participationBoost: number;
    subscriptionBoost: number;
    repeatPenalty: number;
    recentBookingPenalty: number;
  };
  tags: string[];
  isFirstTimeForVenue: boolean;
  isCooldownBlocked: boolean;
}

export interface SendOfferDto {
  requestId?: string;
  venueUserId: string;
  artistUserId: string;
  eventDate: Date;
  budgetCents: number;
  currency?: string;
  message?: string;
}

// Haversine distance formula (returns km)
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class VenueBookingService {
  private readonly logger = new Logger(VenueBookingService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Recommendation Engine ────────────────────────────────────────────────

  /**
   * Main recommendation engine entry point.
   * Persists BookingRequest + BookingMatch rows, returns ranked candidates.
   */
  async getRecommendations(dto: BookingRequestDto): Promise<ArtistCandidate[]> {
    this.logger.log(`Recommendation request for venue ${dto.venueProfileId}`);

    // Load venue booking rules (admin-configurable cooldown)
    const rules = await this.prisma.bookingRules.findUnique({
      where: { venueProfileId: dto.venueProfileId },
    });
    const minPoolSize = rules?.minPoolSize ?? 5;
    const exposureThreshold = rules?.exposureBoostThreshold ?? 100;
    const repeatPenaltyPts = rules?.repeatPenaltyPoints ?? 20;
    const recentBookingPenaltyPts = rules?.recentBookingPenalty ?? 10;

    // Persist the booking request
    const bookingRequest = await this.prisma.bookingRequest.create({
      data: {
        venueProfileId: dto.venueProfileId,
        venueUserId: dto.venueUserId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        radiusKm: dto.radiusKm,
        genres: dto.genres,
        eventDate: dto.eventDate,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        eventType: (dto.eventType as any) ?? 'LOCAL',
        note: dto.note,
        status: 'OPEN',
      },
    });

    // Load all artists with territory + exposure stats + profile
    const artists = await this.prisma.user.findMany({
      where: { role: 'ARTIST' },
      include: {
        artistProfile: true,
        artistTerritory: { include: { availability: true } },
        artistExposureStats: true,
        subscriptions: { where: { status: 'active' }, take: 1 },
      },
      take: 200,
    });

    // Load venue cooldown history
    const cooldownHistory = await this.prisma.venueArtistHistory.findMany({
      where: { venueProfileId: dto.venueProfileId },
    });
    const cooldownMap = new Map<string, Date>();
    for (const h of cooldownHistory) {
      cooldownMap.set(h.artistUserId, h.cooldownUntil);
    }

    const now = new Date();
    const candidates: ArtistCandidate[] = [];

    for (const artist of artists) {
      const territory = artist.artistTerritory;
      const exposure = artist.artistExposureStats;
      const profile = artist.artistProfile;

      // Skip artists with no territory set (not bookable)
      if (!territory) continue;

      // ── Distance Score (0-25) ──────────────────────────────────────────
      let distanceKm = 9999;
      let distanceScore = 0;
      if (territory.homeLatitude != null && territory.homeLongitude != null) {
        distanceKm = haversineKm(
          dto.latitude,
          dto.longitude,
          territory.homeLatitude,
          territory.homeLongitude,
        );
        if (distanceKm <= dto.radiusKm) {
          distanceScore = Math.max(0, 25 * (1 - distanceKm / dto.radiusKm));
        } else if (territory.willingToTravelNational || territory.willingToTravelIntl || territory.onlineAvailable) {
          distanceScore = 5; // small bonus for flexible artists
        } else {
          continue; // outside radius and not flexible — skip
        }
      } else if (territory.onlineAvailable) {
        distanceKm = 0;
        distanceScore = 10; // online artist
      } else {
        continue; // no location data and not online — skip
      }

      // ── Genre Score (0-20) ────────────────────────────────────────────
      const artistGenres: string[] = profile?.genres ?? [];
      const matchedGenres = dto.genres.filter((g) =>
        artistGenres.map((ag) => ag.toLowerCase()).includes(g.toLowerCase()),
      );
      const genreScore =
        dto.genres.length > 0
          ? Math.min(20, (matchedGenres.length / dto.genres.length) * 20)
          : 10;

      // ── Availability Score (0-15) ─────────────────────────────────────
      const eventDateStr = dto.eventDate.toISOString().split('T')[0];
      const availEntry = territory.availability.find(
        (a) => a.date.toISOString().split('T')[0] === eventDateStr,
      );
      let availabilityScore = 10; // default: unknown = neutral
      if (availEntry !== undefined) {
        availabilityScore = availEntry.isAvailable ? 15 : 0;
      }

      // ── Budget Score (0-15) ───────────────────────────────────────────
      let budgetScore = 0;
      if (territory.budgetMax === 0) {
        // negotiable — give partial score
        budgetScore = 10;
      } else if (
        territory.budgetMin <= dto.budgetMax &&
        territory.budgetMax >= dto.budgetMin
      ) {
        budgetScore = 15; // budget overlap
      } else if (territory.budgetMin <= dto.budgetMax) {
        budgetScore = 7; // partial overlap
      }

      // ── Exposure Boost (0-15) ─────────────────────────────────────────
      const totalViews = exposure?.totalViews ?? 0;
      const underservedScore = exposure?.underservedScore ?? 100;
      let exposureBoost = 0;
      if (totalViews < exposureThreshold) {
        exposureBoost = Math.min(15, (underservedScore / 100) * 15);
      }

      // ── Participation Boost (0-5) ─────────────────────────────────────
      const totalBookings = exposure?.totalBookings ?? 0;
      const participationBoost = totalBookings > 0 ? Math.min(5, totalBookings * 0.5) : 0;

      // ── Subscription Boost (0-5) ──────────────────────────────────────
      const hasActiveSub = artist.subscriptions.length > 0;
      const subscriptionBoost = hasActiveSub ? 5 : 0;

      // ── Cooldown / Repeat Penalties ───────────────────────────────────
      const cooldownUntil = cooldownMap.get(artist.id);
      const isCooldownBlocked = cooldownUntil ? cooldownUntil > now : false;
      const isFirstTime = !cooldownMap.has(artist.id);

      const repeatPenalty = !isFirstTime ? -repeatPenaltyPts : 0;
      const recentBookingPenalty = isCooldownBlocked ? -recentBookingPenaltyPts : 0;

      // ── Final Score ───────────────────────────────────────────────────
      const score =
        distanceScore +
        genreScore +
        availabilityScore +
        budgetScore +
        exposureBoost +
        participationBoost +
        subscriptionBoost +
        repeatPenalty +
        recentBookingPenalty;

      // ── Tags ──────────────────────────────────────────────────────────
      const tags: string[] = [];
      if (isFirstTime) tags.push('FRESH_PICK');
      if (totalViews < exposureThreshold) tags.push('UNDISCOVERED');
      if (totalBookings >= 5) tags.push('HIGH_PARTICIPATION');
      if (isCooldownBlocked) tags.push('COOLDOWN_BLOCKED');
      if (profile?.followers != null && profile.followers > 1000) tags.push('RISING');

      candidates.push({
        artistUserId: artist.id,
        artistProfileId: profile?.id ?? null,
        name: profile?.stageName ?? artist.name ?? 'Unknown',
        genres: artistGenres,
        distanceKm,
        score,
        scoreBreakdown: {
          distanceScore,
          genreScore,
          availabilityScore,
          budgetScore,
          exposureBoost,
          participationBoost,
          subscriptionBoost,
          repeatPenalty,
          recentBookingPenalty,
        },
        tags,
        isFirstTimeForVenue: isFirstTime,
        isCooldownBlocked,
      });
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    // Apply cooldown filter (relax if pool too small)
    const available = candidates.filter((c) => !c.isCooldownBlocked);
    const finalList = available.length >= minPoolSize ? available : candidates;
    if (available.length < minPoolSize) {
      this.logger.warn(
        `Artist pool too small (${available.length}), relaxing cooldown filter`,
      );
    }

    const limited = finalList.slice(0, dto.limit ?? 20);

    // Persist BookingMatch rows
    if (limited.length > 0) {
      await this.prisma.bookingMatch.createMany({
        data: limited.map((c) => ({
          requestId: bookingRequest.id,
          artistUserId: c.artistUserId,
          artistProfileId: c.artistProfileId,
          distanceKm: c.distanceKm,
          score: c.score,
          distanceScore: c.scoreBreakdown.distanceScore,
          genreScore: c.scoreBreakdown.genreScore,
          availabilityScore: c.scoreBreakdown.availabilityScore,
          budgetScore: c.scoreBreakdown.budgetScore,
          exposureBoost: c.scoreBreakdown.exposureBoost,
          participationBoost: c.scoreBreakdown.participationBoost,
          subscriptionBoost: c.scoreBreakdown.subscriptionBoost,
          repeatPenalty: c.scoreBreakdown.repeatPenalty,
          recentBookingPenalty: c.scoreBreakdown.recentBookingPenalty,
          tags: c.tags,
          isFirstTimeForVenue: c.isFirstTimeForVenue,
          isCooldownBlocked: c.isCooldownBlocked,
        })),
        skipDuplicates: true,
      });

      // Update request status to MATCHED
      await this.prisma.bookingRequest.update({
        where: { id: bookingRequest.id },
        data: { status: 'MATCHED' },
      });
    }

    return limited;
  }

  // ─── Offer Flow ───────────────────────────────────────────────────────────

  /**
   * Send a booking offer from venue to artist.
   */
  async sendOffer(dto: SendOfferDto): Promise<{ success: boolean; offerId: string }> {
    const offer = await this.prisma.bookingOffer.create({
      data: {
        requestId: dto.requestId ?? null,
        venueUserId: dto.venueUserId,
        artistUserId: dto.artistUserId,
        eventDate: dto.eventDate,
        budgetCents: dto.budgetCents,
        currency: dto.currency ?? 'USD',
        message: dto.message,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
    this.logger.log(`Offer ${offer.id} sent to artist ${dto.artistUserId}`);
    return { success: true, offerId: offer.id };
  }

  /**
   * Artist accepts a booking offer.
   * Creates BookingHistory + VenueArtistHistory (cooldown) + updates exposure stats.
   */
  async acceptOffer(offerId: string, artistUserId: string): Promise<{ success: boolean }> {
    const offer = await this.prisma.bookingOffer.findUnique({
      where: { id: offerId },
      include: { request: { include: { venueProfile: true } } },
    });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.artistUserId !== artistUserId) throw new ForbiddenException('Not your offer');
    if (offer.status !== 'PENDING') {
      return { success: false };
    }

    const venueProfileId = offer.request?.venueProfileId ?? '';

    // Load cooldown rules
    const rules = venueProfileId
      ? await this.prisma.bookingRules.findUnique({ where: { venueProfileId } })
      : null;
    const cooldownDays = rules?.cooldownDays ?? 30;

    await this.prisma.$transaction([
      // Update offer status
      this.prisma.bookingOffer.update({
        where: { id: offerId },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
      }),
      // Create booking history
      this.prisma.bookingHistory.create({
        data: {
          offerId,
          venueProfileId,
          artistUserId,
          eventDate: offer.eventDate,
          budgetCents: offer.budgetCents,
          currency: offer.currency,
          eventType: 'LOCAL',
          confirmedAt: new Date(),
        },
      }),
      // Create/update cooldown record
      this.prisma.venueArtistHistory.create({
        data: {
          venueProfileId,
          artistUserId,
          bookedAt: new Date(),
          cooldownUntil: new Date(Date.now() + cooldownDays * 86400000),
          cooldownDays,
        },
      }),
    ]);

    // Update exposure stats (upsert)
    await this.prisma.artistExposureStats.upsert({
      where: { userId: artistUserId },
      create: {
        userId: artistUserId,
        totalBookings: 1,
        totalShows: 0,
        totalViews: 0,
        underservedScore: 85, // slightly less underserved after first booking
        lastBookedAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        totalBookings: { increment: 1 },
        underservedScore: { decrement: 10 }, // reduce underserved score after booking
        lastBookedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Offer ${offerId} accepted by artist ${artistUserId}`);
    return { success: true };
  }

  /**
   * Artist declines a booking offer.
   */
  async declineOffer(offerId: string, artistUserId: string): Promise<{ success: boolean }> {
    const offer = await this.prisma.bookingOffer.findUnique({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.artistUserId !== artistUserId) throw new ForbiddenException('Not your offer');
    if (offer.status !== 'PENDING') return { success: false };

    await this.prisma.bookingOffer.update({
      where: { id: offerId },
      data: { status: 'DECLINED', respondedAt: new Date() },
    });

    this.logger.log(`Offer ${offerId} declined by artist ${artistUserId}`);
    return { success: true };
  }

  // ─── History & Offers ─────────────────────────────────────────────────────

  /**
   * Get booking history for a venue.
   */
  async getVenueBookingHistory(venueProfileId: string) {
    return this.prisma.bookingHistory.findMany({
      where: { venueProfileId },
      orderBy: { eventDate: 'desc' },
      take: 50,
    });
  }

  /**
   * Get booking history for an artist (by userId).
   */
  async getArtistBookingHistory(artistUserId: string) {
    return this.prisma.bookingHistory.findMany({
      where: { artistUserId },
      orderBy: { eventDate: 'desc' },
      take: 50,
    });
  }

  /**
   * Get pending offers for an artist.
   */
  async getArtistPendingOffers(artistUserId: string) {
    return this.prisma.bookingOffer.findMany({
      where: { artistUserId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get pending offers sent by a venue.
   */
  async getVenuePendingOffers(venueUserId: string) {
    return this.prisma.bookingOffer.findMany({
      where: { venueUserId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Admin Controls ───────────────────────────────────────────────────────

  /**
   * Admin: upsert cooldown rules for a venue.
   */
  async updateCooldownRules(
    venueProfileId: string,
    cooldownDays: number,
    opts?: { maxCooldownDays?: number; minPoolSize?: number },
  ) {
    const rules = await this.prisma.bookingRules.upsert({
      where: { venueProfileId },
      create: {
        venueProfileId,
        cooldownDays,
        maxCooldownDays: opts?.maxCooldownDays ?? 90,
        minPoolSize: opts?.minPoolSize ?? 5,
        updatedAt: new Date(),
      },
      update: {
        cooldownDays,
        ...(opts?.maxCooldownDays ? { maxCooldownDays: opts.maxCooldownDays } : {}),
        ...(opts?.minPoolSize ? { minPoolSize: opts.minPoolSize } : {}),
        updatedAt: new Date(),
      },
    });
    return { success: true, rules };
  }

  /**
   * Admin: get exposure balance analytics.
   * Returns fairness metrics across all artists.
   */
  async getExposureBalanceReport() {
    const stats = await this.prisma.artistExposureStats.findMany({
      orderBy: { underservedScore: 'desc' },
      take: 100,
    });

    const totalArtists = stats.length;
    const avgUnderserved =
      totalArtists > 0
        ? stats.reduce((sum, s) => sum + s.underservedScore, 0) / totalArtists
        : 0;
    const highlyUnderserved = stats.filter((s) => s.underservedScore > 70).length;
    const overexposed = stats.filter((s) => s.underservedScore < 20).length;

    return {
      totalArtists,
      avgUnderservedScore: Math.round(avgUnderserved * 100) / 100,
      highlyUnderservedCount: highlyUnderserved,
      overexposedCount: overexposed,
      diversityScore: Math.round(avgUnderserved), // 0-100, higher = more diverse
      artists: stats.map((s) => ({
        userId: s.userId,
        totalViews: s.totalViews,
        totalBookings: s.totalBookings,
        underservedScore: s.underservedScore,
        lastBookedAt: s.lastBookedAt,
      })),
    };
  }
}

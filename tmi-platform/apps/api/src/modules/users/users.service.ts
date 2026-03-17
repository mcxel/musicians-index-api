import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { OnboardingState, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { EditorialService } from "../editorial/editorial.service";
import type { UpdateMeDto } from "./dto/update-me.dto";
import type { SelectRoleDto } from "./dto/select-role.dto";
import type { CreateOfficialLinkDto } from "./dto/create-official-link.dto";

const SESSION_COOKIE = "phase11_session";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly editorialService: EditorialService,
  ) {}

  async resolveUserBySessionToken(sessionToken: string | undefined) {
    if (!sessionToken) {
      throw new UnauthorizedException("Missing session");
    }

    const session = await this.authService.getSession(sessionToken);
    if (!session) {
      throw new UnauthorizedException("Invalid session");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        onboardingState: true,
        canSubmitOfficialPlatformLinks: true,
        name: true,
        image: true,
      },
    });

    if (!user?.email) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }

  private computeOnboardingState(role: Role, dto: UpdateMeDto): OnboardingState {
    // Minimal Phase 14 completion rule: role + non-empty profile name.
    if (!dto.name?.trim()) {
      return OnboardingState.INCOMPLETE;
    }

    if (role === Role.ARTIST && !dto.bio?.trim()) {
      return OnboardingState.INCOMPLETE;
    }

    return OnboardingState.COMPLETE;
  }

  private toMeResponse(user: {
    id: string;
    email: string;
    role: Role;
    onboardingState: OnboardingState;
    profileArticleSlug?: string | null;
  }) {
    return {
      user: {
        id: user.id,
        email: user.email,
        role: this.authService.mapRole(user.role, user.onboardingState),
        onboardingState: this.authService.mapOnboardingState(user.onboardingState),
        profileArticleSlug: user.profileArticleSlug ?? null,
      },
    };
  }

  async getMeFromSession(sessionToken: string | undefined) {
    const user = await this.resolveUserBySessionToken(sessionToken);

    let profileArticleSlug: string | null = null;
    if (user.role === Role.ARTIST) {
      const artistProfile = await this.prisma.artist.findUnique({
        where: { userId: user.id },
        select: { profileArticle: { select: { slug: true } } },
      });
      profileArticleSlug = artistProfile?.profileArticle?.slug ?? null;
    }

    return this.toMeResponse({
      id: user.id,
      email: user.email,
      role: user.role,
      onboardingState: user.onboardingState,
      profileArticleSlug,
    });
  }

  async selectRole(sessionToken: string | undefined, dto: SelectRoleDto) {
    const user = await this.resolveUserBySessionToken(sessionToken);
    const normalizedRole = dto.role.trim().toLowerCase();

    if (user.role === Role.ADMIN) {
      throw new ForbiddenException("Admin accounts cannot use self-serve role selection");
    }

    if (normalizedRole === "admin") {
      throw new ForbiddenException("Admin role cannot be self-selected");
    }

    if (normalizedRole !== "fan" && normalizedRole !== "artist") {
      throw new BadRequestException("Unsupported onboarding role");
    }

    if (user.onboardingState === OnboardingState.COMPLETE) {
      throw new ForbiddenException("Role cannot be changed after onboarding is complete");
    }

    if (user.role === Role.ARTIST && normalizedRole === "artist") {
      throw new BadRequestException("Role already selected");
    }

    // Explicit Phase 14 guardrail: admin cannot be self-selected.
    if (normalizedRole === "artist") {
      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          role: Role.ARTIST,
          onboardingState: OnboardingState.INCOMPLETE,
          onboardingCompletedAt: null,
        },
        select: {
          id: true,
          email: true,
          role: true,
          onboardingState: true,
        },
      });
      return this.toMeResponse(updated);
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: Role.USER,
        onboardingState: OnboardingState.INCOMPLETE,
        onboardingCompletedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        onboardingState: true,
      },
    });

    return this.toMeResponse(updated);
  }

  async updateMe(sessionToken: string | undefined, dto: UpdateMeDto) {
    const user = await this.resolveUserBySessionToken(sessionToken);

    if (dto.bio?.trim() && user.role !== Role.ARTIST) {
      throw new ForbiddenException("Only artist accounts can update bio");
    }

    const onboardingState = this.computeOnboardingState(user.role, dto);

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: dto.name,
        image: dto.image,
        onboardingState,
        onboardingCompletedAt: onboardingState === OnboardingState.COMPLETE ? new Date() : null,
        artistProfile:
          user.role === Role.ARTIST
            ? {
                upsert: {
                  create: {
                    name: dto.name?.trim() || user.email,
                    bio: dto.bio,
                  },
                  update: {
                    name: dto.name?.trim() || undefined,
                    bio: dto.bio,
                  },
                },
              }
            : undefined,
      },
      select: {
        id: true,
        email: true,
        role: true,
        onboardingState: true,
        artistProfile: { select: { id: true } },
      },
    });

    let profileArticleSlug: string | null = null;
    if (onboardingState === OnboardingState.COMPLETE && user.role === Role.ARTIST) {
      const artistId = updated.artistProfile?.id;
      if (artistId) {
        const articleInfo = await this.editorialService.ensureArtistProfileArticle(
          artistId,
          dto.name?.trim() || user.email,
          dto.bio?.trim() || '',
          user.id,
        );
        profileArticleSlug = articleInfo.slug;
      }
    }

    return this.toMeResponse({
      id: updated.id,
      email: updated.email,
      role: updated.role,
      onboardingState: updated.onboardingState,
      profileArticleSlug,
    });
  }

  async createOfficialLink(sessionToken: string | undefined, dto: CreateOfficialLinkDto) {
    const user = await this.resolveUserBySessionToken(sessionToken);

    if (user.role !== Role.ARTIST) {
      throw new ForbiddenException("Only artist accounts can submit official platform links");
    }

    if (user.onboardingState !== OnboardingState.COMPLETE) {
      throw new ForbiddenException("Complete onboarding before submitting official platform links");
    }

    if (!user.canSubmitOfficialPlatformLinks) {
      throw new ForbiddenException("Not allowed to submit official platform links");
    }

    const artistProfile = await this.prisma.artist.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!artistProfile) {
      throw new BadRequestException("Artist profile is required for official link submission");
    }

    const link = await this.prisma.musicLink.create({
      data: {
        platform: dto.platform.trim(),
        url: dto.url,
        artistId: artistProfile.id,
        addedById: user.id,
      },
      select: {
        id: true,
        platform: true,
        url: true,
      },
    });

    return { ok: true, link };
  }

  async acceptOriginalityAgreement(sessionToken: string | undefined) {
    const user = await this.resolveUserBySessionToken(sessionToken);

    if (user.role !== Role.ARTIST) {
      throw new ForbiddenException("Only artists need to accept the originality agreement.");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        acceptedOriginalityAgreementAt: new Date(),
      },
    });

    return { ok: true };
  }

  static sessionCookieName() {
    return SESSION_COOKIE;
  }
}

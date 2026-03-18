import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { randomBytes, randomUUID } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { OnboardingState, Role } from "@prisma/client";

export type SessionRole = "fan" | "artist" | "admin" | null;
export type SessionOnboardingState = "no_role_selected" | "incomplete" | "complete";

type SessionRecord = {
  token: string;
  user: {
    id: string;
    email: string;
    role: SessionRole;
    onboardingState: SessionOnboardingState;
  };
  expires: string;
};

@Injectable()
export class AuthService {
  readonly sessionStoreMode = "prisma-postgres";

  constructor(private readonly prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  }

  issueCsrfToken(): string {
    return randomBytes(24).toString("hex");
  }

  async readiness() {
    let persistenceAvailable = false;
    try {
      await this.prisma.$queryRawUnsafe("SELECT 1");
      persistenceAvailable = true;
    } catch {
      persistenceAvailable = false;
    }

    return {
      sessionStore: this.sessionStoreMode,
      persistenceAvailable,
      passwordHasher: "bcryptjs",
    };
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  mapRole(role: Role | null | undefined, onboardingState?: OnboardingState | null): SessionRole {
    if (onboardingState === OnboardingState.NO_ROLE_SELECTED && role === Role.USER) {
      return null;
    }
    if (role === Role.ADMIN) return "admin";
    if (role === Role.ARTIST) return "artist";
    if (role === Role.USER) return "fan";
    return null;
  }

  mapOnboardingState(state: OnboardingState | null | undefined): SessionOnboardingState {
    if (state === OnboardingState.COMPLETE) return "complete";
    if (state === OnboardingState.INCOMPLETE) return "incomplete";
    return "no_role_selected";
  }

  async register(email: string, password: string) {
    const normalized = this.normalizeEmail(email);

    const existing = await this.prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("User already exists");
    }

    const user = await this.prisma.user.create({
      data: {
        email: normalized,
        passwordHash: await this.hashPassword(password),
      },
      select: {
        id: true,
        email: true,
      },
    });

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async login(email: string, password: string) {
    const normalized = this.normalizeEmail(email);

    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        onboardingState: true,
      },
    });

    if (!user?.passwordHash || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const created = await this.prisma.session.create({
      data: {
        sessionToken: randomUUID(),
        userId: user.id,
        expires: expiresAt,
      },
      select: {
        sessionToken: true,
      },
    });

    return {
      sessionToken: created.sessionToken,
      user: {
        id: user.id,
        email: user.email ?? normalized,
        role: this.mapRole(user.role, user.onboardingState),
        onboardingState: this.mapOnboardingState(user.onboardingState),
      },
      expires: expiresAt.toISOString(),
    };
  }

  async logout(token: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { sessionToken: token } });
  }

  async getSession(token: string): Promise<SessionRecord | null> {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken: token },
      select: {
        sessionToken: true,
        expires: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            onboardingState: true,
          },
        },
      },
    });

    if (!session) return null;

    if (!session.user.email) {
      return null;
    }

    if (session.expires.getTime() < Date.now()) {
      await this.prisma.session.deleteMany({ where: { sessionToken: token } });
      return null;
    }

    return {
      token: session.sessionToken,
      expires: session.expires.toISOString(),
      user: {
        id: session.user.id,
        email: session.user.email,
        role: this.mapRole(session.user.role, session.user.onboardingState),
        onboardingState: this.mapOnboardingState(session.user.onboardingState),
      },
    };
  }

  async debugUserLookup(email: string) {
    const normalized = this.normalizeEmail(email);

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: normalized },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          role: true,
          onboardingState: true,
        },
      });

      return {
        ok: true,
        step: "findUnique(user)",
        normalized,
        user,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        step: "findUnique(user)",
        normalized,
        error: message,
      };
    }
  }

  async debugCreateUser(email: string, password: string) {
    const normalized = this.normalizeEmail(email);

    try {
      const passwordHash = await this.hashPassword(password);
      const created = await this.prisma.user.create({
        data: {
          email: normalized,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          role: true,
          onboardingState: true,
        },
      });

      return {
        ok: true,
        step: "create(user)",
        normalized,
        created,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        step: "create(user)",
        normalized,
        error: message,
      };
    }
  }
}

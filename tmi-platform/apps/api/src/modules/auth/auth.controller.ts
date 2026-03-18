import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AuthService } from "./auth.service";

const SESSION_COOKIE = "phase11_session";
const CSRF_COOKIE = "phase11_csrf";

function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24,
  };
}

function csrfCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: false as const,
    sameSite: "strict" as const,
    secure: isProd,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24,
  };
}

class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private requireCsrf(req: Request) {
    const tokenFromHeader = req.header("x-csrf-token");
    const tokenFromCookie = req.cookies?.[CSRF_COOKIE];
    if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
      throw new ForbiddenException("CSRF token validation failed");
    }
  }

  private ensureCsrfCookie(req: Request, res: Response): string {
    const existing = req.cookies?.[CSRF_COOKIE];
    if (existing) return existing;
    const token = this.authService.issueCsrfToken();
    res.cookie(CSRF_COOKIE, token, csrfCookieOptions());
    return token;
  }

  @Post("register")
  async register(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.requireCsrf(req);
    this.ensureCsrfCookie(req, res);
    try {
      return await this.authService.register(body.email, body.password);
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error("AUTH_REGISTER_ERROR", err);
      throw new InternalServerErrorException("Internal server error");
    }
  }

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.requireCsrf(req);
    const csrfToken = this.ensureCsrfCookie(req, res);
    let result: Awaited<ReturnType<typeof this.authService.login>>;
    try {
      result = await this.authService.login(body.email, body.password);
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error("AUTH_LOGIN_ERROR", err);
      throw new InternalServerErrorException("Internal server error");
    }
    res.cookie(SESSION_COOKIE, result.sessionToken, sessionCookieOptions());
    res.cookie(CSRF_COOKIE, csrfToken, csrfCookieOptions());
    return { ok: true, authenticated: true, user: result.user };
  }

  @Post("logout")
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.requireCsrf(req);
    const token = req.cookies?.[SESSION_COOKIE];
    if (token) {
      await this.authService.logout(token);
    }
    const sessionOptions = sessionCookieOptions();
    const csrfOptions = csrfCookieOptions();
    res.clearCookie(SESSION_COOKIE, {
      path: sessionOptions.path,
      sameSite: sessionOptions.sameSite,
      secure: sessionOptions.secure,
    });
    res.clearCookie(CSRF_COOKIE, {
      path: csrfOptions.path,
      sameSite: csrfOptions.sameSite,
      secure: csrfOptions.secure,
    });
    return { ok: true, authenticated: false };
  }

  @Get("session")
  async session(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const csrfToken = this.ensureCsrfCookie(req, res);
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) {
      return { user: null, expires: null, authenticated: false, csrfToken };
    }

    const session = await this.authService.getSession(token);
    if (!session) {
      return { user: null, expires: null, authenticated: false, csrfToken };
    }

    return {
      user: session.user,
      expires: session.expires,
      authenticated: true,
      csrfToken,
    };
  }
}

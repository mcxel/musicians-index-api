import { Body, Controller, Get, HttpCode, Patch, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { UsersService } from "./users.service";
import { UpdateMeDto } from "./dto/update-me.dto";
import { SelectRoleDto } from "./dto/select-role.dto";
import { CreateOfficialLinkDto } from "./dto/create-official-link.dto";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("users/me")
  async getMe(@Req() req: Request) {
    return this.usersService.getMeFromSession(req.cookies?.[UsersService.sessionCookieName()]);
  }

  @Patch("users/me")
  async updateMe(@Req() req: Request, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(req.cookies?.[UsersService.sessionCookieName()], dto);
  }

  @Post("onboarding/role")
  @HttpCode(200)
  async selectRole(@Req() req: Request, @Body() dto: SelectRoleDto) {
    return this.usersService.selectRole(req.cookies?.[UsersService.sessionCookieName()], dto);
  }

  @Post("official-links")
  @HttpCode(200)
  async createOfficialLink(@Req() req: Request, @Body() dto: CreateOfficialLinkDto) {
    return this.usersService.createOfficialLink(req.cookies?.[UsersService.sessionCookieName()], dto);
  }
}

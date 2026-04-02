import { Controller, Get, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/guards/auth.guard';

const SESSION_COOKIE = 'phase11_session';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private requireAdmin(req: any): void {
    const sessionId = req.cookies?.[SESSION_COOKIE];
    if (!sessionId) throw new ForbiddenException('Not authenticated');
    const user = req.user;
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  getStats(@Req() req: any) {
    this.requireAdmin(req);
    return this.adminService.getStats();
  }

  @Get('users')
  @UseGuards(AuthGuard)
  getUsers(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    this.requireAdmin(req);
    return this.adminService.getUsers(Number(page), Number(limit));
  }

  @Get('reports')
  @UseGuards(AuthGuard)
  getReports(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    this.requireAdmin(req);
    return this.adminService.getReports(Number(page), Number(limit));
  }

  @Get('audit-log')
  @UseGuards(AuthGuard)
  getAuditLog(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    this.requireAdmin(req);
    return this.adminService.getAuditLog(Number(page), Number(limit));
  }

  @Get('feature-flags')
  @UseGuards(AuthGuard)
  getFeatureFlags(@Req() req: any) {
    this.requireAdmin(req);
    return this.adminService.getFeatureFlags();
  }
}
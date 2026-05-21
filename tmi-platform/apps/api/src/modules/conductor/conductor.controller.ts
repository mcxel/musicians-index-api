import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConductorService } from './conductor.service';
import { AdminGuard } from '../auth/guards/admin.guard';

// ============================================================
// Michael Charlie — Conductor CEO Controller
// All routes require admin-level access.
// ============================================================

@Controller('conductor')
@UseGuards(AdminGuard)
export class ConductorController {
  constructor(private readonly conductorService: ConductorService) {}

  /** GET /api/conductor/status — MC dashboard snapshot */
  @Get('status')
  getStatus() {
    return this.conductorService.getStatus();
  }

  /** GET /api/conductor/tasks — list all tasks with filters */
  @Get('tasks')
  getTasks(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('subsystem') subsystem?: string,
  ) {
    return this.conductorService.getTasks(
      Number(page),
      Number(limit),
      status,
      priority,
      subsystem,
    );
  }

  /** POST /api/conductor/tasks — create a new MC task */
  @Post('tasks')
  @HttpCode(HttpStatus.CREATED)
  createTask(
    @Body() dto: {
      title: string;
      description: string;
      priority?: string;
      teamId?: string;
      agentId?: string;
      subsystem?: string;
      dueAt?: string;
      directedById?: string;
    },
  ) {
    return this.conductorService.createTask(dto);
  }

  /** POST /api/conductor/escalate — raise a P0/P1 to MC or Big Ace */
  @Post('escalate')
  @HttpCode(HttpStatus.CREATED)
  escalate(
    @Body() dto: {
      reason: string;
      taskId?: string;
      agentId?: string;
      subsystem?: string;
      priority?: string;
      level?: string;
    },
  ) {
    return this.conductorService.escalate(dto);
  }

  /** GET /api/conductor/escalations — list open escalations */
  @Get('escalations')
  getEscalations(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.conductorService.getEscalations(Number(page), Number(limit));
  }

  /** GET /api/conductor/bots — list all bot teams + agents */
  @Get('bots')
  getBotTeams() {
    return this.conductorService.getBotTeams();
  }

  /** POST /api/conductor/bots/assign — assign bot to task */
  @Post('bots/assign')
  @HttpCode(HttpStatus.OK)
  assignBot(@Body() dto: { agentId: string; taskId: string }) {
    return this.conductorService.assignBot(dto);
  }

  /** GET /api/conductor/reports — platform health reports */
  @Get('reports')
  getReports(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('subsystem') subsystem?: string,
  ) {
    return this.conductorService.getReports(Number(page), Number(limit), subsystem);
  }

  /** POST /api/conductor/reports/generate — trigger health report */
  @Post('reports/generate')
  @HttpCode(HttpStatus.CREATED)
  generateReport(@Body() dto: { subsystem: string }) {
    return this.conductorService.generateHealthReport(dto.subsystem);
  }

  /** POST /api/conductor/directives — issue a new MC/Big Ace directive */
  @Post('directives')
  @HttpCode(HttpStatus.CREATED)
  issueDirective(
    @Body() dto: {
      title: string;
      body: string;
      issuedBy?: string;
      targetTeams?: string[];
      priority?: string;
      expiresAt?: string;
    },
  ) {
    return this.conductorService.issueDirective(dto);
  }

  /** GET /api/conductor/directives — list active directives */
  @Get('directives')
  getDirectives(@Query('activeOnly') activeOnly = 'true') {
    return this.conductorService.getDirectives(activeOnly === 'true');
  }

  /** GET /api/conductor/incidents — incident timeline */
  @Get('incidents')
  getIncidents(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.conductorService.getIncidents(Number(page), Number(limit));
  }

  /** GET /api/conductor/kill-switches — kill switch registry */
  @Get('kill-switches')
  getKillSwitches() {
    return this.conductorService.getKillSwitches();
  }

  /** POST /api/conductor/kill-switches/:key/toggle */
  @Post('kill-switches/:key/toggle')
  @HttpCode(HttpStatus.OK)
  toggleKillSwitch(
    @Param('key') key: string,
    @Body() dto: { disable: boolean; reason: string; actor?: string },
  ) {
    return this.conductorService.toggleKillSwitch(key, dto.disable, dto.reason, dto.actor);
  }

  /** GET /api/conductor/approvals — pending approval requests */
  @Get('approvals')
  getPendingApprovals(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.conductorService.getPendingApprovals(Number(page), Number(limit));
  }

  /** POST /api/conductor/approvals/:id/review */
  @Post('approvals/:id/review')
  @HttpCode(HttpStatus.OK)
  reviewApproval(
    @Param('id') id: string,
    @Body() dto: { approve: boolean; reviewedBy: string; notes?: string },
  ) {
    return this.conductorService.reviewApproval(id, dto.approve, dto.reviewedBy, dto.notes);
  }

  /** GET /api/conductor/reconciliations — ledger reconciliation history */
  @Get('reconciliations')
  getReconciliations(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.conductorService.getReconciliations(Number(page), Number(limit));
  }

  /** GET /api/conductor/quality-gates */
  @Get('quality-gates')
  getQualityGates(@Query('subsystem') subsystem?: string) {
    return this.conductorService.getQualityGates(subsystem);
  }

  /** POST /api/conductor/seed — seed default bot team registry */
  @Post('seed')
  @HttpCode(HttpStatus.CREATED)
  seedRegistry() {
    return this.conductorService.seedBotRegistry();
  }
}

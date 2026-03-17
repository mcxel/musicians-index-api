import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminGuard } from "./guards/admin.guard";
import { AuthGuard } from "./guards/auth.guard";

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AdminGuard],
  exports: [AuthService, AuthGuard, AdminGuard],
})
export class AuthModule {}

import { IsString } from 'class-validator';

export class VerifyTicketDto {
  @IsString()
  token!: string;
}

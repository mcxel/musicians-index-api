import { IsString } from 'class-validator';

export class CheckInTicketDto {
  @IsString()
  token!: string;
}

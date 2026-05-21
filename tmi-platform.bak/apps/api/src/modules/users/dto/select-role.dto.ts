import { IsString } from "class-validator";

export class SelectRoleDto {
  @IsString()
  role!: string;
}

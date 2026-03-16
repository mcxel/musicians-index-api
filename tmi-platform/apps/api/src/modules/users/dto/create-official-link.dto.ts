import { IsString, IsUrl, MaxLength } from "class-validator";

export class CreateOfficialLinkDto {
  @IsString()
  @MaxLength(80)
  platform!: string;

  @IsUrl({ require_tld: true })
  url!: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class GetLinkTelegramTokenResponse {
  @ApiProperty()
  token: string;
}

export class UnlinkTelegramAccountResponse {
  @ApiProperty()
  success: boolean;
}

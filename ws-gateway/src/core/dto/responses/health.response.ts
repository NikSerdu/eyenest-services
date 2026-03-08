import { ApiProperty } from '@nestjs/swagger'

export class HealthResponse {
	@ApiProperty({
		example: 'ok'
	})
	public status: string

	@ApiProperty({
		example: '2025-11-26T10:30:00.000Z'
	})
	public timestamp: string
}

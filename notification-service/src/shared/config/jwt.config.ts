import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'

export const getJwtConfig = async (
	configService: ConfigService,
): Promise<JwtModuleOptions> => ({
	secret: configService.getOrThrow('JWT_SECRET'),
	signOptions: {
		expiresIn: configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRES'),
	},
})

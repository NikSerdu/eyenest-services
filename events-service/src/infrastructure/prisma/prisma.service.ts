import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/generated/client'

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name)

	public constructor(private readonly configService: ConfigService) {
		const adapter = new PrismaPg({
			user: configService.get('DATABASE_USER', { infer: true }),
			password: configService.get('DATABASE_PASSWORD', { infer: true }),
			host: configService.get('DATABASE_HOST', { infer: true }),
			port: configService.get('DATABASE_PORT', { infer: true }),
			database: configService.get('DATABASE_NAME', { infer: true }),
		})

		super({ adapter })
	}

	public async onModuleInit() {
		const start = Date.now()

		this.logger.log('Connecting to database...')

		try {
			await this.$connect()

			const ms = Date.now() - start

			this.logger.log(`Database connection established (time=${ms}ms)`)
		} catch (error) {
			this.logger.error('Failed to connect to database: ', error)

			throw error
		}
	}

	public async onModuleDestroy() {
		this.logger.log('Disconnecting from database...')

		try {
			await this.$disconnect()

			this.logger.log('Database connection closed')
		} catch (error) {
			this.logger.error('Failed to disconnect from database: ', error)
		}
	}
}

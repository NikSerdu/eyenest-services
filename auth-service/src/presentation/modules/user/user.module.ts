import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { GetUserByIdUseCase } from '@/application/useCases/getUserById.useCase'
import { IUserRepository } from '@/domain'
import { UserRepository } from '@/infrastructure/repositories/user.repository'
import { GetUserNotificationSettingsUseCase } from '@/application/useCases/getUserNotificationSettings.useCase'
import { UpdateUserNotificationSettingsUseCase } from '@/application/useCases/updateUserNotificationSettings.useCase'
import { GetUserIdByTelegramChatIdUseCase } from '@/application/useCases/getUserIdByTelegramChatId.useCase'
@Module({
	controllers: [UserController],
	providers: [
		GetUserByIdUseCase,
		GetUserNotificationSettingsUseCase,
		UpdateUserNotificationSettingsUseCase,
		GetUserIdByTelegramChatIdUseCase,
		{
			provide: IUserRepository,
			useClass: UserRepository,
		},
	],
})
export class UserModule {}

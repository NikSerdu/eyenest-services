import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import type {
	GetUserByIdRequest,
	GetUserByIdResponse,
	GetUserIdByTelegramChatIdRequest,
	GetUserIdByTelegramChatIdResponse,
	GetUserNotificationSettingsRequest,
	GetUserNotificationSettingsResponse,
	UpdateUserNotificationSettingsRequest,
	UpdateUserNotificationSettingsResponse,
} from '@eyenest/contracts/gen/ts/auth'
import { GetUserByIdUseCase } from '@/application/useCases/getUserById.useCase'
import { GetUserNotificationSettingsUseCase } from '@/application/useCases/getUserNotificationSettings.useCase'
import { UpdateUserNotificationSettingsUseCase } from '@/application/useCases/updateUserNotificationSettings.useCase'
import { GetUserIdByTelegramChatIdUseCase } from '@/application/useCases/getUserIdByTelegramChatId.useCase'
@Controller('user')
export class UserController {
	constructor(
		private readonly getUserByIdUseCase: GetUserByIdUseCase,
		private readonly getUserNotificationSettingsUseCase: GetUserNotificationSettingsUseCase,
		private readonly updateUserNotificationSettingsUseCase: UpdateUserNotificationSettingsUseCase,
		private readonly getUserIdByTelegramChatIdUseCase: GetUserIdByTelegramChatIdUseCase,
	) {}

	@GrpcMethod('AuthService', 'getUserById')
	async getById(data: GetUserByIdRequest): Promise<GetUserByIdResponse> {
		return await this.getUserByIdUseCase.execute(data)
	}

	@GrpcMethod('AuthService', 'getUserNotificationSettings')
	async getNotificationSettings(
		data: GetUserNotificationSettingsRequest,
	): Promise<GetUserNotificationSettingsResponse> {
		return await this.getUserNotificationSettingsUseCase.execute(data)
	}

	@GrpcMethod('AuthService', 'updateUserNotificationSettings')
	async updateNotificationSettingsUseCase(
		data: UpdateUserNotificationSettingsRequest,
	): Promise<UpdateUserNotificationSettingsResponse> {
		console.log('user servicee', data)
		return await this.updateUserNotificationSettingsUseCase.execute(data)
	}

	@GrpcMethod('AuthService', 'getUserIdByTelegramChatId')
	async getUserIdByTelegramChatId(
		data: GetUserIdByTelegramChatIdRequest,
	): Promise<GetUserIdByTelegramChatIdResponse> {
		return await this.getUserIdByTelegramChatIdUseCase.execute(data)
	}
}

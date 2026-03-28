import { IUserRepository } from '@/domain'
import { RpcStatus } from '@eyenest/common'
import {
	GetUserNotificationSettingsRequest,
	GetUserNotificationSettingsResponse,
} from '@eyenest/contracts/gen/ts/auth'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

@Injectable()
export class GetUserNotificationSettingsUseCase {
	constructor(private readonly userRepository: IUserRepository) {}

	async execute(
		data: GetUserNotificationSettingsRequest,
	): Promise<GetUserNotificationSettingsResponse> {
		const userNotificationSettings =
			await this.userRepository.getUserNotificationSettings(data.userId)
		if (!userNotificationSettings)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Настройки уведомлений не найдены!',
			})
		return {
			telegramEnabled: userNotificationSettings.telegramEnabled,
			telegramChatId: userNotificationSettings.telegramChatId || '',
			emailEnabled: userNotificationSettings.emailEnabled,
		}
	}
}

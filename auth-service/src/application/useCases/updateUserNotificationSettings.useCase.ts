import { IUserRepository } from '@/domain'
import {
	UpdateUserNotificationSettingsRequest,
	UpdateUserNotificationSettingsResponse,
} from '@eyenest/contracts/gen/ts/auth'
import { Injectable } from '@nestjs/common'

@Injectable()
export class UpdateUserNotificationSettingsUseCase {
	constructor(private readonly userRepository: IUserRepository) {}

	async execute(
		data: UpdateUserNotificationSettingsRequest,
	): Promise<UpdateUserNotificationSettingsResponse> {
		const userNotificationSettings =
			await this.userRepository.updateUserNotificationSettings(data)
		return {
			telegramEnabled: userNotificationSettings.telegramEnabled,
			telegramChatId: userNotificationSettings.telegramChatId || '',
			emailEnabled: userNotificationSettings.emailEnabled,
		}
	}
}

import {
	RegisterRequest,
	UpdateUserNotificationSettingsRequest,
} from '@eyenest/contracts/gen/ts/auth'
import { GetByEmailRequest } from '@eyenest/contracts/gen/ts/user'
import { User } from '@prisma/generated/client'
import { UserNotificationSettingsEntity } from '../entities'
export abstract class IUserRepository {
	abstract register(data: RegisterRequest): Promise<User>
	abstract getByEmail(data: GetByEmailRequest): Promise<User | null>
	abstract getById(userId: string): Promise<User | null>
	abstract getUserNotificationSettings(
		userId: string,
	): Promise<UserNotificationSettingsEntity | null>
	abstract updateUserNotificationSettings(
		data: UpdateUserNotificationSettingsRequest,
	): Promise<UserNotificationSettingsEntity>
	abstract getUserIdByTelegramChatId(
		telegramChatId: string,
	): Promise<string | null>
}

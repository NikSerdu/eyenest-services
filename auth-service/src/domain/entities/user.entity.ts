export class UserEntity {
	id: string
	email: string
	password: string
	createdAt: string
	updatedAt: string
}

export class UserNotificationSettingsEntity {
	id: string
	userId: string
	telegramEnabled: boolean
	telegramChatId: string | null
	emailEnabled: boolean
	createdAt: Date
	updatedAt: Date
}

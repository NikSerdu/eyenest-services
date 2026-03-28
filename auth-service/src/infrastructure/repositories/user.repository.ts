import { IUserRepository, UserNotificationSettingsEntity } from '@/domain'
import { GetByEmailRequest } from '@eyenest/contracts/gen/ts/user'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
	RegisterRequest,
	UpdateUserNotificationSettingsRequest,
} from '@eyenest/contracts/gen/ts/auth'
import { User } from '@prisma/generated/client'

@Injectable()
export class UserRepository implements IUserRepository {
	constructor(private readonly prisma: PrismaService) {}
	async getByEmail(data: GetByEmailRequest): Promise<User | null> {
		return await this.prisma.user.findUnique({
			where: {
				email: data.email,
			},
		})
	}

	async register(data: RegisterRequest): Promise<User> {
		return await this.prisma.user.create({
			data: {
				...data,
				notificationSettings: {
					create: {
						telegramEnabled: false,
						telegramChatId: null,
						emailEnabled: false,
					},
				},
			},
			include: {
				notificationSettings: true,
			},
		})
	}

	async getById(userId: string): Promise<User | null> {
		return await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
		})
	}

	async getUserNotificationSettings(
		userId: string,
	): Promise<UserNotificationSettingsEntity | null> {
		return await this.prisma.userNotificationSettings.findUnique({
			where: {
				userId,
			},
		})
	}

	async updateUserNotificationSettings(
		data: UpdateUserNotificationSettingsRequest,
	): Promise<UserNotificationSettingsEntity> {
		const updateData: Partial<UserNotificationSettingsEntity> = {}

		if (data.telegramEnabled !== undefined) {
			updateData.telegramEnabled = data.telegramEnabled
		}

		if (data.telegramChatId !== undefined) {
			updateData.telegramChatId = data.telegramChatId
		}

		if (data.emailEnabled !== undefined) {
			updateData.emailEnabled = data.emailEnabled
		}

		return await this.prisma.userNotificationSettings.update({
			where: {
				userId: data.userId,
			},
			data: updateData,
		})
	}

	async getUserIdByTelegramChatId(
		telegramChatId: string,
	): Promise<string | null> {
		const userNotificationSettings =
			await this.prisma.userNotificationSettings.findFirst({
				where: {
					telegramChatId,
				},
			})
		return userNotificationSettings?.userId ?? null
	}
}

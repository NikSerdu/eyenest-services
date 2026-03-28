import { IUserRepository } from '@/domain'
import { RpcStatus } from '@eyenest/common'
import {
	GetUserIdByTelegramChatIdRequest,
	GetUserIdByTelegramChatIdResponse,
} from '@eyenest/contracts/gen/ts/auth'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

@Injectable()
export class GetUserIdByTelegramChatIdUseCase {
	constructor(private readonly userRepository: IUserRepository) {}

	async execute(
		data: GetUserIdByTelegramChatIdRequest,
	): Promise<GetUserIdByTelegramChatIdResponse> {
		const userId = await this.userRepository.getUserIdByTelegramChatId(
			data.telegramChatId,
		)
		if (!userId)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Пользователь не найден!',
			})
		return {
			userId,
		}
	}
}

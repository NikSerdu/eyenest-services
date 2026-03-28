import { Update, Ctx, Hears, InjectBot, Action, On } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcStatus } from '@eyenest/common';
import { Markup, Scenes, Telegraf } from 'telegraf';
import { LinkChatIdUseCase } from '@/application/useCases/linkChatIdUseCase.useCase';
import { UnlinkTelegramUseCase } from '@/application/useCases/unlinkTelegram.useCase';

export type TelegrafContext = Scenes.SceneContext & {
  session: {
    waitingForToken?: boolean;
  };
};

@Injectable()
@Update()
export class BotUpdate {
  constructor(
    private readonly linkChatIdUseCase: LinkChatIdUseCase,
    private readonly unlinkTelegramUseCase: UnlinkTelegramUseCase,
    @InjectBot() private readonly bot: Telegraf<TelegrafContext>,
  ) {}

  // Старт бота
  @Hears(/^\/start$/i)
  async start(@Ctx() ctx: TelegrafContext) {
    await ctx.reply(
      'Нажми кнопку ниже, чтобы привязать или отвязать аккаунт:',
      Markup.inlineKeyboard([
        [Markup.button.callback('🔗 Привязать аккаунт', 'link_account')],
        [Markup.button.callback('🔓 Отвязать аккаунт', 'unlink_account')],
      ]),
    );
  }

  // Нажатие на кнопку
  @Action('link_account')
  async onLinkAction(@Ctx() ctx: TelegrafContext) {
    await ctx.answerCbQuery();
    await ctx.reply('🔑 Отправь токен для привязки аккаунта:');

    ctx.session ??= {};
    ctx.session.waitingForToken = true;
  }

  @Action('unlink_account')
  async onUnlinkAction(@Ctx() ctx: TelegrafContext) {
    await ctx.answerCbQuery();
    const chatId = ctx.chat?.id;
    if (chatId === undefined) {
      await ctx.reply('❌ Нет доступа к чату');
      return;
    }
    ctx.session ??= {};
    ctx.session.waitingForToken = false;

    try {
      await this.unlinkTelegramUseCase.execute({
        telegramChatId: String(chatId),
      });
      await ctx.reply('✅ Telegram отвязан от аккаунта.');
    } catch (err) {
      if (err instanceof RpcException) {
        const error = err.getError() as { code?: number; details?: string };
        if (error.code === RpcStatus.NOT_FOUND) {
          await ctx.reply('❌ Этот чат не привязан к аккаунту.');
          return;
        }
        await ctx.reply(error.details ?? '❌ Не удалось отвязать аккаунт.');
        return;
      }
      throw err;
    }
  }

  // Получение токена
  @On('text')
  async onText(@Ctx() ctx: TelegrafContext) {
    if (!ctx.session?.waitingForToken) return;

    const token = ctx.text?.trim();

    const result = await this.linkChatIdUseCase.execute(token, ctx.chat?.id);
    if (result) {
      await ctx.reply(result);
      return;
    }

    ctx.session.waitingForToken = false;
  }
}

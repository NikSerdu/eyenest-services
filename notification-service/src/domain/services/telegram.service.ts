export abstract class ITelegramService {
  abstract sendNotification(chatId: string, message: string): Promise<void>;
  abstract getUserIdByToken(token: string): Promise<string | null>;
  abstract getLinkToken(userId: string): Promise<string>;
  abstract processCooldown(cameraId: string): Promise<boolean>;
}

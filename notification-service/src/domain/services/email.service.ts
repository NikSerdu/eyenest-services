export abstract class IEmailService {
  abstract sendNotification(email: string, message: string): Promise<void>;
}

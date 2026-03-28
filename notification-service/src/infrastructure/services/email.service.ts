import { IEmailService } from '@/domain/services/email.service';

export class EmailService implements IEmailService {
  async sendNotification(email: string, message: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

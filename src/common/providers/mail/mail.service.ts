import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';

interface sendAdminTokenContext {
  token: string;
}

@Injectable()
export class MailService {
  constructor(@Inject(MailerService) private mailerService: MailerService) {}

  async sendAdminToken(
    to: string,
    context: sendAdminTokenContext,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Kod dostępu do rejestracji do systemu',
      template: 'admin-invite',
      context,
    });
  }
}

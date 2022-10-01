import { HandlebarsAdapter, MailerOptions } from '@nest-modules/mailer';
import { join } from 'path';
import { config } from '../../../config/config';

export = {
  transport: `smtp://${config.mailUsername}:${config.mailPassword}@${config.mailHost}:${config.mailPort}`,
  defaults: {
    from: config.mailFrom,
  },
  template: {
    dir: join(__dirname, '../../../../templates/mail'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
} as MailerOptions;

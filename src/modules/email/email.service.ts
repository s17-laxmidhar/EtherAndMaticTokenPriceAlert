import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendEmail(payload : {to: string, subject: string, text: string}): Promise<void> {
    const {to, subject, text} = payload;
    await this.transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
    this.logger.log(`Email sent to ${to} with subject: ${subject}`);
  }
}

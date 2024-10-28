import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from 'src/modules/email/email.service';

describe('EmailService', () => {
  let emailService: EmailService;

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(emailService).toBeDefined();
  });

  it('should send email successfully', async () => {
    const result = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Subject',
      text: 'Body',
    });
    expect(result).toBeUndefined(); // Adjust based on the actual implementation
  });

  it('should throw error on email failure', async () => {
    mockEmailService.sendEmail.mockRejectedValue(new Error('Email failed'));
    await expect(
      emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Subject',
        text: 'Body',
      }),
    ).rejects.toThrow('Email failed');
  });
});

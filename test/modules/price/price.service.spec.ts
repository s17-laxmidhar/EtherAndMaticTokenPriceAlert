import { Test, TestingModule } from '@nestjs/testing';
import { PriceService } from '../../../src/modules/price/price.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PriceEntity } from '../../../src/modules/price/entities/price.entity';
import { AlertEntity } from '../../../src/modules/price/entities/alert.entity';
import { ApiClientService } from '../../../src/modules/api-client/api-client.service';
import { EmailService } from '../../../src/modules/email/email.service';
import { Repository } from 'typeorm';
import { AlertDto } from '../../../src/modules/price/dto/alert.dto';
import { HourlyPriceDto } from '../../../src/modules/price/dto/hourly-price.dto';

describe('PriceService', () => {
  let priceService: PriceService;
  let priceRepo: Repository<PriceEntity>;
  let alertRepo: Repository<AlertEntity>;
  let apiClientService: ApiClientService;
  let emailService: EmailService;

  const mockPriceRepo = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAlertRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockApiClientService = {
    fetchPrice: jest.fn(),
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceService,
        {
          provide: getRepositoryToken(PriceEntity),
          useValue: mockPriceRepo,
        },
        {
          provide: getRepositoryToken(AlertEntity),
          useValue: mockAlertRepo,
        },
        { provide: ApiClientService, useValue: mockApiClientService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    priceService = module.get<PriceService>(PriceService);
    priceRepo = module.get<Repository<PriceEntity>>(getRepositoryToken(PriceEntity));
    alertRepo = module.get<Repository<AlertEntity>>(getRepositoryToken(AlertEntity));
    apiClientService = module.get<ApiClientService>(ApiClientService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(priceService).toBeDefined();
  });

  describe('getHourlyPrices', () => {
    it('should return hourly prices for the specified chain', async () => {
      const chain = 'ethereum';
      const hours = 24;
      const mockPrices = [
        { chain, timestamp: new Date(), price: 2000.75 },
      ];

      mockPriceRepo.getMany.mockResolvedValue(mockPrices);

      const result: HourlyPriceDto[] = await priceService.getHourlyPrices(chain, hours);
      expect(result).toEqual([{ timestamp: mockPrices[0].timestamp, price: mockPrices[0].price }]);
      expect(mockPriceRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('setPriceAlert', () => {
    it('should set a price alert successfully', async () => {
      const alertDto: AlertDto = { chain: 'ethereum', price: 1500, email: 'user@example.com' };
      const mockResponse = { message: 'Alert has been successfully set!' };

      mockAlertRepo.create.mockReturnValue(alertDto);
      mockAlertRepo.save.mockResolvedValue(undefined);

      const result = await priceService.setPriceAlert(alertDto);
      expect(result).toEqual(mockResponse);
      expect(mockAlertRepo.create).toHaveBeenCalledWith(alertDto);
      expect(mockAlertRepo.save).toHaveBeenCalled();
    });
  });

  describe('savePriceForChain', () => {
    it('should save the price for the specified chain', async () => {
      const chain = 'ethereum';
      const price = 2000;

      mockApiClientService.fetchPrice.mockResolvedValue(price);
      mockPriceRepo.create.mockReturnValue({ chain, price });

      await priceService['savePriceForChain'](chain);
      expect(mockPriceRepo.create).toHaveBeenCalledWith({ chain, price });
      expect(mockPriceRepo.save).toHaveBeenCalled();
    });

    it('should handle errors when fetching price', async () => {
      const chain = 'polygon';

      mockApiClientService.fetchPrice.mockRejectedValue(new Error('API error'));

      await priceService['savePriceForChain'](chain);
      expect(mockPriceRepo.save).not.toHaveBeenCalled(); // Should not save on error
    });
  });

  describe('checkPriceAlerts', () => {
    it('should check alerts and send emails if price exceeds threshold', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const mockPrices = [{ chain: 'ethereum', timestamp: oneHourAgo, price: 2000 }];
      const mockAlert = { chain: 'ethereum', price: 2100, email: 'user@example.com' };

    //   mockPriceRepo.find.mockResolvedValue(mockPrices);
      mockAlertRepo.find.mockResolvedValue([mockAlert]);
      mockApiClientService.fetchPrice.mockResolvedValue(2200);
      mockEmailService.sendEmail.mockResolvedValue(undefined);

      await priceService.checkPriceAlerts();

      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(2);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: mockAlert.email,
        subject: `Price Alert Triggered: ${mockAlert.chain}`,
        text: expect.stringContaining(`The price of ${mockAlert.chain} has reached or exceeded $${mockAlert.price}.`),
      });
    });

    it('should not send emails if price does not exceed threshold', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const mockPrices = [{ chain: 'ethereum', timestamp: oneHourAgo, price: 2000 }];
      const mockAlert = { chain: 'ethereum', price: 2200, email: 'user@example.com' };

    //   mockPriceRepo.find.mockResolvedValue(mockPrices);
      mockAlertRepo.find.mockResolvedValue([mockAlert]);
      mockApiClientService.fetchPrice.mockResolvedValue(2100); // Below alert price

      await priceService.checkPriceAlerts();

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled(); // No email should be sent
    });
  });
});

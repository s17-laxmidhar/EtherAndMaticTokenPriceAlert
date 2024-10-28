import { Test, TestingModule } from '@nestjs/testing';
import { PriceController } from '../../../src/modules/price/price.controller';
import { PriceService } from '../../../src/modules/price/price.service';
import { AlertDto } from '../../../src/modules/price/dto/alert.dto';

describe('PriceController', () => {
    let priceController: PriceController;
    let priceService: PriceService;
  
    const mockPriceService = {
      getHourlyPrices: jest.fn(),
      setPriceAlert: jest.fn(),
    };
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [PriceController],
        providers: [
          { provide: PriceService, useValue: mockPriceService },
        ],
      }).compile();
  
      priceController = module.get<PriceController>(PriceController);
      priceService = module.get<PriceService>(PriceService);
    });
  
    it('should be defined', () => {
      expect(priceController).toBeDefined();
    });
  
    describe('getHourlyPrices', () => {
      it('should return hourly prices for a valid chain', async () => {
        const chain = 'ethereum';
        const hours = 24;
        const mockResponse = [
          { chain, timestamp: '2023-11-25T14:55:00Z', price: 2000.75 },
          // Add more mock data as needed
        ];
  
        mockPriceService.getHourlyPrices.mockResolvedValue(mockResponse);
  
        const result = await priceController.getHourlyPrices(chain, hours);
        expect(result).toEqual(mockResponse);
        expect(mockPriceService.getHourlyPrices).toHaveBeenCalledWith(chain, hours);
      });
  
      it('should throw an error for an invalid chain', async () => {
        const chain = 'unsupported';
        const hours = 24;
  
        mockPriceService.getHourlyPrices.mockRejectedValue(new Error('Chain not found or invalid parameters'));
  
        await expect(priceController.getHourlyPrices(chain, hours)).rejects.toThrow('Chain not found or invalid parameters');
      });
    });
  
    describe('setPriceAlert', () => {
      it('should set a price alert successfully', async () => {
        const alertDto: AlertDto = { chain: 'ethereum', price: 1500, email: 'user@example.com' };
        const mockResponse = { message: 'Alert has been successfully set!' };
  
        mockPriceService.setPriceAlert.mockResolvedValue(mockResponse);
  
        const result = await priceController.setPriceAlert(alertDto);
        expect(result).toEqual(mockResponse);
        expect(mockPriceService.setPriceAlert).toHaveBeenCalledWith(alertDto);
      });
  
      it('should throw an error for invalid alert input', async () => {
        const alertDto: AlertDto = { chain: 'invalid', price: -100, email: 'invalid-email' };
  
        mockPriceService.setPriceAlert.mockRejectedValue(new Error('Invalid input data'));
  
        await expect(priceController.setPriceAlert(alertDto)).rejects.toThrow('Invalid input data');
      });
    });
  });

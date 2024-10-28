import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Moralis from 'moralis';

@Injectable()
export class ApiClientService implements OnModuleInit {
  private readonly logger = new Logger(ApiClientService.name);

  async onModuleInit() {
    try {
      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
      });
      this.logger.log('Moralis SDK initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Moralis SDK: ${error.message}`);
      throw new Error('Moralis SDK initialization failed');
    }
  }

  async fetchPrice(chain: string): Promise<number> {
    try {
      let address: string;

      if (chain === 'ethereum') {
        address = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      } else if (chain === 'polygon') {
        address = '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0';
      } else {
        throw new Error('Unsupported chain');
      }

      const response = await Moralis.EvmApi.token.getTokenPrice({
        chain: '0x1',
        address: address,
        include: 'percent_change',
      });

      const price = response.raw.usdPrice;
      this.logger.log(`Fetched price for ${chain}: $${price}`);
      return price;
    } catch (error) {
      this.logger.error(`Error fetching price for ${chain}: ${error.message}`);
      throw new Error(`Failed to fetch price for ${chain}`);
    }
  }
}

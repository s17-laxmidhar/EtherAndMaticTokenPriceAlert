import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceEntity } from './entities/price.entity';
import { AlertEntity } from './entities/alert.entity';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { EmailService } from '../email/email.service';
import { ApiClientService } from '../api-client/api-client.service';
import { AlertDto } from './dto/alert.dto';
import { HourlyPriceDto } from './dto/hourly-price.dto';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  constructor(
    @InjectRepository(PriceEntity) private priceRepo: Repository<PriceEntity>,
    @InjectRepository(AlertEntity) private alertRepo: Repository<AlertEntity>,
    private apiClientService: ApiClientService,
    private emailService: EmailService,
  ) {}

  // Fetch hourly prices for the specified chain and number of hours
  async getHourlyPrices(chain: string, hours: number): Promise<HourlyPriceDto[]> {
    const prices = await this.priceRepo
      .createQueryBuilder()
      .where('chain = :chain', { chain })
      .andWhere('timestamp >= NOW() - INTERVAL :hours HOUR', { hours })
      .orderBy('timestamp', 'DESC')
      .getMany();

    return prices.map((price) => ({
      timestamp: price.timestamp,
      price: price.price,
    }));
  }

  // Set a price alert
  async setPriceAlert(alertDto: AlertDto): Promise<{ message: string }> {
    const alert = this.alertRepo.create(alertDto);
    await this.alertRepo.save(alert);
    this.logger.log(`Alert set for ${alertDto.chain} at $${alertDto.price}`);
    return { message: 'Alert has been successfully set!' };
  }

  // Cron job to fetch and save prices every 5 minutes
  @Cron('*/5 * * * *')
  async savePrices() {
    await this.savePriceForChain('ethereum');
    await this.savePriceForChain('polygon');
  }

  private async savePriceForChain(chain: string) {
    try {
      const price = await this.apiClientService.fetchPrice(chain);
      const priceEntity = this.priceRepo.create({ chain, price });
      await this.priceRepo.save(priceEntity);
      const prices = await this.priceRepo.find()
      console.log('pricesss ----------> ', prices);
      
      this.logger.log(`Saved price for ${chain}: $${price}`);
    } catch (error) {
      this.logger.error(`Failed to save price for ${chain}: ${error.message}`);
    }
  }

  // Cron job to check alerts and send emails if price exceeds threshold
  @Cron('0 * * * *') // Every hour
  async checkPriceAlerts() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const prices = await this.priceRepo.find({
      where: { timestamp: oneHourAgo },
      order: { timestamp: 'DESC' },
    });

    for (const alert of await this.alertRepo.find()) {
      const priceOneHourAgo = prices.find((price) => price.chain === alert.chain);
      const currentPrice = await this.apiClientService.fetchPrice(alert.chain);

      if (priceOneHourAgo && this.hasIncreasedByMoreThan3Percent(priceOneHourAgo.price, currentPrice)) {
        await this.emailService.sendEmail({
        //   to: 'hyperhire_assignment@hyperhire.in',
          to: 'pojija8561@aleitar.com',
          subject: `Price Alert: ${alert.chain}`,
          text: `The price of ${alert.chain} has increased by more than 3% in the last hour.`,
        });
      }

      if (currentPrice >= alert.price) {
        await this.emailService.sendEmail({
          to: alert.email,
          subject: `Price Alert Triggered: ${alert.chain}`,
          text: `The price of ${alert.chain} has reached or exceeded $${alert.price}. Current price: $${currentPrice}`,
        });
      }
    }
  }

  private hasIncreasedByMoreThan3Percent(previousPrice: number, currentPrice: number): boolean {
    // previousPrice = 100;
    const increase = ((currentPrice - previousPrice) / previousPrice) * 100;
    return increase > 3;
  }
}

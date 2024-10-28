import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { PriceEntity } from './entities/price.entity';
import { AlertEntity } from './entities/alert.entity';
import { ApiClientModule } from '../api-client/api-client.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceEntity, AlertEntity]),
    EmailModule,
    ApiClientModule
  ],
  controllers: [PriceController],
  providers: [PriceService]
})
export class PriceModule {}

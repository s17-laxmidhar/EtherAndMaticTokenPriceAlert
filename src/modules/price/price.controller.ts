import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { PriceService } from './price.service';
import { AlertDto } from './dto/alert.dto';

@ApiTags('Price')
@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get(':chain/hourly')
  @ApiOperation({ summary: 'Get hourly prices for a specific chain' })
  @ApiParam({ name: 'chain', description: 'The blockchain to query prices for', enum: ['ethereum', 'polygon'] })
  @ApiQuery({
    name: 'hours',
    required: false,
    description: 'Number of past hours to retrieve prices for (default is 24 hours)',
    schema: { default: 24, type: 'integer' },
  })
  @ApiResponse({
    status: 200,
    description: 'An array of hourly prices for the specified chain',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          chain: { type: 'string', example: 'ethereum' },
          timestamp: { type: 'string', format: 'date-time', example: '2023-11-25T14:55:00Z' },
          price: { type: 'number', example: 2000.75 },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Chain not found or invalid parameters',
  })
  async getHourlyPrices(
    @Param('chain') chain: string,
    @Query('hours') hours: number = 24,
  ): Promise<any[]> {
    return this.priceService.getHourlyPrices(chain, hours);
  }

  @Post('set-alert')
  @ApiOperation({ summary: 'Set a price alert for a specific blockchain' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        chain: { type: 'string', example: 'ethereum' },
        dollar: { type: 'number', example: 1500 },
        email: { type: 'string', format: 'email', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Alert has been successfully set',
    schema: { type: 'object', properties: { message: { type: 'string', example: 'Alert has been successfully set!' } } },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async setPriceAlert(@Body() alertDto: AlertDto): Promise<{ message: string }> {
    return this.priceService.setPriceAlert(alertDto);
  }
}

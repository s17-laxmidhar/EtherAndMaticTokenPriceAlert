import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check the health status of the application' })
  @ApiResponse({
    status: 200,
    description: 'Returns the health status of the application',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'OK' },
      },
    },
  })
  getHealthStatus(): { status: string } {
    return this.appService.getHealthStatus();
  }
}

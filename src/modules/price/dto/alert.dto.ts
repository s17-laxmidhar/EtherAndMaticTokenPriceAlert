import { IsString, IsNumber, IsEmail, IsIn } from 'class-validator';

export class AlertDto {
  @IsString()
  @IsIn(['ethereum', 'polygon'], { message: 'Chain must be either ethereum or polygon' })
  chain: string;

  @IsNumber()
  price: number;

  @IsEmail()
  email: string;
}

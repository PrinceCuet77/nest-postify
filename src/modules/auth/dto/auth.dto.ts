import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class LoginRegisterDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  // @IsIn(['USER', 'PREMIUM_USER', 'ADMIN'])
  // role: 'USER' | 'PREMIUM_USER' | 'ADMIN';
}

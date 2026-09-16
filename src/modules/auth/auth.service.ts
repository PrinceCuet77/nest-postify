import { Injectable } from '@nestjs/common';
import { LoginRegisterDto } from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  registerUserInDB(loginRegisterDto: LoginRegisterDto) {

  }
}

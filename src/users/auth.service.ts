import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { promisify } from 'util';
import { scrypt as _scrypt, randomBytes } from 'crypto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    const users = await this.usersService.find(email);
    if (users?.length) throw new BadRequestException('Email already in use');

    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const result = salt + '.' + hash.toString();

    const user = await this.usersService.create(email, result);

    return user;
  }

  async signin(email: string, password: string) {
    const users = await this.usersService.find(email);
    if (!users.length) throw new NotFoundException("email doesn't exists");

    const salt = users[0]?.password.split('.')[0];

    const hashedPassword = (await scrypt(password, salt, 32)) as Buffer;

    if (salt + '.' + hashedPassword.toString() !== users[0].password)
      throw new BadRequestException('password is incorrect');

    return users[0];
  }
}

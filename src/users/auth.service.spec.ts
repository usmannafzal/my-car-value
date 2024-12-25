import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Auth Service', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = { id: Math.random() * 99999, email, password } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('usman@gmail.com', '123456');
    expect(user.password).not.toEqual('123456');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if users signs up with the email that is in use', async () => {
    await service.signup('usmanafzal316@gmail.com', '1234'),
      await expect(
        service.signup('usmanafzal316@gmail.com', '1234'),
      ).rejects.toThrow(BadRequestException);
  });

  it('throws an error is signin is called with unused email', async () => {
    await expect(
      service.signin('usmanafzal316@gmail.com', '1234'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws an error if the provided password is invalid', async () => {
    await service.signup('usmanafzal316@gmail.com', '123455');

    await expect(
      service.signin('usmanafzal316@gmail.com', '123456'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns a user if the correct password is provided', async () => {
    await service.signup('usmanafzal316@gmail.com', '123456');
    const user = await service.signin('usmanafzal316@gmail.com', '123456');
    expect(user).toBeDefined();
  });
});

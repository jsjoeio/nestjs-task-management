import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UnauthorizedException } from '@nestjs/common';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('validate', () => {
    it('validates and returns the user based on the JWT payload', async () => {
      const user = new User({
        username: 'TestUser',
      });

      userRepository.findOne.mockResolvedValue(user);

      const result = await jwtStrategy.validate({ username: user.username });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: user.username,
      });
      expect(result).toEqual(user);
    });

    it('throw an UnauthorizedException if the user cannot be found', async () => {
      //
      userRepository.findOne.mockResolvedValue(null);

      expect(jwtStrategy.validate({ username: 'joep' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

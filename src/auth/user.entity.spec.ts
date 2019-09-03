import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserEntity', () => {
  let user: User;

  beforeEach(() => {
    user = new User({
      password: 'testPassword',
      salt: 'testSalt',
    });
    bcrypt.hash = jest.fn();
  });

  describe('validatePassword', () => {
    it('returns true if password is valid', async () => {
      bcrypt.hash.mockResolvedValue('testPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('testPassword');
      expect(result).toEqual(true);
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', user.salt);
    });
    it('returns false if password is invalid', async () => {
      bcrypt.hash.mockResolvedValue('wrongPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('ofsadkf');
      expect(result).toEqual(false);
      expect(bcrypt.hash).toHaveBeenCalledWith('ofsadkf', user.salt);
    });
  });
});

import * as bcrypt from 'bcrypt';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['username'])
export class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  /* COLUMNS */
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  /* METHODS */
  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);

    return hash === this.password;
  }
}

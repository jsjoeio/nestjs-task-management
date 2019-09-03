import * as bcrypt from 'bcryptjs';
import { Task } from '../tasks/task.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
@Unique(['username'])
export class User extends BaseEntity {
  constructor(user?: Partial<User>) {
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

  @OneToMany(type => Task, task => task.user, { eager: true })
  tasks: Task[];

  /* METHODS */
  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);

    return hash === this.password;
  }
}

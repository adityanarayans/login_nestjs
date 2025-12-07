import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(email: string, password: string, name?: string): Promise<User> {
    const hash = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ email, password: hash, name });
    return this.usersRepo.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async updateUser(id: number, updates: { name?: string; password?: string }) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (updates.name !== undefined) {
      user.name = updates.name;
    }

    if (updates.password !== undefined) {
      user.password = await bcrypt.hash(updates.password, 10);
    }

    return this.usersRepo.save(user);
  }

  async deleteUser(id: number) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.usersRepo.remove(user);
    return { deleted: true };
  }
}


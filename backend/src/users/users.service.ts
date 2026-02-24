import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email, ativo: true } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id, ativo: true } });
  }

  async create(data: { nome: string; email: string; senha_hash: string }) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }
}

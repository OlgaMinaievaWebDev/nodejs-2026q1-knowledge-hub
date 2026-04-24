import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as bcrypt from 'bcryptjs';

import { UserService } from '../../src/user/user.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';

vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
}));

describe('UserService', () => {
  let service: UserService;

  let prisma: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should throw NotFoundException when user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.getUserById('some-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return user data without password', async () => {
    const mockUser = {
      id: '1',
      login: 'test',
      password: 'secret',
      role: UserRole.viewer,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.getUserById(mockUser.id);

    expect(result.id).toBe(mockUser.id);
    expect(result.login).toBe(mockUser.login);
    expect(result.role).toBe('viewer');
    expect(result).not.toHaveProperty('password');
  });

  it('createUser should use viewer role by default when role is not provided', async () => {
    const dto: CreateUserDto = {
      login: 'test',
      password: 'password123',
    };

    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

    prisma.user.create.mockResolvedValue({
      id: '1',
      login: dto.login,
      password: 'hashed-password',
      role: UserRole.viewer,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createUser(dto);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          login: dto.login,
          password: 'hashed-password',
          role: 'viewer',
        }),
      }),
    );

    expect(result.role).toBe('viewer');
    expect(result).not.toHaveProperty('password');
  });

  it('should throw error if login already exists', async () => {
    const dto: CreateUserDto = {
      login: 'test',
      password: 'password123',
    };

    prisma.user.create.mockRejectedValue(new Error('duplicate login'));

    await expect(service.createUser(dto)).rejects.toThrow();
  });

  it('should hash password before saving user', async () => {
    const dto: CreateUserDto = {
      login: 'test',
      password: 'password123',
    };

    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

    prisma.user.create.mockResolvedValue({
      id: '1',
      login: dto.login,
      password: 'hashed-password',
      role: UserRole.viewer,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.createUser(dto);

    expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, expect.any(Number));

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          password: 'hashed-password',
        }),
      }),
    );
  });

  it('should use provided role if given', async () => {
    const dto: CreateUserDto = {
      login: 'test',
      password: 'password123',
      role: UserRole.admin,
    };

    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

    prisma.user.create.mockResolvedValue({
      id: '1',
      login: dto.login,
      password: 'hashed-password',
      role: UserRole.admin,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createUser(dto);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: UserRole.admin,
        }),
      }),
    );

    expect(result.role).toBe('admin');
  });
});

import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hash, compare } from 'bcryptjs';

import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';

vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  let prisma: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };

  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
    verifyAsync: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    jwtService = {
      signAsync: vi.fn(),
      verifyAsync: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('login should return access and refresh tokens for valid credentials', async () => {
    const dto = {
      login: 'test',
      password: 'password123',
    };

    const user = {
      id: '1',
      login: 'test',
      password: 'hashed-password',
      role: 'viewer',
    };

    prisma.user.findUnique.mockResolvedValue(user);
    vi.mocked(compare).mockResolvedValue(true as never);

    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.login(dto);

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
  });

  it('login should throw ForbiddenException when user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        login: 'missing',
        password: 'password123',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('login should throw ForbiddenException when password is wrong', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      login: 'test',
      password: 'hashed-password',
      role: 'viewer',
    });

    vi.mocked(compare).mockResolvedValue(false as never);

    await expect(
      service.login({
        login: 'test',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('login should generate JWT tokens with correct payload', async () => {
    const dto = {
      login: 'test',
      password: 'password123',
    };

    const user = {
      id: '1',
      login: 'test',
      password: 'hashed-password',
      role: 'viewer',
    };

    prisma.user.findUnique.mockResolvedValue(user);
    vi.mocked(compare).mockResolvedValue(true as never);

    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await service.login(dto);

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      userId: user.id,
      login: user.login,
      role: user.role,
    });
  });

  it('login should generate refresh token with refresh secret and ttl', async () => {
    const dto = {
      login: 'test',
      password: 'password123',
    };

    const user = {
      id: '1',
      login: 'test',
      password: 'hashed-password',
      role: 'viewer',
    };

    prisma.user.findUnique.mockResolvedValue(user);
    vi.mocked(compare).mockResolvedValue(true as never);

    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await service.login(dto);

    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      {
        userId: user.id,
        login: user.login,
        role: user.role,
      },
      {
        expiresIn: process.env.JWT_REFRESH_TTL,
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );
  });

  it('refreshToken should return new access and refresh tokens for valid refresh token', async () => {
    const dto = {
      refreshToken: 'valid-token',
    };

    const payload = {
      userId: '1',
      login: 'test',
      role: 'viewer',
    };

    jwtService.verifyAsync.mockResolvedValue(payload);

    jwtService.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    const result = await service.refreshToken(dto);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(dto.refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });
});

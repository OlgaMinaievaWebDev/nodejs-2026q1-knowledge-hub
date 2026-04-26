import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { AuthGuard } from '../../src/auth/guards/auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  let jwtService: {
    verifyAsync: ReturnType<typeof vi.fn>;
  };

  const createContext = (request: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as ExecutionContext;

  beforeEach(() => {
    process.env.TEST_MODE = 'auth';

    jwtService = {
      verifyAsync: vi.fn(),
    };

    guard = new AuthGuard(jwtService as unknown as JwtService);
  });

  afterEach(() => {
    delete process.env.TEST_MODE;
    vi.clearAllMocks();
  });

  it('should allow request when TEST_MODE is not auth', async () => {
    process.env.TEST_MODE = 'unit';

    const context = createContext({
      url: '/user',
      header: vi.fn(),
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should allow public auth routes', async () => {
    const context = createContext({
      url: '/auth/login',
      header: vi.fn(),
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should throw UnauthorizedException when token is missing', async () => {
    const context = createContext({
      url: '/user',
      header: vi.fn().mockReturnValue(undefined),
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    const context = createContext({
      url: '/user',
      header: vi.fn().mockReturnValue('Bearer bad-token'),
    });

    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should allow request and attach user when token is valid', async () => {
    const request: any = {
      url: '/user',
      header: vi.fn().mockReturnValue('Bearer valid-token'),
    };

    const payload = {
      userId: '1',
      login: 'test',
      role: 'admin',
    };

    jwtService.verifyAsync.mockResolvedValue(payload);

    const context = createContext(request);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(payload);
  });
});

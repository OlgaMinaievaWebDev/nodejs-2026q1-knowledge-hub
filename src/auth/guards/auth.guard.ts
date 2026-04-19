import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthMode = process.env.TEST_MODE === 'auth';

    if (!isAuthMode) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const path = request.url;

    const isPublicRoute =
      path === '/' || path.startsWith('/auth') || path.startsWith('/doc');

    if (isPublicRoute) return true;

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.header('authorization');

    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) return undefined;

    return token;
  }
}

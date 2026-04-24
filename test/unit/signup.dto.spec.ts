import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { SignUpDto } from 'src/auth/dto/signup.dto';

describe('SignUpDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new SignUpDto();
    dto.login = 'test';
    dto.password = '123';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when login is missing', async () => {
    const dto = new SignUpDto();
    dto.password = '123';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('login');
  });

  it('should fail validation when password is missing', async () => {
    const dto = new SignUpDto();
    dto.login = 'test';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail validation when login is not a string', async () => {
    const dto = new SignUpDto();
    (dto as any).login = 123;
    dto.password = '123';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('login');
  });
});

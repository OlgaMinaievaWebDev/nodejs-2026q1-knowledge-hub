import { validate } from 'class-validator';
import { describe, it, expect } from 'vitest';
import { UpdatePasswordDto } from '../../src/user/dto/update-password.dto';

describe('UpdatePasswordDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new UpdatePasswordDto();
    dto.oldPassword = 'old123';
    dto.newPassword = 'new123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when oldPassword is missing', async () => {
    const dto = new UpdatePasswordDto();
    dto.newPassword = 'new123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when newPassword is missing', async () => {
    const dto = new UpdatePasswordDto();
    dto.oldPassword = 'old123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, email: user.email, name: user.name };
  }

  @Put('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    const userId = req.user.userId;
    const updated = await this.usersService.updateUser(userId, dto);
    return { id: updated.id, email: updated.email, name: updated.name };
  }

  @Delete('me')
  async deleteMe(@Req() req: any) {
    const userId = req.user.userId;
    return this.usersService.deleteUser(userId);
  }
}

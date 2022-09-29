import { Controller, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  //@TODO create guard that validates the token and email
  @Post('/admin/:token')
  async createAdmin(
    @Param('token') token: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.userService.createAdmin(token, createUserDto);
  }
}

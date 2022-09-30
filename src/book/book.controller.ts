import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { RoleGuard } from '../common/guards/role.guard';
import { SetRole } from '../common/decorators/set-role.decorator';
import {
  CreateBookResponse,
  FindAllBookResponse,
  FindOneBookResponse,
  UpdateBookResponse,
  UserRole,
} from '../types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FindOneQueryDto } from './dto/find-one-query.dto';
import { OnlyRolesSecureDataGuard } from '../common/guards/only-roles-secure-data.guard';
import { FindAllQueryDto } from './dto/find-all-query.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  @UseGuards(JwtAuthGuard, OnlyRolesSecureDataGuard)
  @SetRole('admin')
  findAll(@Query() query: FindAllQueryDto): Promise<FindAllBookResponse> {
    return this.bookService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, OnlyRolesSecureDataGuard)
  @SetRole('admin')
  async findOne(
    @Param('id') id: string,
    @Query() findOneQueryDto: FindOneQueryDto,
  ): Promise<FindOneBookResponse> {
    return this.bookService.findOne(id, findOneQueryDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @SetRole(UserRole.Admin)
  async create(@Body() createBookDto: CreateBookDto): Promise<CreateBookResponse> {
    return this.bookService.create(createBookDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @SetRole(UserRole.Admin)
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<UpdateBookResponse> {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}

import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { Book } from '../../book/entities/book.entity';

@Injectable()
export class BookAvailableGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const bookId = request.params?.id;

    const book = await Book.findOne({
      where: { id: bookId },
      relations: ['borrowedBy'],
    });
    if (!book) throw new NotFoundException();

    return !book.borrowedBy;
  }
}

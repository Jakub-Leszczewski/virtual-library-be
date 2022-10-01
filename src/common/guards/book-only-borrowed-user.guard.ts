import { User } from '../../user/entities/user.entity';
import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { Book } from '../../book/entities/book.entity';

@Injectable()
export class BookOnlyBorrowedUserGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const bookId = request.params?.id;
    const user = request.user as User;

    if (!user) throw new Error('User is undefined');

    const book = await Book.findOne({
      where: { id: bookId },
      relations: ['borrowedBy'],
    });
    if (!book) throw new NotFoundException();
    console.log(book);

    return book.borrowedBy?.id === user.id;
  }
}

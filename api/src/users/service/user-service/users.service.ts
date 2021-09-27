import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { from, Observable } from 'rxjs';
import { map, mapTo, switchMap } from 'rxjs/operators';
import { UserEntity } from 'src/users/model/user.entity';
import { UserI } from 'src/users/model/user.interface';
import { Repository } from 'typeorm';

const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  create(newUser: UserI): Observable<UserI> {
    return this.mailExists(newUser.email).pipe(
      switchMap((exists: boolean) => {
        if (!exists) {
          return this.hashPassword(newUser.password).pipe(
            switchMap((passwordHash: string) => {
              newUser.password = passwordHash;
              return from(this.usersRepository.save(newUser)).pipe(
                switchMap((user: UserI) => this.findOne(user.id)),
              );
            }),
          );
        } else {
          throw new HttpException(
            'Email is already in use',
            HttpStatus.CONFLICT,
          );
        }
      }),
    );
  }

  login(user: UserI): Observable<boolean> {
    return this.findByEmail(user.email).pipe(
      switchMap((foundUser: UserI) => {
        if (foundUser) {
          return this.validatePassword(user.password, foundUser.password).pipe(
            switchMap((matches: boolean) => {
              if (matches) {
                return this.findOne(foundUser.id).pipe<boolean>(mapTo(true));
              } else {
                throw new HttpException(
                  'Login was not successfull, wrong credentials',
                  HttpStatus.UNAUTHORIZED,
                );
              }
            }),
          );
        } else {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
      }),
    );
  }

  findAll(options: IPaginationOptions): Observable<Pagination<UserI>> {
    return from(paginate<UserEntity>(this.usersRepository, options));
  }

  private validatePassword(
    password: string,
    storedPasswordHash: string,
  ): Observable<any> {
    return from(bcrypt.compare(password, storedPasswordHash));
  }

  private findByEmail(email: string): Observable<UserI> {
    return from(
      this.usersRepository.findOne(
        { email },
        { select: ['id', 'email', 'username', 'password'] },
      ),
    );
  }

  private findOne(id: number): Observable<UserI> {
    return from(this.usersRepository.findOne({ id }));
  }

  private hashPassword(password: string): Observable<string> {
    return from<string>(bcrypt.hash(password, 12));
  }

  private mailExists(email: string): Observable<boolean> {
    return from(this.usersRepository.findOne({ email })).pipe(
      map((user: UserI) => !!user),
    );
  }
}
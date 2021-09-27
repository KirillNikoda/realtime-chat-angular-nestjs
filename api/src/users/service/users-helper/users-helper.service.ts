import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { CreateUserDto } from 'src/users/model/dto/create-user.dto';
import { LoginUserDto } from 'src/users/model/dto/login-user.dto';
import { UserI } from 'src/users/model/user.interface';

@Injectable()
export class UsersHelperService {
  createUserDtoToEntity(createUserDto: CreateUserDto): Observable<UserI> {
    return of({
      email: createUserDto.email,
      username: createUserDto.username,
      password: createUserDto.password,
    });
  }

  loginUserDtoToEntity(loginUserDto: LoginUserDto): Observable<UserI> {
    return of({
      email: loginUserDto.email,
      password: loginUserDto.password,
    });
  }
}

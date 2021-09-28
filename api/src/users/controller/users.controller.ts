import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.interface';
import { UserI } from '../model/user.interface';
import { UsersService } from '../service/user-service/users.service';
import { UsersHelperService } from '../service/users-helper/users-helper.service';

@Controller('users')
export class UsersController {
	constructor(
		private usersService: UsersService,
		private usersHelperService: UsersHelperService
	) {}

	@Post()
	create(@Body() createUserDto: CreateUserDto): Observable<UserI> {
		return this.usersHelperService
			.createUserDtoToEntity(createUserDto)
			.pipe(switchMap((user: UserI) => this.usersService.create(user)));
	}

	@Get()
	findAll(
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10
	): Observable<Pagination<UserI>> {
		limit = limit > 100 ? 100 : limit;
		return this.usersService.findAll({
			page,
			limit,
			route: 'http://localhost:3000/api/users',
		});
	}

	@Post('login')
	login(@Body() loginUserDto: LoginUserDto): Observable<LoginResponseI> {
		return this.usersHelperService.loginUserDtoToEntity(loginUserDto).pipe(
			switchMap((user: UserI) =>
				this.usersService.login(user).pipe(
					map(
						(jwt: string) =>
							({
								access_token: jwt,
								token_type: 'JWT',
								expires_in: 10000,
							} as LoginResponseI)
					)
				)
			)
		);
	}
}

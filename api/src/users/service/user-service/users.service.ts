import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	IPaginationOptions,
	paginate,
	Pagination,
} from 'nestjs-typeorm-paginate';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/auth/service/auth.service';
import { UserEntity } from 'src/users/model/user.entity';
import { UserI } from 'src/users/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
		private authService: AuthService
	) {}

	create(newUser: UserI): Observable<UserI> {
		return this.mailExists(newUser.email).pipe(
			switchMap((exists: boolean) => {
				if (!exists) {
					return this.hashPassword(newUser.password).pipe(
						switchMap((passwordHash: string) => {
							newUser.password = passwordHash;
							return from(this.usersRepository.save(newUser)).pipe(
								switchMap((user: UserI) => this.findOne(user.id))
							);
						})
					);
				} else {
					throw new HttpException(
						'Email is already in use',
						HttpStatus.CONFLICT
					);
				}
			})
		);
	}

	login(user: UserI): Observable<string> {
		return this.findByEmail(user.email).pipe(
			switchMap((foundUser: UserI) => {
				if (foundUser) {
					return this.validatePassword(user.password, foundUser.password).pipe(
						switchMap((matches: boolean) => {
							if (matches) {
								return this.findOne(foundUser.id).pipe(
									switchMap((payload: UserI) =>
										this.authService.generateJwt(payload)
									)
								);
							} else {
								throw new HttpException(
									'Login was not successfull, wrong credentials',
									HttpStatus.UNAUTHORIZED
								);
							}
						})
					);
				} else {
					throw new HttpException('User not found', HttpStatus.NOT_FOUND);
				}
			})
		);
	}

	findAll(options: IPaginationOptions): Observable<Pagination<UserI>> {
		return from(paginate<UserEntity>(this.usersRepository, options));
	}

	private findByEmail(email: string): Observable<UserI> {
		return from(
			this.usersRepository.findOne(
				{ email },
				{ select: ['id', 'email', 'username', 'password'] }
			)
		);
	}

	private findOne(id: number): Observable<UserI> {
		return from(this.usersRepository.findOne({ id }));
	}

	private validatePassword(
		password: string,
		storedPasswordHash: string
	): Observable<any> {
		return this.authService.comparePasswords(password, storedPasswordHash);
	}

	private hashPassword(password: string): Observable<string> {
		return this.authService.hashPassword(password);
	}

	private mailExists(email: string): Observable<boolean> {
		return from(this.usersRepository.findOne({ email })).pipe(
			map((user: UserI) => !!user)
		);
	}
}

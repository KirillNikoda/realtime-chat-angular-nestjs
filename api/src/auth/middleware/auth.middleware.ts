import {
	HttpException,
	HttpStatus,
	Injectable,
	NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserI } from 'src/users/model/user.interface';
import { UsersService } from 'src/users/service/user-service/users.service';
import { AuthService } from '../service/auth.service';

export interface RequestModel extends Request {
	user: UserI;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(
		private authService: AuthService,
		private userService: UsersService
	) {}

	async use(req: RequestModel, res: Response, next: NextFunction) {
		try {
			const tokenArray: string[] = req.headers['authorization'].split(' ');
			const decodedToken = await this.authService.verifyJwt(tokenArray[1]);
			const user: UserI = await this.userService.getOne(decodedToken.user.id);

			if (user) {
				req.user = user;
				next();
				return;
			}

			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		} catch (e) {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}
	}
}

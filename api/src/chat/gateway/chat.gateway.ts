import { UnauthorizedException } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { UserI } from 'src/users/model/user.interface';
import { UsersService } from 'src/users/service/user-service/users.service';

@WebSocketGateway({
	cors: { origin: ['http://localhost:3000', 'http:localhost:4200'] },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;
	title: string[] = [];

	constructor(
		private authService: AuthService,
		private usersService: UsersService
	) {}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string {
		this.server.emit('message', 'test');
		return 'Hello world!';
	}

	async handleConnection(socket: Socket) {
		try {
			const decodedToken = await this.authService.verifyJwt(
				socket.handshake.headers.location
			);
			const user: UserI = await this.usersService.getOne(decodedToken.user.id);

			if (!user) {
				// disconnect
				return this.disconnect(socket);
			} else {
				this.title.push(`Value ${Math.random()}`);
				this.server.emit('message', this.title);
			}
		} catch (e) {
			return this.disconnect(socket);
		}
	}

	handleDisconnect(socket: Socket) {
		socket.disconnect();
	}

	private disconnect(socket: Socket) {
		socket.emit('Error', new UnauthorizedException());
		socket.disconnect();
	}
}

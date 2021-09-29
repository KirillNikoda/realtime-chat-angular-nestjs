import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './gateway/chat.gateway';

@Module({
	imports: [AuthModule, UsersModule],
	providers: [ChatGateway],
})
export class ChatModule {}

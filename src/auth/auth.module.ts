import {PassportModule} from '@nestjs/passport';
import {ConfigModule} from '@nestjs/config';
import {Module} from '@nestjs/common';
import {BasicStrategy} from './basic.strategy';

@Module({
    imports: [PassportModule, ConfigModule],
    providers: [BasicStrategy],
})

export class AuthModule {}

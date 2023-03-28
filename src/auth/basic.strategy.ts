import {PassportStrategy} from '@nestjs/passport';
import {BasicStrategy as Strategy} from 'passport-http';
import {ConfigService} from '@nestjs/config';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InternalApiAuthConfigInterface} from '../interfaces/InternalApiAuthConfigInterface';

// The class name here is important as it overrides default behaviour.
// noinspection JSUnusedGlobalSymbols
@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly config: ConfigService,
    ) {
        super({
            passRegToCallback: true,
        });
    }

    validate(username: string, password: string): boolean {
        const internalApiAuthConfig: InternalApiAuthConfigInterface | null = this.config.get('internalApiAuth') ?? null;

        if (!internalApiAuthConfig?.password) {
            throw new Error('Could not find internal API config!');
        }

        if (
            internalApiAuthConfig.username === username &&
            internalApiAuthConfig.password === password
        ) {
            return true;
        }

        throw new UnauthorizedException();
    }
}

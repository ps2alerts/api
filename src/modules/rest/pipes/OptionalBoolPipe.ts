import {PipeTransform, Injectable} from '@nestjs/common';

@Injectable()
export class OptionalBoolPipe implements PipeTransform {
    transform(value: string | undefined): boolean|undefined {
        return value ? value === 'true' : undefined;
    }
}

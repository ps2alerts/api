import {PipeTransform, Injectable} from '@nestjs/common';

@Injectable()
export class OptionalIntPipe implements PipeTransform {
    transform(value: string | undefined): number|undefined {
        return value ? parseInt(value, 10) : undefined;
    }
}

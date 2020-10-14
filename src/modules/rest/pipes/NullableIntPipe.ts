import {PipeTransform, Injectable} from '@nestjs/common';

@Injectable()
export class NullableIntPipe implements PipeTransform {
    transform(value: string | null): number|null {
        return value ? parseInt(value, 10) : null;
    }
}

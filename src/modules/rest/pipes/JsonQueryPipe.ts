import {PipeTransform, Injectable} from '@nestjs/common';
import {ObjectLiteral} from 'typeorm';

@Injectable()
export class JsonQueryPipe implements PipeTransform {
    transform(value: string | undefined): ObjectLiteral|null {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value ? JSON.parse(value) : null;
    }
}

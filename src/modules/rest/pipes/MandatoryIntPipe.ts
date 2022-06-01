import {PipeTransform, Injectable} from '@nestjs/common';

@Injectable()
export class MandatoryIntPipe implements PipeTransform {
    transform(value: string|undefined): number {
        return value ? parseInt(value, 10) : 0;
    }
}

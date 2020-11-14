import {PipeTransform, Injectable} from '@nestjs/common';

@Injectable()
export class OptionalDatePipe implements PipeTransform {
    transform(value: string | undefined): Date|undefined {
        return value ? new Date(value) : undefined;
    }
}

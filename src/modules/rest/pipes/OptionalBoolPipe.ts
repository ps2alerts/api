import {PipeTransform, Injectable} from '@nestjs/common';

@Injectable()
export class OptionalBoolPipe implements PipeTransform {
    transform(value: string | boolean | undefined): boolean | undefined {
        return (value === 'true' || value === true) ?? undefined;
    }
}

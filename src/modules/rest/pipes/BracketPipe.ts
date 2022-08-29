import {Injectable, PipeTransform} from '@nestjs/common';
import {Bracket} from '../../data/ps2alerts-constants/bracket';

@Injectable()
export class BracketPipe implements PipeTransform {
    transform(value: string | undefined): Bracket {
        if (!value || value === '') {
            return Bracket.TOTAL;
        }

        return parseInt(value, 10);
    }
}

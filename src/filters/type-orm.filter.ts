import {BaseExceptionFilter} from '@nestjs/core';
import {Catch, NotFoundException} from '@nestjs/common';
import {EntityNotFoundError} from 'typeorm';

@Catch(EntityNotFoundError)
export class TypeOrmFilter extends BaseExceptionFilter {
    catch(): void {
        throw new NotFoundException();
    }
}

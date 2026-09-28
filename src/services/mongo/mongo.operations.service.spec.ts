/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import MongoOperationsService from './mongo.operations.service';
import {UpsertError} from './upsert.error';

const duplicateAt = (index: number): Error => Object.assign(new Error('E11000 duplicate key error'), {writeErrors: [{code: 11000, index}]});
const ok = {upsertedCount: 0, modifiedCount: 1};

describe('MongoOperationsService.upsert', () => {
    const docs = (): Array<Record<string, unknown>> => [{$setOnInsert: {a: 1}}, {$inc: {kills: 1}}, {$set: {name: 'x'}}];

    it('writes every doc in order in one bulk write', async () => {
        const bulkWrite = jest.fn().mockResolvedValue(ok);
        const service = new MongoOperationsService({bulkWrite} as never);

        await expect(service.upsert('Entity', docs(), [{id: 1}])).resolves.toBe(true);
        expect(bulkWrite).toHaveBeenCalledTimes(1);
        expect(bulkWrite.mock.calls[0][1]).toHaveLength(3);
        expect(bulkWrite.mock.calls[0][1][0]).toEqual({updateOne: {filter: {id: 1}, update: {$setOnInsert: {a: 1}}, upsert: true}});
    });

    it('retries from the failed doc after a duplicate-key race, keeping the docs after it', async () => {
        const bulkWrite = jest.fn().mockRejectedValueOnce(duplicateAt(0)).mockResolvedValue(ok);
        const service = new MongoOperationsService({bulkWrite} as never);

        await service.upsert('Entity', docs(), [{id: 1}]);

        expect(bulkWrite).toHaveBeenCalledTimes(2);
        expect(bulkWrite.mock.calls[1][1]).toHaveLength(3);
    });

    it('resumes at the failing doc rather than the start of the message', async () => {
        const bulkWrite = jest.fn().mockRejectedValueOnce(duplicateAt(1)).mockResolvedValue(ok);
        const service = new MongoOperationsService({bulkWrite} as never);

        await service.upsert('Entity', docs(), [{id: 1}]);

        expect(bulkWrite.mock.calls[1][1]).toHaveLength(2);
        expect(bulkWrite.mock.calls[1][1][0].updateOne.update).toEqual({$inc: {kills: 1}});
    });

    it('throws when the same doc hits a duplicate key twice', async () => {
        const bulkWrite = jest.fn().mockRejectedValue(duplicateAt(0));
        const service = new MongoOperationsService({bulkWrite} as never);

        await expect(service.upsert('Entity', docs(), [{id: 1}])).rejects.toThrow('Upsert failed');
        expect(bulkWrite).toHaveBeenCalledTimes(2);
    });

    it('throws any other error, marked as possibly written when it could have half-applied', async () => {
        const bulkWrite = jest.fn().mockRejectedValue(new Error('connection reset'));
        const service = new MongoOperationsService({bulkWrite} as never);

        const error = await service.upsert('Entity', docs(), [{id: 1}]).catch((e: UpsertError) => e);

        expect(error).toBeInstanceOf(UpsertError);
        expect((error as UpsertError).nothingWritten).toBe(false);
        expect(bulkWrite).toHaveBeenCalledTimes(1);
    });

    it('marks a failure on the very first operation as nothing written', async () => {
        const failedFirst = Object.assign(new Error('validation'), {writeErrors: [{code: 121, index: 0}]});
        const service = new MongoOperationsService({bulkWrite: jest.fn().mockRejectedValue(failedFirst)} as never);

        const error = await service.upsert('Entity', docs(), [{id: 1}]).catch((e: UpsertError) => e);

        expect((error as UpsertError).nothingWritten).toBe(true);
    });

    it('marks a failure after earlier operations applied as possibly written', async () => {
        const failedLater = Object.assign(new Error('validation'), {writeErrors: [{code: 121, index: 2}]});
        const service = new MongoOperationsService({bulkWrite: jest.fn().mockRejectedValue(failedLater)} as never);

        const error = await service.upsert('Entity', docs(), [{id: 1}]).catch((e: UpsertError) => e);

        expect((error as UpsertError).nothingWritten).toBe(false);
    });
});

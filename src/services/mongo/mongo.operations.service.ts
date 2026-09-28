/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument */
import {MongoEntityManager, ObjectId, ObjectLiteral} from 'typeorm';
import {AggregateOptions} from 'typeorm/driver/mongodb/typings';
import {InjectEntityManager} from '@nestjs/typeorm';
import {Injectable} from '@nestjs/common';
import Pagination from './pagination';

@Injectable()
export default class MongoOperationsService {
    public readonly em: MongoEntityManager;

    constructor(@InjectEntityManager() em: MongoEntityManager) {
        this.em = em;
    }

    /**
     * Returns a promise that provides a single entity
     * If no filter is provided, a single entity of the type is provided
     * @param entity entity type to return
     * @param filter object provided to filter entities
     * @param pagination object handles pagination / sorting
     */
    public async findOne<T extends ObjectLiteral>(entity: any, filter?: any, pagination?: Pagination): Promise<T> {
        if (filter) {
            return await this.em.findOneOrFail(
                entity,
                MongoOperationsService.createFindOptions(filter, pagination),
            );
        }

        return this.em.findOneOrFail(entity, {});
    }

    /**
     * Returns a promise that provides a list of entities
     * If no filter is provided, all entities of the type is provided
     * @param entity entity type to return
     * @param filter object provided to filter entities
     * @param pagination object provided for sorting and pagination
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    public async findMany<T>(entity: any, filter?: object, pagination?: Pagination): Promise<T[]> {
        return await this.em.find(entity, MongoOperationsService.createFindOptions(filter, pagination));
    }

    public async insertOne(entity: any, doc: any): Promise<ObjectId> {
        doc = this.transform(doc);

        try {
            const result = await this.em.insertOne(entity, doc);
            return result.insertedId;
        } catch (error: any) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            if (!error.message.includes('E11000')) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions,@typescript-eslint/no-unsafe-member-access
                throw new Error(`insertOne failed! E: ${error.message}`);
            }
        }

        throw new Error(`insertOne failed! No documents were inserted! ${JSON.stringify(doc)}`);
    }

    public async insertMany(entity: any, docs: any[]): Promise<ObjectId[]> {
        docs = this.transform(docs);

        try {
            const result = await this.em.insertMany(entity, docs);

            return Object.values(result.insertedIds);
        } catch (error: any) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            if (!error.message.includes('E11000')) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions,@typescript-eslint/no-unsafe-member-access
                throw new Error(`insertMany failed! E: ${error.message}`);
            }
        }

        throw new Error(`insertMany failed! No documents were inserted! ${JSON.stringify(docs)}`);
    }

    public async upsert(entity: any, docs: any[], conditionals: any[]): Promise<boolean> {
        // One update per doc, in order: a message's $setOnInsert must create the row before its $inc and $set apply
        return await this.runUpserts(entity, (this.transform(docs) as any[]).map((doc: any) => ({
            updateOne: {filter: conditionals[0], update: doc, upsert: true},
        })));
    }

    /**
     * Returns a promise that indicates success or failure
     * An equal number of conditionals and docs must be provided
     * @param entity entity type to return
     * @param docs list of objects provided to update values
     * @param conditionals list of objects provided choosing which documents to update
     */
    public async upsertMany(entity: any, docs: any[], conditionals: any[]): Promise<boolean> {
        if (docs.length !== conditionals.length) {
            throw new Error('UpsertMany requires equal lengths of documents and conditionals!');
        }

        return await this.runUpserts(entity, (this.transform(docs) as any[]).map((doc: any, index: number) => ({
            updateOne: {filter: conditionals[index], update: doc, upsert: true},
        })));
    }

    public async deleteOne(entity: any, conditional: any): Promise<boolean> {
        try {
            const result = await this.em.deleteOne(entity, conditional);

            return result.deletedCount > 0;
        } catch (error: any) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
            throw new Error(`Delete failed! E:${error.message}`);
        }
    }

    public aggregate <T>(entity: any, pipeline: any, options?: AggregateOptions): Promise<T[]> {
        try {
            return this.em.aggregate(entity, pipeline, options).toArray();
        } catch (error: any) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions,@typescript-eslint/no-unsafe-member-access
            throw new Error(`Aggregate search failed! E: ${error.message}`);
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    private static createFindOptions(filter?: {[k: string]: any}, pagination?: Pagination): object {
        let findOptions: {[k: string]: any} = {};

        if (filter) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            Object.keys(filter).forEach((key) => (filter[key] === undefined ? delete filter[key] : {}));
            findOptions.where = filter;
        }

        if (pagination) {
            findOptions = {...findOptions, ...pagination};
        }

        return findOptions;
    }

    /* eslint-disable */
    /**
     * Two consumers can insert the same new row at once; the loser gets a duplicate-key error. Its operation is retried
     * once, now matching the winner's row, and the operations after it still run. Anything else is thrown.
     */
    private async runUpserts(entity: any, operations: any[]): Promise<boolean> {
        let start = 0;
        let retried = -1;
        let changed = false;

        while (start < operations.length) {
            try {
                const result = await this.em.bulkWrite(entity, operations.slice(start), {ordered: true});
                changed = changed || result.upsertedCount > 0 || result.modifiedCount > 0;
                break;
            } catch (error: any) {
                const writeErrors = error.writeErrors === undefined ? [] : [error.writeErrors].flat();
                const failed = writeErrors[0];

                if (!failed || failed.code !== 11000 || start + Number(failed.index) === retried) {
                    throw new Error(`Upsert failed! E: ${error.message}`);
                }

                changed = changed || Number(failed.index) > 0;
                retried = start + Number(failed.index);
                start = retried;
            }
        }

        return changed;
    }

    private transform(docs: any): any {
        if (docs.constructor === Array) {
            docs.map((doc: any) => {
                this.performTransform(doc)
            });
        } else {
            this.performTransform(docs)
        }

        return docs;
    }

    private performTransform(doc: any): void {
        // Loop through special mongo keys and check for existence, if exists, run transform
        ['$set', '$setOnInsert'].forEach((operator) => {
            if(doc[operator]) {
                this.transformDoc(doc[operator])
            }
        })

        // Also check it on the root level
        this.transformDoc(doc)
    }

    private transformDoc(doc: any): void {
        if (doc.hasOwnProperty('date')) {
            doc.date = new Date(doc.date);
        }

        if (doc.hasOwnProperty('timestamp')) {
            doc.timestamp = new Date(doc.timestamp);
        }

        // If property exists and isn't null (e.g. null dates)
        if (doc.hasOwnProperty('timeStarted') && doc.timeStarted) {
            doc.timeStarted = new Date(doc.timeStarted);
        }

        if (doc.hasOwnProperty('timeEnded') && doc.timeEnded) {
            doc.timeEnded = new Date(doc.timeEnded);
        }
    }
    /* eslint-enable */
}

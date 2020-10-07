/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment */
import {MongoEntityManager, ObjectID} from 'typeorm';
import {InjectEntityManager} from '@nestjs/typeorm';
import {Injectable} from '@nestjs/common';

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
     */
    public async findOne(entity: any, filter?: any): Promise<any> {
        if (filter) {
            return await this.em.findOneOrFail(
                entity,
                {where: filter},
            );
        }

        return this.em.findOneOrFail(entity);
    }

    /**
     * Returns a promise that provides a list of entities
     * If no filter is provided, all entities of the type is provided
     * @param entity entity type to return
     * @param filter object provided to filter entities
     */
    public async findMany(entity: any, filter?: any): Promise<any[]> {
        if (filter) {
            return await this.em.find(
                entity,
                {where: filter},
            );
        }

        return this.em.find(entity);
    }

    public async insertOne(entity: any, doc: any): Promise<ObjectID> {
        doc = this.transform(doc);
        const result = await this.em.insertOne(entity, doc);

        if (result.insertedCount > 0) {
            return result.insertedId;
        }

        throw new Error(`insertOne failed! No documents were inserted! ${JSON.stringify(doc)}`);
    }

    public async insertMany(entity: any, docs: any[]): Promise<ObjectID[]> {
        docs = this.transform(docs);
        const result = await this.em.insertMany(entity, docs);

        if (result.insertedCount > 0) {
            return result.insertedIds;
        }

        throw new Error(`insertMany failed! No documents were inserted! ${JSON.stringify(docs)}`);
    }

    public async upsert(entity: any, docs: any[], conditionals: any[]): Promise<boolean> {
        docs = this.transform(docs);
        const operations: any[] = [];

        // Gather operations, setOnInserts etc should be first and will create the record correctly to then subsequently update.
        docs.forEach((doc) => {
            operations.push({
                updateMany: {
                    filter: conditionals[0],
                    update: doc,
                    upsert: true,
                },
            });
        });

        const result = await this.em.bulkWrite(entity, operations, {ordered: true});

        return result.upsertedCount ? result.upsertedCount > 0 : false;
    }

    /* eslint-disable */
    private transform(docs: any): any {
        // Date handling
        if (docs.constructor === Array) {
            docs.map((doc: any) => {
                if (doc.hasOwnProperty('timestamp')) {
                    doc.timestamp = new Date(doc.timestamp);
                }
            });
        } else if (docs.hasOwnProperty('timestamp')) {
            docs.timestamp = new Date(docs.timestamp);
        }

        return docs;
    }
    /* eslint-enable */
}

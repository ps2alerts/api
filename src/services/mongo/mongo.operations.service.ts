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
        doc = this.transform([doc])[0];
        await this.em.insertOne(entity, doc).then((result) => {
            if (result.insertedCount > 0) {
                return result.insertedId;
            }
        });

        throw new Error(`insertOne failed! No documents were inserted! ${JSON.stringify(doc)}`);
    }

    public async insertMany(entity: any, docs: any[]): Promise<ObjectID[]> {
        docs = this.transform(docs);
        await this.em.insertMany(entity, docs).then((result) => {
            if (result.insertedCount > 0) {
                return result.insertedIds;
            }
        });

        throw new Error(`insertMany failed! No documents were inserted! ${JSON.stringify(docs)}`);
    }

    public async upsertOne(entity: any, doc: any, conditionals: any[]): Promise<ObjectID> {
        console.log(doc);
        doc = this.transform([doc])[0];
        await this.em.updateOne(
            entity,
            conditionals[0],
            doc,
            {upsert: true},
        ).then((result) => {
            if (result.upsertedCount > 0) {
                return result.upsertedId;
            }
        });

        throw new Error(`upsertOne failed! No documents were inserted! ${JSON.stringify(doc)}`);
    }

    public async upsertMany(entity: any, docs: any[], conditionals: any[]): Promise<ObjectID[]> {
        docs = this.transform(docs);
        await this.em.updateMany(
            entity,
            conditionals[0],
            docs,
            {upsert: true},
        ).then((result) => {
            if (result.upsertedCount > 0) {
                return result.upsertedId;
            }
        });

        throw new Error(`upsertMany failed! No documents were inserted! ${JSON.stringify(docs)}`);
    }

    private transform(docs: any[]): any[] {
        return docs.map((doc) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (doc.timestamp !== undefined) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                doc.timestamp = new Date(doc.timestamp);
            }
        });
    }
}

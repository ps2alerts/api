import {Repository} from 'typeorm';

export default abstract class RestBaseController<E>{
    protected repository: Repository<E>;

    constructor(repository: Repository<E>) {
        this.repository = repository;
    }

    /**
     * Returns a promise that provides a list of filteredentities
     * If no filter is provided, all entities of the type is provided
     * @param filter object provided to filter entities
     */
    protected findEntities(filter?: any): Promise<E[]> {
        if (filter) {
            return this.repository.find({where: filter});
        }

        return this.repository.find();
    }

    /**
     * Provides the entities with the non-unique propertyId
     * @param propertyName name of the propertyType that is the EntityId
     * @param id value of the EntityId
     */
    protected findEntitiesById(propertyName: string, id: any): Promise<E[]> {
        return this.findEntities({[propertyName]: id});
    }

    /**
     * Provides the entity with the unique propertyId
     * @param filter object provided to filter entities
     */
    protected findEntity(filter: any): Promise<E> {
        return this.repository.findOneOrFail({where: filter});
    }

    /**
     * Provides the entity with the unique propertyId
     * @param propertyName name of the propertyType that is the EntityId
     * @param id value of the EntityId
     */
    protected findEntityById(propertyName: string, id: any): Promise<E> {
        return this.findEntity({[propertyName]: id});
    }
}

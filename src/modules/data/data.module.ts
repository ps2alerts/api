import {Module} from '@nestjs/common';
import MongoModule from '../../services/databases/mongo.module';

@Module({
    imports: [
        MongoModule,
    ],
    controllers: [],
    providers: [],
})
export class DataModule {}

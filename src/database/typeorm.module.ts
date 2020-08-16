import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MongoConfig } from '../config/mongo.config';

export default TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useClass: MongoConfig,
});

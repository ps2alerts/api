import {ConfigModule} from '@nestjs/config';
import {config} from './index';

export default ConfigModule.forRoot({
    isGlobal: true,
    load: [config],
});

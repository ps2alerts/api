import { ConfigModule } from '@nestjs/config';
import config from '../config';

export default ConfigModule.forRoot({
  load: [config],
})

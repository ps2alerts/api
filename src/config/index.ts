import Database from './database';
import App from './app';

export default () => ({
  app: new App(),
  database: new Database(),
})

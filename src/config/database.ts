import { get } from '../utils/env';

export default class Database {
  public readonly mongoURI = get('MONGO_URI');
}

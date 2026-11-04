import { db, resetDatabase } from '../src/db';

resetDatabase()
  .then(() => console.log('Database reset: cart emptied and products restored.'))
  .finally(() => db.destroy());

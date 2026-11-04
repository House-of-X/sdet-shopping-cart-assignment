import { app } from './app';
import { setupDatabase } from './db';

const PORT = Number(process.env.PORT ?? 4000);

setupDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
  });
});

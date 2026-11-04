import path from 'path';
import knex, { Knex } from 'knex';

const filename = process.env.DB_FILE ?? path.join(__dirname, '..', 'cart.sqlite');

export const db: Knex = knex({
  client: 'better-sqlite3',
  connection: { filename },
  useNullAsDefault: true,
});

export const SEED_PRODUCTS = [
  { id: 1, name: 'Blender', price: 5000, stock: 10 },
  { id: 2, name: 'Chopper', price: 1500, stock: 5 },
  { id: 3, name: 'Kettle', price: 2000, stock: 2 },
  { id: 4, name: 'Cooktop', price: 4000, stock: 0 },
];

export async function setupDatabase(): Promise<void> {
  if (!(await db.schema.hasTable('products'))) {
    await db.schema.createTable('products', (table) => {
      table.integer('id').primary();
      table.string('name').notNullable();
      table.integer('price').notNullable();
      table.integer('stock').notNullable();
    });
  }

  if (!(await db.schema.hasTable('cart_items'))) {
    await db.schema.createTable('cart_items', (table) => {
      table.increments('id');
      table.integer('product_id').notNullable().references('id').inTable('products');
      table.integer('quantity').notNullable();
    });
  }

  const [{ count }] = await db('products').count<{ count: number }[]>({ count: '*' });
  if (Number(count) === 0) {
    await db('products').insert(SEED_PRODUCTS);
  }
}

/** Empties the cart and restores the seed products. Useful for tests. */
export async function resetDatabase(): Promise<void> {
  await setupDatabase();
  await db('cart_items').del();
  await db('products').del();
  await db('products').insert(SEED_PRODUCTS);
}

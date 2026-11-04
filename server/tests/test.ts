import  request from "supertest";
import {app} from "../src/app";
import { resetDatabase, db } from "../src/db";


describe('Products Integration Testing', ()=>{
    beforeAll(async():Promise<void>=>{

        await resetDatabase();
    });
    afterAll(async()=>{
        await db.destroy();
    })

    describe('Get all products', ()=>{
        it('it should return 200 and list of all products', async()=>{
            const res = await request(app).get('/api/products');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('price');
            expect(res.body[0]).toHaveProperty('stock');

        });
    });

    describe('Get /api/cart',()=>{
        it('Should return all the cart details', async()=>{
            const res = await request(app).get('/api/cart');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                items:[],
                subtotal:0,
                discount:0,
                total:0,
            });
        });
    });

    describe('Post /api/cart/items', ()=>{
        it('should add a valid prodcut in the cart', async()=>{
            const res = await request(app)
            .post('/api/cart/items')
            .send({productId:1, quantity:1});

            expect([200, 201]).toContain(res.status);
             expect(res.body).toHaveProperty('items');
             expect(res.body).toHaveProperty('subtotal');
             expect(res.body).toHaveProperty('total');
            expect(res.body.items.length).toBe(1);
            
        });
        it('should return 400 when quantity is missing or invalid', async()=>{
            const res= await request(app)
           .post('/api/cart/items')
            .send({productId:4, quantity:6});

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
            
        });

        it('should return 400 when not enogh stock', async()=>{
            const res= await request(app)
           .post('/api/cart/items')
            .send({productId:4, quantity:9999});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Quantity must be between 1 and 5');
        });

        it('should return 400 "Out of stock', async()=>{
            const res= await request(app)
           .post('/api/cart/items')
            .send({productId:4, quantity:1});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Product is unavailable');
            
        });
        it('should return 404 when producId is missing or invalid', async()=>{
             const res= await request(app)
           .post('/api/cart/items')
            .send({productId:9999, quantity:1});
            expect(res.status).toBe(404);
        });
    });

    describe('Delete /api/cart/items/:id',()=>{
        it('it should remove the item form the cart successfully ', async()=>{
            await request(app).post('/api/cart/items').send({productId:1, quantity:1});;
            const res = await request(app).delete('/api/cart/items/1');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('items');
            expect(res.body).toHaveProperty('subtotal');
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('discount');
            
        });
    });
})

describe('Invalid payload', ()=>{
    it('should return 400 when quantity  is string', async()=>{
        const res = await request(app)
            .post('/api/cart/items')
            .send({productId:1, quantity:"two"});

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
    });

     it('should return 400 when quantity  is decimal number', async()=>{
        const res = await request(app)
            .post('/api/cart/items')
            .send({productId:1, quantity:2.5});

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
    });
    it('should return 400 when quantity  is negative number', async()=>{
        const res = await request(app)
            .post('/api/cart/items')
            .send({productId:1, quantity:-1});

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
    });
});
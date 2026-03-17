'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Household = require('../src/models/Household');
const Category = require('../src/models/Category');
const InventoryItem = require('../src/models/InventoryItem');
const ShoppingListItem = require('../src/models/ShoppingListItem');

const MONGO_TEST_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/grocery_tracker_test';

let token;
let householdId;
let categoryId;

beforeAll(async () => {
  await mongoose.connect(MONGO_TEST_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Household.deleteMany({});
  await Category.deleteMany({});
  await InventoryItem.deleteMany({});
  await ShoppingListItem.deleteMany({});

  // Register + setup
  const regRes = await request(app).post('/api/auth/register').send({
    name: 'Inventory Tester',
    email: 'inv@example.com',
    password: 'Password123',
  });
  token = regRes.body.data.token;
  const userId = regRes.body.data.user._id;

  // Create household
  const hRes = await request(app)
    .post('/api/household')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Home' });
  householdId = hRes.body.data.household._id;

  // Refresh token (householdId updated)
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'inv@example.com',
    password: 'Password123',
  });
  token = loginRes.body.data.token;

  // Create category
  const catRes = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Category', color: '#ff0000' });
  categoryId = catRes.body.data.category._id;
});

describe('Inventory API', () => {
  const itemPayload = () => ({
    itemName: 'Test Milk',
    categoryId,
    quantity: 1,
    unit: 'liters',
    minimumThreshold: 2,
  });

  describe('POST /api/inventory', () => {
    it('should create inventory item and return 201', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${token}`)
        .send(itemPayload());

      expect(res.status).toBe(201);
      expect(res.body.data.item.itemName).toBe('Test Milk');
    });

    it('should auto-add to shopping list when quantity <= threshold', async () => {
      await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${token}`)
        .send(itemPayload()); // quantity=1, threshold=2 → auto-add

      const shoppingRes = await request(app)
        .get('/api/shopping-list')
        .set('Authorization', `Bearer ${token}`);

      expect(shoppingRes.body.data.length).toBeGreaterThan(0);
      const autoItem = shoppingRes.body.data.find(
        (i) => i.itemName === 'Test Milk' && i.autoAdded === true
      );
      expect(autoItem).toBeDefined();
    });

    it('should return 422 on missing required fields', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${token}`)
        .send({ itemName: 'Incomplete' });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/inventory', () => {
    it('should return paginated inventory list', async () => {
      await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${token}`)
        .send(itemPayload());

      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('PATCH /api/inventory/:id/quantity', () => {
    it('should update item quantity', async () => {
      const createRes = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${token}`)
        .send(itemPayload());

      const itemId = createRes.body.data.item._id;

      const res = await request(app)
        .patch(`/api/inventory/${itemId}/quantity`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.item.quantity).toBe(5);
    });
  });

  describe('DELETE /api/inventory/:id', () => {
    it('should delete inventory item', async () => {
      const createRes = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${token}`)
        .send(itemPayload());

      const itemId = createRes.body.data.item._id;

      const res = await request(app)
        .delete(`/api/inventory/${itemId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});

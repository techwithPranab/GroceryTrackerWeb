'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Household = require('../src/models/Household');

const MONGO_TEST_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/grocery_tracker_test';

beforeAll(async () => {
  await mongoose.connect(MONGO_TEST_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
  await Household.deleteMany({});
});

describe('Auth API', () => {
  const registerPayload = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should return 409 on duplicate email', async () => {
      await request(app).post('/api/auth/register').send(registerPayload);
      const res = await request(app).post('/api/auth/register').send(registerPayload);
      expect(res.status).toBe(409);
    });

    it('should return 422 on invalid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'T', email: 'not-an-email', password: '123' });
      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(registerPayload);
    });

    it('should login and return a token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'Password123',
      });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'WrongPassword1',
      });
      expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'Password123',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return profile with valid token', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);
      const { token } = registerRes.body.data;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('test@example.com');
    });
  });
});

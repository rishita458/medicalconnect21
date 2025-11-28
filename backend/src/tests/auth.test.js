require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

beforeAll(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medconnect_test';
  await mongoose.connect(uri, {
    dbName: 'medconnect_test',
    family: 4,
    serverSelectionTimeoutMS: 5000
  });
  await User.deleteMany({});
}, 30000); // Increase timeout to 30 seconds

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth routes', () => {
  test('signup and login happy path', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'patient'
    });
    expect(signupRes.statusCode).toBe(200);
    expect(signupRes.body.user).toBeDefined();
    expect(signupRes.body.token).toBeDefined();

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'testuser@example.com',
      password: 'password123',
      role: 'patient'
    });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.user).toBeDefined();
    expect(loginRes.body.token).toBeDefined();
  });
});

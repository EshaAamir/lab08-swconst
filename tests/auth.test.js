const request = require('supertest');
const app = require('../app'); // Import your Express app
const { users } = require('../utils/storage'); // Import the in-memory storage
const job = require('../services/reminderService'); // Import the cron job

describe('Authentication Tests', () => {
  beforeEach(() => {
    // Clear the users array before each test
    users.length = 0;
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('User registered successfully');
    expect(users.length).toBe(1);
    expect(users[0].username).toBe('testuser');
  });

  it('should login an existing user and return a token', async () => {
    // First, register a user
    await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    // Then, login
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.token).toBeDefined();
  });

  it('should not login with invalid credentials', async () => {
    // Register a user
    await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    // Attempt to login with wrong password
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Invalid credentials');
  });

  afterAll(() => {
    job.stop(); // Stop the cron job after all tests
  });
});
const request = require('supertest');
const app = require('../app'); // Import your Express app
const { users, events } = require('../utils/storage'); // Import the in-memory storage
const job = require('../services/reminderService'); // Import the cron job

describe('Event Management Tests', () => {
  let token;

  beforeEach(async () => {
    // Clear the events array before each test
    events.length = 0;

    // Register and login a user to get a token
    await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });
    token = loginRes.body.token;
  });

  it('should create a new event', async () => {
    const res = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Event',
        description: 'This is a test event',
        date: '2023-12-31T23:59:59Z',
        category: 'Meeting',
        reminder: true,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual('Test Event');
    expect(events.length).toBe(1);
    expect(events[0].name).toBe('Test Event');
  });

  it('should retrieve events for the authenticated user', async () => {
    // Create an event
    await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Event',
        description: 'This is a test event',
        date: '2023-12-31T23:59:59Z',
        category: 'Meeting',
        reminder: true,
      });

    // Retrieve events
    const res = await request(app)
      .get('/events')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toEqual('Test Event');
  });

  it('should retrieve events filtered by category', async () => {
    // Create events in different categories
    await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Meeting Event',
        description: 'This is a meeting event',
        date: '2023-12-31T23:59:59Z',
        category: 'Meeting',
        reminder: true,
      });

    await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Birthday Event',
        description: 'This is a birthday event',
        date: '2023-12-31T23:59:59Z',
        category: 'Birthday',
        reminder: true,
      });

    // Retrieve events filtered by category
    const res = await request(app)
      .get('/events?category=Meeting')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toEqual('Meeting');
  });

  it('should not allow unauthorized access to events', async () => {
    const res = await request(app)
      .get('/events')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toEqual('Invalid token'); // Ensure this matches the middleware response
  });

  afterAll(() => {
    job.stop(); // Stop the cron job after all tests
  });
});
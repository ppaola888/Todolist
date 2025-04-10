import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp, { request } from 'chai-http';
import app from '../../../server.js';
import { status } from '../../../src/const/constant.js';
import cryptoUtils from '../../../src/utils/cryptoUtils.js';
import ActivityTestUtils from '../../fixtures/Utils.js';

chai.use(chaiHttp);

const route = '/';
let testUser;
let accessToken;

describe('Add Activity Controller Test', () => {
  beforeEach(async () => {
    testUser = await ActivityTestUtils.createTestUser();
    const newActivity = await ActivityTestUtils.addTestActivity(testUser._id, status.OPEN);
    const activityId = newActivity._id.toString();
    accessToken = cryptoUtils.generateToken({ _id: testUser._id }, 10000);
  });
  afterEach(async () => {
    await ActivityTestUtils.restore();
  });
  describe('POST/ add activities - success', () => {
    it('should add new activity and return the activity data', async () => {
      const activityData = {
        name: 'Test Activity',
        description: 'Description test activity',
        dueDate: new Date().getTime(),
        status: status.OPEN,
      };
      const res = await request
        .execute(app)
        .post(route)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send(activityData);

      console.log(res.body);

      expect(res).to.have.status(201);

      expect(res.body).to.have.property('name').equal(activityData.name);
      expect(res.body).to.have.property('description').equal(activityData.description);
      expect(res.body).to.have.property('status').equal(activityData.status);
      expect(res.body).to.have.property('userId').equal(testUser._id.toString());
    });
  });
  describe('POST/ add activities - failure', () => {
    it('should return 401 if the user is not authenticated', async () => {
      const activityData = {
        name: 'Test Activity',
        description: 'Test Description',
        dueDate: new Date().getTime(),
        status: status.OPEN,
      };

      const res = await request.execute(app).post(route).set('Content-Type', 'application/json').send(activityData);

      expect(res).to.have.status(401);
    });
    it('should return 400 when name is missing', async () => {
      const activityData = {
        description: 'Description test activity',
        dueDate: new Date().getTime(),
        status: status.OPEN,
      };
      const res = await request
        .execute(app)
        .post(route)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send(activityData);

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "name" is required');
    });
    it('should fail when name length is < 3', async () => {
      const activityData = {
        name: 'T',
        description: 'Description test activity',
        dueDate: new Date().getTime(),
        status: status.OPEN,
      };

      const res = await request
        .execute(app)
        .post(route)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send(activityData);

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "name" length must be at least 3 characters long');
    });
    it('should return 400 when description is missing', async () => {
      const activityData = {
        name: 'Test Activity',
        dueDate: new Date().getTime(),
        status: status.OPEN,
      };
      const res = await request
        .execute(app)
        .post(route)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send(activityData);

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "description" is required');
    });
    it('should fail when description length is < 3', async () => {
      const activityData = {
        name: 'Test Activity',
        description: 'TE',
        dueDate: new Date().getTime(),
        status: status.OPEN,
      };

      const res = await request
        .execute(app)
        .post(route)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send(activityData);

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "description" length must be at least 3 characters long');
    });
    it('should return 400 when dueDate is in the past', async () => {
      const activityData = {
        name: 'Test Activity',
        description: 'Description test activity',
        dueDate: new Date('2021-01-01').getTime(),
        status: status.OPEN,
      };
      const res = await request
        .execute(app)
        .post(route)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send(activityData);

      expect(res).to.have.status(400);
    });
    it('should return 400 when status is invalid', async () => {
      const activityData = {
        name: 'Test Activity',
        description: 'Description test activity',
        dueDate: new Date().getTime(),
        status: 'INVALID_STATUS',
      };
      const res = await request
        .execute(app)
        .post(route)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send(activityData);

      expect(res).to.have.status(400);
    });
  });
});

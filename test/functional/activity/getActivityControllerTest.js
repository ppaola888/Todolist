import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp, { request } from 'chai-http';
import mongoose from 'mongoose';
import app from '../../../server.js';
import { status, userStatus } from '../../../src/const/constant.js';
import cryptoUtils from '../../../src/utils/cryptoUtils.js';
import ActivityTestUtils from '../../fixtures/Utils.js';

chai.use(chaiHttp);

const route = '/:id';

let testUser;
let accessToken;
let testActivity;
let activityId;

describe('GET Activity By Id', () => {
  beforeEach(async () => {
    testUser = await ActivityTestUtils.createTestUser(userStatus.ACTIVE);
    accessToken = cryptoUtils.generateToken({ _id: testUser._id }, 10000);
    testActivity = await ActivityTestUtils.addTestActivity(testUser._id, status.OPEN);
    activityId = testActivity._id.toString();
  });
  afterEach(async () => {
    await ActivityTestUtils.restore();
  });
  describe('GET /:id - success', () => {
    it('should return 200 and the activity', async () => {
      const res = await request
        .execute(app)
        .get(route.replace(':id', activityId))
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(res).to.have.status(200);
      expect(res.body.status).to.equal(status.OPEN);
      expect(res.body.id).to.equal(activityId);
      expect(res.body.userId).to.equal(testUser._id.toString());
      expect(res.body.name).to.equal(testActivity.name);
      expect(res.body.description).to.equal(testActivity.description);
      expect(res.body.dueDate).to.equal(testActivity.dueDate.toISOString());

      const activityFromDb = await ActivityTestUtils.getActivityById(activityId);

      expect(activityFromDb.status).to.equal(status.OPEN);
      expect(activityFromDb._id.toString()).to.equal(testActivity._id.toString());
      expect(activityFromDb.userId.toString()).to.equal(testUser._id.toString());
      expect(activityFromDb.name).to.equal(testActivity.name);
      expect(activityFromDb.description).to.equal(testActivity.description);
      expect(activityFromDb.dueDate.toISOString()).to.equal(testActivity.dueDate.toISOString());
    });
  });
  describe('Get/:id - fail', () => {
    it('should return 401 if token is invalid', async () => {
      const invalidToken = 'invalid_token';

      const res = await request
        .execute(app)
        .get(route.replace(':id', activityId))
        .set('Authorization', `Bearer ${invalidToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(401);
    });
    it('should return 400 if activity Id is invalid', async () => {
      const invalidActivityId = 'Invalid activity_id';

      const res = await request
        .execute(app)
        .get(route.replace(':id', invalidActivityId))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(400);
    });
    it('should return 404 if user is not owner', async () => {
      const anotherUser = await ActivityTestUtils.createAnotherTestUser();
      const anotherAccessToken = cryptoUtils.generateToken({ _id: anotherUser._id }, 10000);

      const res = await request
        .execute(app)
        .get(route.replace(':id', activityId))
        .set('Authorization', `Bearer ${anotherAccessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(404);
      expect(res.body.message).eq('Activity not found');
    });
    it('should return 404 if activity not found', async () => {
      const fakeActivity = new mongoose.Types.ObjectId().toString();

      const res = await request
        .execute(app)
        .get(route.replace(':id', fakeActivity))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(404);
      expect(res.body.message).eq('Activity not found');
    });
  });
});

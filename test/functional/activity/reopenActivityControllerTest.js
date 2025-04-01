import * as chai from 'chai';
import chaiHttp from 'chai-http';
import { request } from 'chai-http';
import app from '../../../server.js';
import { expect } from 'chai';
import mongoose from 'mongoose';
import cryptoUtils from '../../../src/utils/cryptoUtils.js';
import ActivityTestUtils from '../../fixtures/Utils.js';
import { status } from '../../../src/const/constant.js';

chai.use(chaiHttp);
let testUser;
let anotherUser;
let newActivity;
let activityId;
let accessToken;
let route = '/:id/reopen';

describe.only('Reopen Activity Controller test', () => {
  beforeEach(async () => {
    testUser = await ActivityTestUtils.createTestUser();
    anotherUser = await ActivityTestUtils.createAnotherTestUser();
    newActivity = await ActivityTestUtils.addTestActivity(testUser._id, status.COMPLETED);
    activityId = newActivity._id.toString();
    accessToken = cryptoUtils.generateToken({ _id: testUser._id }, 20000);
  });
  afterEach(async () => {
    await ActivityTestUtils.restore();
  });
  describe('PATCH /:id/reopen - success', () => {
    it('should return 200 if the activity completed is reopend', async () => {
      const res = await request
        .execute(app)
        .patch(route.replace(':id', activityId))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(200);
      expect(res.body.status).to.equal(status.OPEN);
      expect(res.body.id).to.equal(activityId);
      expect(res.body.dueDate).to.equal(newActivity.dueDate.toISOString());
      expect(res.body.userId).to.equal(testUser._id.toString());
      expect(res.body.name).to.equal(newActivity.name);
      expect(res.body.description).to.equal(newActivity.description);
      expect(res.body.dueDate).to.equal(newActivity.dueDate.toISOString());

      const reopenActivity = await ActivityTestUtils.getActivityById(activityId, testUser._id);
      expect(reopenActivity.name).to.equal(newActivity.name);
      expect(reopenActivity.status).to.equal(status.OPEN);
      expect(reopenActivity.userId.toString()).to.equal(testUser._id.toString());
      expect(reopenActivity._id.toString()).to.equal(activityId);
      expect(reopenActivity.description).to.equal(newActivity.description);
      expect(reopenActivity.dueDate.toISOString()).to.equal(newActivity.dueDate.toISOString());
    });
  });
  describe('PATCH/:id/reopen fail', () => {
    it('should return 401 if user is not authenticated', async () => {
      const invalidToken = 'Bearer invalid_token';
      const res = await request
        .execute(app)
        .patch(route.replace(':id', activityId))
        .set('Authorization', `Bearer ${invalidToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(401);
    });
    it('should return 404 if the activity is not found', async () => {
      const notFoundActivityId = new mongoose.Types.ObjectId().toString();

      const res = await request
        .execute(app)
        .patch(route.replace(':id', notFoundActivityId))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Activity not found or cannot be reopen');
    });
    it('should return 404 if activity status is open', async () => {
      const openActivity = await ActivityTestUtils.addTestActivity(testUser._id, status.OPEN);

      const res = await request
        .execute(app)
        .patch(route.replace(':id', openActivity._id))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(404);
    });
    it('should return 404 if activity status is deleted', async () => {
      const deletedActivity = await ActivityTestUtils.addTestActivity(testUser._id, status.DELETED);

      const res = await request
        .execute(app)
        .patch(route.replace(':id', deletedActivity._id))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(404);
    });
    it('should return 404 if activity status is archived', async () => {
      const archivedActivity = await ActivityTestUtils.addTestActivity(testUser._id, status.ARCHIVED);

      const res = await request
        .execute(app)
        .patch(route.replace(':id', archivedActivity._id))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(404);
    });
    it('should return 404 if user is not owner', async () => {
      const otherUserActivity = await ActivityTestUtils.addTestActivity(anotherUser._id);

      const res = await request
        .execute(app)
        .patch(route.replace(':id', otherUserActivity._id))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(404);
    });
    it('should return 400 if id is invalid', async () => {
      const invalidId = '12345';
      const res = await request
        .execute(app)
        .patch(route.replace(':id', invalidId))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(400);
    });
  });
});

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
let route = '/:id/complete';

describe('Complete Activity Controller test', () => {
  beforeEach(async () => {
    testUser = await ActivityTestUtils.createTestUser();
    anotherUser = await ActivityTestUtils.createAnotherTestUser();
    newActivity = await ActivityTestUtils.addTestActivity(testUser._id, status.OPEN);
    activityId = newActivity._id.toString();
    accessToken = cryptoUtils.generateToken({ _id: testUser._id }, 10000);
  });
  afterEach(async () => {
    await ActivityTestUtils.restore();
  });
  describe('PATCH/:id/complete success', () => {
    it('should return 200 and the completed activity', async () => {
      const res = await request
        .execute(app)
        .patch(route.replace(':id', activityId))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send({});

      expect(res).to.have.status(200);
      expect(res.body.status).to.equal(status.COMPLETED);
      expect(res.body).to.have.property('id', activityId);
      expect(res.body.id).to.equal(activityId);
      expect(res.body.name).to.equal(newActivity.name);
      expect(res.body.description).to.equal(newActivity.description);
      expect(res.body.dueDate).to.equal(newActivity.dueDate.toISOString());
      expect(res.body.userId).to.equal(newActivity.userId.toString());

      const updatedActivity = await ActivityTestUtils.getActivityById(activityId, testUser._id);
      expect(updatedActivity.status).to.equal(status.COMPLETED);
      expect(updatedActivity.userId).to.equal(newActivity.userId.toString());
      expect(updatedActivity.name).to.equal(newActivity.name);
      expect(updatedActivity.description).to.equal(newActivity.description);
      expect(updatedActivity.dueDate.toISOString()).to.equal(newActivity.dueDate.toISOString());
    });
  });
  describe('PATCH/:id/complete fail', () => {
    it('should return 401 if token is invalid', async () => {
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
      const fakeActivityId = new mongoose.Types.ObjectId().toString();

      const res = await request
        .execute(app)
        .patch(route.replace(':id', fakeActivityId))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Activity not found or not updated');
    });
    it('should return 404 if user is not owner', async () => {
      const otherUserActivity = await ActivityTestUtils.addTestActivity(anotherUser._id, status.OPEN);

      const res = await request
        .execute(app)
        .patch(route.replace(':id', otherUserActivity._id))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(404);
    });
    it('should return 404 if the activity status is archived', async () => {
      const archivedActivity = await ActivityTestUtils.addTestActivity(testUser._id, status.ARCHIVED);

      const res = await request
        .execute(app)
        .patch(route.replace(':id', archivedActivity._id))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(404);
    });
  });
  it('should return 404 if the activity status is deleted', async () => {
    const deletedActivity = await ActivityTestUtils.addTestActivity(testUser._id, status.DELETED);

    const res = await request
      .execute(app)
      .patch(route.replace(':id', deletedActivity._id))
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .send();

    expect(res).to.have.status(404);
  });

  it('should return 400 if activity ID is invalid', async () => {
    const invalidId = 'invalid_id';
    const res = await request
      .execute(app)
      .patch(route.replace(':id', invalidId))
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .send();

    expect(res).to.have.status(400);
  });
});

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
let route = '/:id';

describe('Delete Activity Controller test (Soft Delete)', () => {
  beforeEach(async () => {
    testUser = await ActivityTestUtils.createTestUser();
    anotherUser = await ActivityTestUtils.createAnotherTestUser();
    newActivity = await ActivityTestUtils.addTestActivity(testUser._id, status.OPEN);
    activityId = newActivity._id.toString();
    accessToken = cryptoUtils.generateToken({ _id: testUser._id }, 20000);
  });
  afterEach(async () => {
    await ActivityTestUtils.restore();
  });
  describe('DELETE /:id success', () => {
    it('should return 200 and mark the activity as deleted', async () => {
      const res = await request
        .execute(app)
        .delete(route.replace(':id', activityId))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(200);
      expect(res.body.status).to.equal(status.DELETED);
      expect(res.body.id).to.equal(activityId);
      expect(res.body.name).to.equal(newActivity.name);
      expect(res.body.description).to.equal(newActivity.description);
      expect(res.body.dueDate).to.equal(newActivity.dueDate.toISOString());
      expect(res.body.userId).to.equal(testUser._id.toString());

      const deletedActivity = await ActivityTestUtils.getActivityById(activityId, testUser._id);
      expect(deletedActivity.name).to.equal(newActivity.name);
      expect(deletedActivity.description).to.equal(deletedActivity.description);
      expect(deletedActivity.dueDate.toISOString()).to.equal(deletedActivity.dueDate.toISOString());
      expect(deletedActivity.status).to.equal(status.DELETED);
    });
  });
  it('should not remove the activity from the database', async () => {
    const res = await request
      .execute(app)
      .delete(route.replace(':id', activityId))
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .send();

    expect(res).to.have.status(200);

    const deletedActivity = await ActivityTestUtils.getActivityById(activityId, testUser._id);

    expect(deletedActivity).to.not.be.null;
    expect(deletedActivity.status).to.equal(status.DELETED);
  });
  describe('Delete /:id failure', () => {
    it('should return 401 if user is not authenticated', async () => {
      const invalidToken = 'invalid_token';
      const res = await request
        .execute(app)
        .patch(route.replace(':id', activityId))
        .set('Authorization', `Bearer ${invalidToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(401);
    });
    it('should return 404 if activity not found', async () => {
      const fakeActivityId = new mongoose.Types.ObjectId();
      const res = await request
        .execute(app)
        .delete(route.replace(':id', fakeActivityId))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Activity not found or not updated');
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
    it('should return 400 if activity ID is invalid', async () => {
      const invalidActivityId = 'invalid_id';
      const res = await request
        .execute(app)
        .patch(route.replace(':id', invalidActivityId))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send();

      expect(res).to.have.status(400);
    });
  });
});

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
let newActivity;
let activityId;
let accessToken;
let route = '/:id';

describe('Update Activity Controller test', () => {
  beforeEach(async () => {
    testUser = await ActivityTestUtils.createTestUser();
    newActivity = await ActivityTestUtils.addTestActivity(testUser._id);
    activityId = newActivity._id.toString();
    accessToken = cryptoUtils.generateToken({ _id: testUser._id }, 20000);
  });
  afterEach(async () => {
    await ActivityTestUtils.restore();
  });
  describe('PATCH /:id/update success', () => {
    it('should return 200 and the updated activity', async () => {
      const updatedData = {
        name: 'Test activity updated',
        description: 'Description test activity updated',
      };

      const res = await request.execute(app).patch(route.replace(':id', activityId)).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').send(updatedData);

      expect(res).to.have.status(200);
      expect(res.body.status).to.equal(status.OPEN);
      expect(res.body.id).to.equal(activityId);
      expect(res.body.name).to.equal(updatedData.name);
      expect(res.body.description).to.equal(updatedData.description);
      expect(res.body.dueDate).to.equal(newActivity.dueDate.toISOString());
      expect(res.body.userId).to.equal(testUser._id.toString());

      const updatedActivity = await ActivityTestUtils.getActivityById(activityId, testUser._id);
      expect(updatedActivity.name).to.equal(updatedData.name);
      expect(updatedActivity.description).to.equal(updatedData.description);
      expect(updatedActivity.dueDate.toISOString()).to.equal(newActivity.dueDate.toISOString());
    });
  });
  it('should return 200 and the updated dueDate', async () => {
    const updatedData = {
      dueDate: new Date().getTime(),
    };
    const res = await request.execute(app).patch(route.replace(':id', activityId)).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').send(updatedData);

    expect(res).to.have.status(200);
    expect(res.body.id).to.equal(activityId);
    expect(res.body.dueDate).to.equal(new Date(updatedData.dueDate).toISOString());
    expect(res.body.userId).to.equal(testUser._id.toString());

    const updatedActivity = await ActivityTestUtils.getActivityById(activityId, testUser._id);
    expect(updatedActivity.dueDate.toISOString()).to.equal(new Date(updatedData.dueDate).toISOString());
  });
  describe('PATCH/:id/update fail', () => {
    it('should return 401 if token is invalid', async () => {
      const invalidToken = 'Bearer invalid_token';

      const res = await request.execute(app).patch(route.replace(':id', activityId)).set('Authorization', `Bearer ${invalidToken}`).set('Content-Type', 'application/json').send();
      expect(res).to.have.status(401);
    });
    it('should return 401 if on missing authorization header', async () => {
      const res = await request.execute(app).patch(route.replace(':id', activityId)).set('Content-Type', 'application/json').send();
      expect(res).to.have.status(401);
    });
    it('should return 400 if activity id is invalid', async () => {
      const invalidActivityId = 'invalid_id';
      const res = await request.execute(app).patch(route.replace(':id', invalidActivityId)).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').send();
      expect(res).to.have.status(400);
    });
    it('should return 400 if name < 3', async () => {
      const invalidActivityId = 'invalid_id';
      const res = await request.execute(app).patch(route.replace(':id', invalidActivityId)).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').send({ name: 'cc' });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('ValidationError: "name" length must be at least 3 characters long');
    });
    it('should return 400 if description < 3', async () => {
      const invalidActivityId = 'invalid_id';
      const res = await request.execute(app).patch(route.replace(':id', invalidActivityId)).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').send({ description: 'cc' });

      expect(res).to.have.status(400);
    });
    it('should return 400 if dueDate is in the past < 3', async () => {
      const invalidActivityId = 'invalid_id';
      const res = await request
        .execute(app)
        .patch(route.replace(':id', invalidActivityId))
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send({ dueDate: new Date('2021-01-01').getTime() });

      expect(res).to.have.status(400);
    });
    it('should return 404 if the activity is not found', async () => {
      const notFoundActivityId = new mongoose.Types.ObjectId().toString();

      const res = await request.execute(app).patch(route.replace(':id', notFoundActivityId)).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').send();

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Activity not found or not updated');
    });
    it('should return 404 if user is not owner', async () => {
      const fakeActivityId = new mongoose.Types.ObjectId().toString();

      const res = await request.execute(app).patch(route.replace(':id', fakeActivityId)).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').send();

      expect(res).to.have.status(404);
    });
  });
});

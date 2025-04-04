import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp, { request } from 'chai-http';
import app from '../../../server.js';
import { status } from '../../../src/const/constant.js';
import cryptoUtils from '../../../src/utils/cryptoUtils.js';
import ActivityTestUtils from '../../fixtures/Utils.js';

chai.use(chaiHttp);

let testUser;
let completedActivities;
let deletedActivities;
let archivedActivities;
let accessToken;
let activities;
let route = '/';

describe('Get Activities Controller test - Skip Pagination', () => {
  beforeEach(async () => {
    testUser = await ActivityTestUtils.createTestUser();
    accessToken = cryptoUtils.generateToken({ _id: testUser._id }, 20000);
    activities = await ActivityTestUtils.addManyTestActivities(testUser._id, 40, status.OPEN);
    archivedActivities = await ActivityTestUtils.addManyTestActivities(testUser._id, 10, status.ARCHIVED);
    completedActivities = await ActivityTestUtils.addManyTestActivities(testUser._id, 15, status.COMPLETED);
    deletedActivities = await ActivityTestUtils.addManyTestActivities(testUser._id, 12, status.DELETED);
  });

  afterEach(async () => {
    await ActivityTestUtils.restore();
  });

  describe('GET /activities with skip - success', () => {
    it.only('should return 200 with default parameters (skip = 0, limit = 12) and only non-deleted activities', async () => {
      const res = await request
        .execute(app)
        .get(route)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .query({ skip: 0, limit: 12 })
        .send();

      expect(res.body).to.have.property('activities').that.is.an('array');
      expect(res.body.activities.length).to.be.at.most(12);
      expect(res.body.activities.length).to.be.greaterThan(0);

      expect(res.body.activities.length).to.equal(deletedActivities.length);

      res.body.activities.forEach((activity) => {
        expect(activity.status).to.not.equal(status.DELETED);
      });
      expect(res.body).to.have.property('skip').that.equals(0);
      expect(res.body).to.have.property('limit').that.equals(12);
    });
  });
  it('should return activities with custom skip and limit', async () => {
    const skip = 10;
    const limit = 5;
    const res = await request
      .execute(app)
      .get(route)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .query({ skip, limit })
      .send();

    expect(res.body).to.have.property('activities').that.is.an('array');
    expect(res.body.activities.length).to.equal(limit);
    expect(res.body.skip).to.equal(skip);
    expect(res.body.limit).to.equal(limit);

    const expectedActivities = activities.slice(skip, skip + limit);
    res.body.activities.forEach((activity, index) => {
      expect(activity.id).to.equal(expectedActivities[index].id);

      expect(activity.name).to.equal(expectedActivities[index].name);
      expect(activity.description).to.equal(expectedActivities[index].description);
      expect(activity.status).to.not.equal(status.DELETED);
    });
  });
  it('should return 200 with skip=0 and limit=20 for open activities only', async () => {
    const res = await request
      .execute(app)
      .get(route)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .query({ skip: 0, limit: 20, status: status.OPEN })
      .send();

    expect(res).to.have.status(200);

    expect(res.body).to.have.property('activities').that.is.an('array');
    expect(res.body.activities.length).to.be.at.most(20);
    expect(res.body.activities.length).to.be.greaterThan(0);

    res.body.activities.forEach((activity) => {
      expect(activity.status).to.equal(status.OPEN);
      expect(activity.userId.toString()).to.equal(testUser._id.toString());
    });

    expect(res.body).to.have.property('skip').that.equals(0);
    expect(res.body).to.have.property('limit').that.equals(20);
  });
  it('should return 200 with skip=0 and limit=10 for archived activities only', async () => {
    const res = await request
      .execute(app)
      .get(route)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .query({ skip: 0, limit: 10, status: status.ARCHIVED })
      .send();

    expect(res).to.have.status(200);
    expect(res.body.activities.length).to.equal(archivedActivities.length);

    expect(res.body).to.have.property('activities').that.is.an('array');
    expect(res.body.activities.length).to.be.at.most(10);
    expect(res.body.activities.length).to.be.greaterThan(0);

    res.body.activities.forEach((activity) => {
      expect(activity.status).to.equal(status.ARCHIVED);
      expect(activity.userId.toString()).to.equal(testUser._id.toString());
    });

    expect(res.body).to.have.property('skip').that.equals(0);
    expect(res.body).to.have.property('limit').that.equals(10);
  });
  it('should return 200 with skip=0 and limit=10 for completed activities only', async () => {
    const res = await request
      .execute(app)
      .get(route)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .query({ skip: 0, limit: 15, status: status.COMPLETED })
      .send();

    expect(res).to.have.status(200);
    expect(res.body.activities.length).to.equal(completedActivities.length);

    expect(res.body).to.have.property('activities').that.is.an('array');
    expect(res.body.activities.length).to.be.at.most(15);
    expect(res.body.activities.length).to.be.greaterThan(0);

    res.body.activities.forEach((activity) => {
      expect(activity.status).to.equal(status.COMPLETED);
      expect(activity.userId.toString()).to.equal(testUser._id.toString());
    });

    expect(res.body).to.have.property('skip').that.equals(0);
    expect(res.body).to.have.property('limit').that.equals(15);
  });
  it('should return activities with custom skip and limit close to the end', async () => {
    const skip = 30;
    const limit = 10;

    const res = await request
      .execute(app)
      .get(route)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .query({ skip, limit })
      .send();

    expect(res.body).to.have.property('activities').that.is.an('array');
    expect(res.body.activities.length).to.equal(limit);
    expect(res.body.skip).to.equal(skip);
    expect(res.body.limit).to.equal(limit);

    const expectedActivities = activities.slice(skip, skip + limit);

    res.body.activities.forEach((activity, index) => {
      expect(activity.id).to.equal(expectedActivities[index].id);
      expect(activity.name).to.equal(expectedActivities[index].name);
      expect(activity.description).to.equal(expectedActivities[index].description);
      expect(activity.status).to.not.equal(status.DELETED);
    });
  });
  it('should return fewer activities than limit if fewer activities exist', async () => {
    const skip = 0;
    const limit = 50;

    const res = await request
      .execute(app)
      .get(route)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .query({ skip, limit })
      .send();

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('activities').that.is.an('array');
    expect(res.body.activities.length).to.be.lessThanOrEqual(40);
    expect(res.body.skip).to.equal(skip);
    expect(res.body.limit).to.equal(limit);

    res.body.activities.forEach((activity, index) => {
      const expectedActivity = activities[skip + index];
      expect(activity.id).to.equal(expectedActivity.id);
      expect(activity.name).to.equal(expectedActivity.name);
      expect(activity.description).to.equal(expectedActivity.description);
    });
  });
  describe('GET/activities with skip- fail', () => {
    it('should return 401 if token is invalid', async () => {
      const invalidToken = 'Bearer invalid_token';
      const res = await request
        .execute(app)
        .get(route)
        .set('Authorization', `Bearer ${invalidToken}`)
        .set('Content-Type', 'application/json')
        .send();
      expect(res).to.have.status(401);
    });
  });
  it('should return 400 if skip is invalid', async () => {
    const res = await request
      .execute(app)
      .get(route)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .query({ skip: 'not a number' })
      .send();

    expect(res).to.have.status(400);
    expect(res.body.message).to.equal('ValidationError: "skip" must be a number');
  });
  it('should return 400 if limit is invalid', async () => {
    const res = await request
      .execute(app)
      .get(route)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .query({ limit: 'not a number' })
      .send();

    expect(res).to.have.status(400);
  });
  it('should return 400 if skip is negative', async () => {
    const res = await request
      .execute(app)
      .get(route)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .query({ skip: -5 })
      .send();

    expect(res).to.have.status(400);
  });
  it('should return 400 if limit is zero', async () => {
    const res = await request
      .execute(app)
      .get(route)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')
      .query({ limit: 0 })
      .send();

    expect(res).to.have.status(400);
  });
  it('should return 404 if user is not owner', async () => {
    const anotherUser = await ActivityTestUtils.createAnotherTestUser();
    const anotherAccessToken = cryptoUtils.generateToken({ _id: anotherUser._id }, 10000);

    const res = await request
      .execute(app)
      .get(route)
      .set('Authorization', `Bearer ${anotherAccessToken}`)
      .set('Content-Type', 'application/json')
      .send();

    expect(res).to.have.status(404);
  });
});

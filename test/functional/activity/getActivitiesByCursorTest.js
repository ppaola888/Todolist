import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp, { request } from 'chai-http';
import app from '../../../server.js';
import { status } from '../../../src/const/constant.js';
import cryptoUtils from '../../../src/utils/cryptoUtils.js';
import ActivityTestUtils from '../../fixtures/Utils.js';

chai.use(chaiHttp);

let testUser;
let accessToken;
let activities;
let deletedActivities;
let archivedActivities;
let openActivities;
let completedActivities;
let route = '/activities';

describe('Cursor Pagination Test', () => {
  beforeEach(async () => {
    testUser = await ActivityTestUtils.createTestUser();
    accessToken = cryptoUtils.generateToken({ _id: testUser._id }, 10000);
    activities = await ActivityTestUtils.addManyTestActivities(testUser._id, 20);
    deletedActivities = await ActivityTestUtils.addManyTestActivities(testUser._id, 5, status.DELETED);
    openActivities = await ActivityTestUtils.addManyTestActivities(testUser._id, 5, status.OPEN);
    completedActivities = await ActivityTestUtils.addManyTestActivities(testUser._id, 5, status.COMPLETED);
    archivedActivities = await ActivityTestUtils.addManyTestActivities(testUser._id, 5, status.ARCHIVED);
  });
  afterEach(async () => {
    await ActivityTestUtils.restore();
  });
  describe('GET/activities with cursor - success', () => {
    it('should return 200 with default parameters (direction = next, limit = 10) and only non-deleted activities', async () => {
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').send();

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('activities').that.is.an('array');
      expect(res.body.activities.length).to.be.at.most(10);
      expect(res.body.activities.length).to.be.greaterThan(0);

      expect(res.body).to.have.property('direction').that.equals('next');
      expect(res.body).to.have.property('nextCursor').that.is.a('string');
      expect(res.body).to.have.property('prevCursor').that.is.a('string');
      expect(res.body.nextCursor).to.not.eq(res.body.prevCursor);
      expect(res.body.nextCursor).to.eq(res.body.activities[res.body.activities.length - 1].id.toString());
      expect(res.body.prevCursor).to.eq(res.body.activities[0].id.toString());

      res.body.activities.forEach((activity) => {
        expect(activity.status).to.not.equal(status.DELETED);
        expect(activity.status).to.be.oneOf([status.OPEN, status.ARCHIVED, status.COMPLETED]);
      });
    });
    it('should return activities filtered by status open', async () => {
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ status: status.OPEN, limit: 5 }).send();

      expect(res).to.have.status(200);
      expect(res.body.activities).to.be.an('array').with.lengthOf(5);
      expect(res.body.activities.length).to.eq(openActivities.length);

      res.body.activities.forEach((activity) => {
        expect(activity.status).to.equal(status.OPEN);
      });
    });
    it('should return 200 and only the activities with status deleted', async () => {
      const res = await request.execute(app).get(route).set(`Authorization`, `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ status: status.DELETED }).send();
      expect(res).to.have.status(200);
      expect(res.body.activities).to.be.an('array').with.lengthOf(5);

      res.body.activities.forEach((activity) => {
        expect(activity.status).to.equal(status.DELETED);
      });
      res.body.activities.forEach((activity, index) => {
        expect(activity.name).to.equal(deletedActivities[index].name);
        expect(activity.description).to.equal(deletedActivities[index].description);
        expect(activity.id.toString()).to.equal(deletedActivities[index].id.toString());
        expect(activity.userId.toString()).to.equal(deletedActivities[index].userId.toString());
      });
    });
    it('should return activities with status archived and completed', async () => {
      const res = await request
        .execute(app)
        .get(route)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .query({ status: [status.ARCHIVED, status.COMPLETED], limit: 10 })
        .send();

      expect(res).to.have.status(200);
      expect(res.body.activities).to.be.an('array').with.lengthOf(10);

      const archivedActivities = res.body.activities.filter((activity) => activity.status === status.ARCHIVED);
      const completedActivities = res.body.activities.filter((activity) => activity.status === status.COMPLETED);

      expect(archivedActivities).length(5);
      expect(completedActivities).length(5);
    });
    it('should return activities filtered by completed status', async () => {
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ status: status.COMPLETED }).send();

      expect(res).to.have.status(200);
      expect(res.body.activities).to.be.an('array').with.lengthOf(5);

      res.body.activities.forEach((activity, index) => {
        expect(activity.status).to.equal(status.COMPLETED);
        expect(activity.name).to.equal(completedActivities[index].name);
        expect(activity.description).to.equal(completedActivities[index].description);
        expect(activity.id).to.equal(completedActivities[index]._id.toString());
        expect(activity.userId).to.equal(completedActivities[index].userId.toString());
      });
    });
    it('should return activities filtered by archived status', async () => {
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ status: status.ARCHIVED }).send();

      expect(res).to.have.status(200);
      expect(res.body.activities).to.be.an('array').with.lengthOf(5);

      res.body.activities.forEach((activity, index) => {
        expect(activity.status).to.equal(status.ARCHIVED);
        expect(activity.name).to.equal(archivedActivities[index].name);
        expect(activity.description).to.equal(archivedActivities[index].description);
        expect(activity.id).to.equal(archivedActivities[index]._id.toString());
        expect(activity.userId).to.equal(archivedActivities[index].userId.toString());
      });
    });
    it('should return all activities if no status is specified', async () => {
      const allActivities = [...activities, ...openActivities, ...completedActivities, ...archivedActivities];

      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ limit: 40 }).send();

      console.log('Response body:', res.body);

      expect(res).to.have.status(200);
      expect(res.body.activities).to.be.an('array').with.lengthOf(35);

      res.body.activities.forEach((activity, index) => {
        expect(activity.userId).to.equal(testUser._id.toString());
        expect(activity.name).to.equal(allActivities[index].name);
        expect(activity.description).to.equal(allActivities[index].description);
        expect(activity.id.toString()).to.equal(allActivities[index]._id.toString());
      });
    });
    it('should return 200 with default parameters (limit = 3', async () => {
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ limit: 3 }).send();

      expect(res).to.have.status(200);
      expect(res.body.activities.length).to.be.at.most(3);
    });
    it('should return activities with cursor pagination next direction', async () => {
      const limit = 5;
      const cursor = activities[0]._id.toString();
      const direction = 'next';

      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ cursor, limit, direction });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('activities').that.is.an('array').with.lengthOf(limit);
      expect(res.body).to.have.property('nextCursor');
      expect(res.body.nextCursor).to.equal(activities[limit]._id.toString());
      expect(res.body.prevCursor).to.equal(activities[1]._id.toString());

      const activitiesResponse = res.body.activities;
      activitiesResponse.forEach((activity, index) => {
        expect(activity.id).to.equal(activities[index + 1]._id.toString());
      });
    });
    it('should return activities with cursor pagination prev direction', async () => {
      const limit = 5;
      const cursor = activities[activities.length - limit]._id.toString();
      const direction = 'prev';

      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ cursor, limit, direction });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('activities').that.is.an('array').with.lengthOf(limit);
      expect(res.body).to.have.property('prevCursor');
      expect(res.body).to.have.property('nextCursor');
      console.log(res.body);

      expect(res.body.prevCursor).to.equal(res.body.activities[0].id.toString());
      expect(res.body.nextCursor).to.equal(res.body.activities[limit - 1].id.toString());
    });
  });
  it('should return 200 with second page of activities (limit = 5, direction = next)', async () => {
    const openActivities = await ActivityTestUtils.addManyTestActivities(testUser._id, 10, status.OPEN);

    const firstRes = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ limit: 5 }).send();

    expect(firstRes).to.have.status(200);
    expect(firstRes.body.activities.length).to.be.at.most(5);

    const firstPageActivities = firstRes.body.activities;

    const nextCursor = firstRes.body.nextCursor;
    expect(nextCursor).to.eq(firstPageActivities[firstPageActivities.length - 1].id.toString());

    const secondRes = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ limit: 5, cursor: nextCursor, direction: 'next' }).send();

    expect(secondRes).to.have.status(200);
    expect(secondRes.body.activities.length).to.be.at.most(5);

    const secondPageActivities = secondRes.body.activities;
    const prevCursor = secondRes.body.prevCursor;
    expect(prevCursor).to.eq(secondPageActivities[0].id.toString());

    const newNextCursor = secondRes.body.nextCursor;
    expect(newNextCursor).to.eq(secondPageActivities[secondPageActivities.length - 1].id.toString());

    secondRes.body.activities.forEach((activity) => {
      expect(activity.status).to.equal(status.OPEN);
    });

    expect(secondRes.body).to.have.property('nextCursor').that.is.a('string');
    expect(secondRes.body).to.have.property('prevCursor').that.is.a('string');
    expect(secondRes.body.nextCursor).to.not.eq(secondRes.body.prevCursor);

    expect(secondRes.body.prevCursor).to.eq(secondRes.body.activities[0].id.toString());
  });
  describe('GET/activities with cursor - fail', () => {
    it('should return 401 if token is invalid', async () => {
      const invalidToken = 'Bearer invalid_token';
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${invalidToken}`).set('Content-Type', 'application/json').send();

      expect(res).to.have.status(401);
    });
  });
  it('should return 404 if not activities found', async () => {
    await ActivityTestUtils.restore();
    const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query().send();

    expect(res).to.have.status(404);
    expect(res.body.message).to.equal('Activities not found');
  });
  it('should return 404 if no previous activities exist', async () => {
    const limit = 5;
    const cursor = activities[0]._id.toString();
    const direction = 'prev';

    const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ cursor, limit, direction });

    expect(res).to.have.status(404);
    expect(res.body.message).to.equal('Activities not found');
    expect(res.body).to.not.have.property('activities');
  });
  it('should return 400 if cursor is invalid', async () => {
    const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ cursor: 'not-objectID' }).send();

    expect(res).to.have.status(400);
  });
  it('should return 400 if limit is invalid', async () => {
    const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ limit: 'not a number' }).send();

    expect(res).to.have.status(400);
  });
  it('should return 400 if direction is invalid', async () => {
    const invalidDirection = 'invalid_direction';

    const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ direction: invalidDirection }).send();

    expect(res).to.have.status(400);
  });
  it('should return 400 if status is invalid', async () => {
    const invalidStatus = 'invalid_status';

    const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ status: invalidStatus }).send();

    expect(res).to.have.status(400);
  });
  it('should return 400 if status array contains invalid value', async () => {
    const invalidStatusArray = ['open', 'invalid_status'];

    const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'application/json').query({ status: invalidStatusArray }).send();

    expect(res).to.have.status(400);
  });
  it('should return 404 if user is not owner', async () => {
    const anotherUser = await ActivityTestUtils.createAnotherTestUser();
    const anotherAccessToken = cryptoUtils.generateToken({ _id: anotherUser._id }, 10000);

    const res = await request.execute(app).get(route).set('Authorization', `Bearer ${anotherAccessToken}`).set('Content-Type', 'application/json').send();

    expect(res).to.have.status(404);
  });
});

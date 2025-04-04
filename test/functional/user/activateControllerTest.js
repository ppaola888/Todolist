import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp, { request } from 'chai-http';
import app from '../../../server.js';
import { userStatus } from '../../../src/const/constant.js';
import FixtureUtils from '../../fixtures/Utils.js';
chai.use(chaiHttp);

const route = '/user/activate/:token';

describe('Activate User Controller Test', () => {
  beforeEach(async () => {});
  afterEach(async () => {
    await FixtureUtils.restore();
  });
  describe('GET/user/activate/:token - success', () => {
    it('should return 200 if user is pending', async () => {
      const testUser = await FixtureUtils.createTestUser(userStatus.PENDING);
      const activationToken = await FixtureUtils.addActivationToken(testUser._id);
      const res = await request.execute(app).get(route.replace(':token', activationToken.registrationToken)).send();

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('status', userStatus.ACTIVE);
      expect(res.body).to.have.property('_id').eq(testUser._id.toString());

      const updatedUser = await FixtureUtils.getUserById(testUser._id);
      expect(updatedUser).to.have.property('status', userStatus.ACTIVE);
      expect(res.body).to.have.property('_id').eq(testUser._id.toString());
      expect(updatedUser).to.have.property('email', testUser.email);
      expect(updatedUser).to.have.property('password');
      expect(updatedUser).to.have.property('salt');
    });
  });
  it('should return 200 if user is already active', async () => {
    const testUser = await FixtureUtils.createTestUser(userStatus.ACTIVE);
    const activationToken = await FixtureUtils.addActivationToken(testUser._id);

    const res = await request.execute(app).get(route.replace(':token', activationToken.registrationToken)).send();

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('status', userStatus.ACTIVE);
    expect(res.body).to.have.property('_id').eq(testUser._id.toString());

    const updatedUser = await FixtureUtils.getUserById(testUser._id);
    console.log('Updated user:', updatedUser);
    expect(updatedUser).to.have.property('status', userStatus.ACTIVE);
    expect(res.body).to.have.property('_id').eq(testUser._id.toString());
    expect(updatedUser).to.have.property('email', testUser.email);
    expect(updatedUser).to.have.property('password');
    expect(updatedUser).to.have.property('salt');
  });
  describe('GET/user/activate/:token - failure', () => {
    it('should return 400 if the token length < 10', async () => {
      const res = await request.execute(app).get(route.replace(':token', 'fake')).send();

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "token" length must be 10 characters long');
    });
    it('should return 400 if the token length > 10', async () => {
      const res = await request.execute(app).get(route.replace(':token', '12345678910')).send();

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "token" length must be 10 characters long');
    });
    it('should return 404 if token not found', async () => {
      const res = await request.execute(app).get(route.replace(':token', '0123456789')).send();
      expect(res).to.have.status(404);
    });
    it('should return 404 if user is in status deleted', async () => {
      const testUser = await FixtureUtils.createTestUser(userStatus.DELETED);
      const activationToken = await FixtureUtils.addActivationToken(testUser.id);
      const res = await request.execute(app).get(route.replace(':token', activationToken.registrationToken)).send();

      expect(res).to.have.status(404);
    });
  });
});

import * as chai from 'chai';
import chaiHttp from 'chai-http';
import { request } from 'chai-http';
import app from '../../../server.js';
import { expect } from 'chai';
import cryptoUtils from '../../../src/utils/cryptoUtils.js';
import ActivityTestUtils from '../../fixtures/Utils.js';
import { userStatus, status } from '../../../src/const/constant.js';
chai.use(chaiHttp);

const route = '/user/login';

describe('Login User Controller Test', () => {
  beforeEach(async () => {});
  afterEach(async () => {
    await ActivityTestUtils.restore();
  });
  describe('POST/user/login - success', () => {
    it('should return 200', async () => {
      const testUser = await ActivityTestUtils.createTestUser(userStatus.ACTIVE);
      const res = await request.execute(app).post(route).send({
        email: testUser.email,
        password: 'password123',
      });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('accessToken');
      expect(res.body).to.have.property('refreshToken');
      expect(res.body.email).eq(testUser.email);

      const accessToken = res.body.accessToken;
      const refreshToken = res.body.refreshToken;

      const decodedAccessToken = cryptoUtils.verifyJWT(accessToken);
      const decodedRefreshToken = cryptoUtils.verifyJWT(refreshToken);

      expect(decodedAccessToken).to.have.property('email', testUser.email);
      expect(decodedAccessToken).to.have.property('iat');
      expect(decodedAccessToken).to.have.property('exp');
      expect(decodedAccessToken).to.have.property('sub', testUser.id);

      expect(decodedRefreshToken).to.have.property('email', testUser.email);
      expect(decodedRefreshToken).to.have.property('iat');
      expect(decodedRefreshToken).to.have.property('exp');
      expect(decodedRefreshToken).to.have.property('sub', testUser.id);
    });
  });
  describe('POST/user/login - failure', () => {
    it('should return 400 if the email is not provided', async () => {
      const res = await request.execute(app).post(route).send({ password: 'password123' });

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "email" is required');
    });
    it('should return 400 if the email is invalid', async () => {
      const res = await request.execute(app).post(route).send({ email: 'dhfgfhfhf', password: 'password' });

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "email" must be a valid email');
    });
    it('should return 400 if the password is not provided', async () => {
      const res = await request.execute(app).post(route).send({ email: 'test@gmail.com' });

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "password" is required');
    });
    it('should return 401 if user not exists', async () => {
      const res = await request.execute(app).post(route).send({
        email: 'fake_email@gmail.com',
        password: 'password123',
      });
      expect(res).to.have.status(401);
    });
    it('should return 401 if password is not correct', async () => {
      const testUser = await ActivityTestUtils.createTestUser(userStatus.ACTIVE);
      const res = await request.execute(app).post(route).send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(res).to.have.status(401);
    });
    it('should return 401 if user is pending', async () => {
      const testUser = await ActivityTestUtils.createTestUser(userStatus.PENDING);
      const res = await request.execute(app).post(route).send({
        email: testUser.email,
        password: 'password123',
      });

      expect(res).to.have.status(401);
    });
    it('should return 401 if user is deleted', async () => {
      const testUser = await ActivityTestUtils.createTestUser(userStatus.DELETED);
      const res = await request.execute(app).post(route).send({
        email: testUser.email,
        password: 'password123',
      });

      expect(res).to.have.status(401);
    });
  });
});

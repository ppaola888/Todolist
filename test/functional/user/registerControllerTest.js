import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp, { request } from 'chai-http';
import sinon from 'sinon';
import app from '../../../server.js';
import { userStatus } from '../../../src/const/constant.js';
import BasicEmailGateway from '../../../src/gateway/BasicEmailGateway.js';
import ActivityTestUtils from '../../fixtures/Utils.js';

chai.use(chaiHttp);

let emailStub;
const route = '/user';
const sandbox = sinon.createSandbox();

describe('Register User Controller Test', () => {
  beforeEach(async () => {
    emailStub = sandbox.stub(BasicEmailGateway.prototype, 'send').resolves(true);
  });
  afterEach(async () => {
    await ActivityTestUtils.restore();
    sandbox.restore();
  });
  describe('POST/user - success', () => {
    it('should return 201 if the user is registered successfully and email is sent', async () => {
      const res = await request.execute(app).post(route).send({ email: 'test@example.com', password: 'password123', username: 'paola' });

      expect(res).to.have.status(201);
      expect(res.body.message).eq('Registrazione riuscita');

      const userFromDb = await ActivityTestUtils.getByEmail('test@example.com');

      expect(userFromDb.email).to.equal('test@example.com');
      expect(userFromDb.password).to.not.equal('password');
      expect(userFromDb.salt).to.be.a('string');
      expect(userFromDb.status).to.equal(userStatus.PENDING);
      expect(userFromDb.username).to.equal('paola');

      const token = await ActivityTestUtils.getTokenByUserId(userFromDb.id);

      expect(token).to.exist;
      expect(token.userId.toString()).to.equal(userFromDb._id.toString());
      expect(token.registrationToken).to.be.a('string');

      expect(emailStub.calledOnce).to.be.true;
    });
    it('should return 201 if the user is deleted and reactivated successfully', async () => {
      const deletedTestUser = await ActivityTestUtils.createTestUser(userStatus.DELETED, 'deletedUser');

      const res = await request.execute(app).post(route).send({ email: deletedTestUser.email, password: 'password123', username: 'deleted user' });

      expect(res).to.have.status(201);
      expect(res.body.message).eq('Registrazione riuscita');

      const reactivatedUser = await ActivityTestUtils.getByEmail(deletedTestUser.email);

      expect(reactivatedUser).to.exist;
      expect(reactivatedUser.status).to.equal(userStatus.PENDING);
      expect(reactivatedUser.email).to.equal(deletedTestUser.email);
      expect(reactivatedUser.username).to.equal('deleted user');
      expect(reactivatedUser.password).to.not.equal(deletedTestUser.password);
      expect(reactivatedUser.salt).to.be.a('string');

      const token = await ActivityTestUtils.getTokenByUserId(reactivatedUser._id);

      expect(token).to.exist;
      expect(token.userId.toString()).to.equal(reactivatedUser._id.toString());
      expect(token.registrationToken).to.be.a('string');

      expect(emailStub.calledOnce).to.be.true;
    });
    it('should return 201 if the user is already pending', async () => {
      const pendingTestUser = await ActivityTestUtils.createTestUser(userStatus.PENDING, 'userPending');

      const res = await request.execute(app).post(route).send({ email: pendingTestUser.email, password: 'password123', username: 'userPending' });

      expect(res).to.have.status(201);
      expect(res.body.message).eq('Registrazione riuscita');

      const reactivatedUser = await ActivityTestUtils.getByEmail(pendingTestUser.email);

      expect(reactivatedUser).to.exist;
      expect(reactivatedUser.status).to.equal(userStatus.PENDING);
      expect(reactivatedUser.email).to.equal(pendingTestUser.email);
      expect(reactivatedUser.password).to.not.equal(pendingTestUser.password);
      expect(reactivatedUser.username).to.equal('userpending');
      expect(reactivatedUser.salt).to.be.a('string');

      const token = await ActivityTestUtils.getTokenByUserId(reactivatedUser._id);

      expect(token).to.exist;
      expect(token.userId.toString()).to.equal(reactivatedUser._id.toString());
      expect(token.registrationToken).to.be.a('string');

      expect(emailStub.calledOnce).to.be.true;
    });
  });
  describe('POST/user - failure', () => {
    it('should return 400 if the email is not provided', async () => {
      const res = await request.execute(app).post(route).send({ password: 'password123', username: 'chiara' });

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "email" is required');
    });
    it('should return 400 if the email is invalid', async () => {
      const res = await request.execute(app).post(route).send({ email: 'dhfgfhfhf', password: 'password', username: 'paola' });

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "email" must be a valid email');
    });
    it('should return 400 if the password is not provided', async () => {
      const res = await request.execute(app).post(route).send({ email: 'test@gmail.com', username: 'francy' });

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "password" is required');
    });
    it('should return 400 if the username is not provided', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const res = await request.execute(app).post(route).send({ email: uniqueEmail, password: 'password123' });

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "username" is required');
    });
    it('should return 400 if the username is not a string', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const res = await request.execute(app).post(route).send({ email: uniqueEmail, password: 'password123', username: 123 });

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "username" must be a string');
    });
    it('should return 400 if username is less than 3 char', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const res = await request.execute(app).post(route).send({ email: uniqueEmail, password: 'password123', username: 'pa' });

      expect(res).to.have.status(400);
      expect(res.body.message).eq('ValidationError: "username" length must be at least 3 characters long');
    });
    it('should return 500 if email user already exists', async () => {
      const testUser = await ActivityTestUtils.createTestUser(userStatus.ACTIVE);
      const res = await request.execute(app).post(route).send({ email: testUser.email, password: 'password123', username: 'sergio' });

      expect(res).to.have.status(500);
      expect(res.body.message).eq('Error while registering user');
    });
  });
});

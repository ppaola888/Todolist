import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp, { request } from 'chai-http';
import app from '../../../server.js';
import { userStatus } from '../../../src/const/constant.js';
import cryptoUtils from '../../../src/utils/cryptoUtils.js';
import ActivityTestUtils from '../../fixtures/Utils.js';

chai.use(chaiHttp);

const route = '/user/list';

describe('Get Users By DisplayName Controller Test', () => {
  beforeEach(async () => {
    await ActivityTestUtils.restore();
  });
  afterEach(async () => {
    await ActivityTestUtils.restore();
  });
  describe('GET /user/list - success', () => {
    it('should return 200 and a list of users matching the display name', async () => {
      const testUser1 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'paola_p');
      const testUser2 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'sergio');
      const testUser3 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'pao_l_a');

      const accessToken = cryptoUtils.generateToken({ _id: testUser1.id }, 10000);

      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pao', limit: 10, sortBy: 'username' });
      console.log(res.body);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('users');
      expect(res.body.users).to.be.an('array').with.lengthOf(2);

      const expectedUsernames = [testUser3.username, testUser1.username];
      const actualUsernames = res.body.users.map((user) => user.username);
      expect(actualUsernames.sort()).to.deep.equal(expectedUsernames.sort());

      expect(actualUsernames).to.not.include(testUser2.username);

      res.body.users.forEach((user) => {
        expect(user).to.have.property('username');
        expect(user).to.have.property('id');
      });
    });
    it('should return 200 and respect the limit parameter', async () => {
      const testUser1 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'paola_p');
      const testUser2 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'sergio');
      const testUser3 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'pao_l_a');
      const testUser4 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'pao_l_b');
      const testUser5 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'pao_l_c');
      const testUser6 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'pao_l_d');
      const accessToken = cryptoUtils.generateToken({ _id: testUser1.id }, 10000);

      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pao', limit: 3, sortBy: 'username' });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('users');
      expect(res.body.users).to.be.an('array').with.lengthOf(3);

      const expectedUsernames = [testUser3.username, testUser4.username, testUser5.username];
      const actualUsernames = res.body.users.map((user) => user.username);

      expect(actualUsernames).to.deep.equal(expectedUsernames);

      expect(actualUsernames).to.not.include(testUser1.username);
      expect(actualUsernames).to.not.include(testUser2.username);
      expect(actualUsernames).to.not.include(testUser6.username);

      res.body.users.forEach((user) => {
        expect(user).to.have.property('username');
        expect(user).to.have.property('id');
      });
    });
    it('should return users in ascending order with "next" direction', async () => {
      const testUser1 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'paola_p');
      const testUser2 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'sergio');
      const testUser3 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'pao_l_a');
      const testUser4 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'pao_l_b');
      const testUser5 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'pao_l_c');

      const accessToken = cryptoUtils.generateToken({ _id: testUser1.id }, 10000);

      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pao', limit: 4, direction: 'next' });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('users');
      expect(res.body.users).to.be.an('array').with.lengthOf(4);

      const expectedUsernames = [testUser3.username, testUser4.username, testUser5.username, testUser1.username];
      const actualUsernames = res.body.users.map((user) => user.username);

      expect(actualUsernames.sort()).to.deep.equal(expectedUsernames.sort());
      expect(actualUsernames).to.not.include(testUser2.username);

      res.body.users.forEach((user) => {
        expect(user).to.have.property('username');
        expect(user).to.have.property('id');
      });
    });
    it('should return users in descending order with "prev" direction', async () => {
      const testUser1 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'paola_p');
      const testUser2 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'sergio');
      const testUser3 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'pao_l_a');
      const testUser4 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'pao_l_b');
      const testUser5 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'pao_l_c');

      const accessToken = cryptoUtils.generateToken({ _id: testUser1.id }, 10000);

      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pao', limit: 4, direction: 'prev' });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('users');
      expect(res.body.users).to.be.an('array').with.lengthOf(4);

      const expectedUsernames = [testUser1.username, testUser5.username, testUser4.username, testUser3.username];
      const actualUsernames = res.body.users.map((user) => user.username);

      expect(actualUsernames.sort()).to.deep.equal(expectedUsernames.sort());
      expect(actualUsernames).to.not.include(testUser2.username);

      res.body.users.forEach((user) => {
        expect(user).to.have.property('username');
        expect(user).to.have.property('id');
      });
    });
    it('should return an empty array if no users match the display name', async () => {
      const testUser1 = await ActivityTestUtils.createTestUser(userStatus.ACTIVE, 'paola_p');
      const accessToken = cryptoUtils.generateToken({ _id: testUser1.id }, 10000);

      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'nonexistent', limit: 10 });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('users');
      expect(res.body.users).to.be.an('array').with.lengthOf(0);

      expect(res.body).to.have.property('cursor');
      expect(res.body.cursor).to.be.null;
      expect(res.body).to.have.property('direction');
      expect(res.body.direction).to.equal('next');
      expect(res.body).to.have.property('limit');
      expect(res.body.limit).to.equal(10);
    });
  });
  describe('GET /user/list - failure', () => {
    it('should return 400 if Content-Type is not application/json', async () => {
      const accessToken = cryptoUtils.generateToken({ _id: 'testUserId' }, 10000);

      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).set('Content-Type', 'text/plain').query({});

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('ValidationError: "content-type" must be [application/json]');
    });
    it('should return 400 if cursor is not a valid ObjectId', async () => {
      const accessToken = cryptoUtils.generateToken({ _id: 'testUserId' }, 10000);

      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pao', cursor: 'invalidObjectId', limit: 10 });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('ValidationError: "cursor" must only contain hexadecimal characters. "cursor" length must be 24 characters long');
    });
    it('should return 400 if limit is not a valid number', async () => {
      const accessToken = cryptoUtils.generateToken({ _id: 'testUserId' }, 10000);
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pao', limit: 'invalidNumber' });
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('ValidationError: "limit" must be a number');
    });
    it('should return 400 if limit is less than 1', async () => {
      const accessToken = cryptoUtils.generateToken({ _id: 'testUserId' }, 10000);
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pao', limit: 0 });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('ValidationError: "limit" must be greater than or equal to 1');
    });
    it('should return 400 if cursor is less than 24 characters', async () => {
      const accessToken = cryptoUtils.generateToken({ _id: 'testUserId' }, 10000);

      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pao', cursor: '1234567890123456789012' });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('ValidationError: "cursor" length must be 24 characters long');
    });
    it('should return 400 if cursor is more than 24 characters', async () => {
      const accessToken = cryptoUtils.generateToken({ _id: 'testUserId' }, 10000);
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pao', cursor: '12345678901234567890123456' });
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('ValidationError: "cursor" length must be 24 characters long');
    });
    it('should return 400 if direction is not "next" or "prev"', async () => {
      const accessToken = cryptoUtils.generateToken({ _id: 'testUserId' }, 10000);
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pao', direction: 'invalidDirection' });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('ValidationError: "direction" must be one of [next, prev]');
    });
    it('should return 400 if text is less than 3 characters', async () => {
      const accessToken = cryptoUtils.generateToken({ _id: 'testUserId' }, 10000);
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pa', limit: 10 });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('ValidationError: "text" length must be at least 3 characters long');
    });
    it('should return 400 if sortBy is not a valid field', async () => {
      const accessToken = cryptoUtils.generateToken({ _id: 'testUserId' }, 10000);
      const res = await request.execute(app).get(route).set('Authorization', `Bearer ${accessToken}`).query({ text: 'pao', sortBy: 'invalidField' });
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('ValidationError: "sortBy" must be one of [_id, username]');
    });
  });
});

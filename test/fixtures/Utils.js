import { userStatus } from '../../src/const/constant.js';
import registrationToken from '../../src/schema/registrationTokenSchema.js';
import Activity from '../../src/schema/todoListSchema.js';
import User from '../../src/schema/userSchema.js';
import cryptoUtils from '../../src/utils/cryptoUtils.js';

class ActivityTestUtils {
  async createTestUser(status = userStatus.PENDING) {
    //const uniqueEmail = `test${Date.now()}@example.com`;
    const hashedPassword = cryptoUtils.hashPassword('password123');
    const testUser = new User({
      email: 'test@example.com',
      password: hashedPassword.password,
      salt: hashedPassword.salt,
      status: status,
    });
    await testUser.save();
    console.log(testUser.toObject());
    return testUser;
  }

  async createAnotherTestUser() {
    const newTestUser = new User({
      email: 'testemail@example.com',
      password: 'password123',
      salt: '1234567890abcdef',
      status: userStatus.ACTIVE,
    });
    await newTestUser.save();
    return newTestUser;
  }

  async addActivationToken(userId) {
    const activationToken = cryptoUtils.generateUniqueCode(10);
    const token = new registrationToken({
      userId: userId,
      registrationToken: activationToken,
    });
    await token.save();
    return {
      registrationToken: activationToken,
    };
  }

  async getUserById(userId) {
    return await User.findById(userId);
  }

  async addTestActivity(userId, status) {
    const testActivity = new Activity({
      name: 'Test activity',
      description: 'Description test activity',
      dueDate: new Date(),
      status: status || 'open',
      userId: userId, //new mongoose.Types.ObjectId(userId),
    });

    const newActivity = await testActivity.save();
    return newActivity;
  }

  async addManyTestActivities(userId, numActivities, status) {
    const activities = [];
    for (let i = 1; i <= numActivities; i++) {
      const activity = new Activity({
        name: `Test activity ${i}`,
        description: `Description for test activity ${i}`,
        dueDate: new Date(),
        status: status,
        userId: userId,
      });
      await activity.save();
      activities.push(activity);
    }
    return activities;
  }

  async getActivityById(activityId) {
    const activity = await Activity.findOne({ _id: activityId });
    return activity;
  }

  async getByEmail(email) {
    const user = await User.findOne({ email: email });
    return user;
  }

  async getTokenByUserId(userId) {
    const token = await registrationToken.findOne({ userId: userId });
    return token;
  }

  async restore() {
    await Promise.all([User.deleteMany({}), Activity.deleteMany({})]);
  }
}

export default new ActivityTestUtils();

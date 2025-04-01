import { expect } from 'chai';
import * as chai from 'chai';
import activityRepository from '../../src/repository/activityRepository.js';
import { status } from '../../src/const/constant.js';
import sinon from 'sinon';
import activitySchema from '../../src/schema/todoListSchema.js';
import mongoose from 'mongoose';
import NotFoundException from '../../src/exceptions/NotFoundException.js';
import UnauthorizedException from '../../src/exceptions/UnauthorizedException.js';
import MongoInternalException from '../../src/exceptions/MongoInternalException.js';
import ForbiddenException from '../../src/exceptions/ForbiddenException.js';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const sandbox = sinon.createSandbox();

describe('Activity Repository Test', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('completeActivity', () => {
    it('should set status completed', async () => {
      const activityId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId().toString();

      const stub = sandbox.stub(activitySchema, 'findOneAndUpdate').callsFake(() => {
        return { status: status.COMPLETED, _id: activityId };
      });
      const activity = await activityRepository.completeActivity(activityId, userId);
      expect(activity.status).eq(status.COMPLETED);
      expect(stub.calledOnce).to.be.true;
    });

    describe('completeActivity - Exceptions', () => {
      it('should throw NotFoundException if activity does not exists', async () => {
        const activityId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId().toString();

        const stub = sandbox.stub(activitySchema, 'findOneAndUpdate').resolves(null);

        try {
          const activity = await activityRepository.completeActivity(activityId, userId);
        } catch (error) {
          expect(error).to.be.instanceOf(NotFoundException);
          expect(error.message).to.equal('Activity not found or not updated');
        }
        expect(stub.calledOnce).to.be.true;
      });

      it('should throw a MongoInternalException if findOneAndUpdate fails', async () => {
        const activityId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId().toString();

        const stub = sandbox.stub(activitySchema, 'findOneAndUpdate').rejects(new Error('DB Error'));
        //.throws(new MongoInternalException('MongoDB error', 'activityRepository.updateActivity'));
        // throws no perchè è async

        try {
          await activityRepository.completeActivity(activityId, userId);
        } catch (error) {
          expect(error).to.be.instanceOf(MongoInternalException);
          expect(error.message).to.equal('Error on updating activity');
        }
        expect(stub.calledOnce).to.be.true;
      });
    });
  });

  //it('should throw an error if user is not logged in', async () => {
  //  const activityId = new mongoose.Types.ObjectId();
  //  const userId = null;
  //
  //  const stub = sandbox
  //    .stub(activitySchema, 'findOneAndUpdate')
  //    .throws(new UnauthorizedException('Unauthorized Error', 'activityRepository.updateActivity'));
  //
  //  try {
  //    const activity = await activityRepository.completeActivity(activityId, userId);
  //  } catch (error) {
  //    expect(error).to.be.instanceOf(UnauthorizedException);
  //    expect(error.message).to.include('Unauthorized Error');
  //  }
  //});

  //it('should throw an error if user is not the owner of the activity', async () => {
  //  const activityId = new mongoose.Types.ObjectId();
  //  const ownerId = new mongoose.Types.ObjectId().toString();
  //  const userId = new mongoose.Types.ObjectId().toString();

  //const fakeActivity = {
  //  _id: activityId,
  //  userId: ownerId,
  //  status: status.OPEN,
  //};

  //
  //  const stub = sandbox
  //    .stub(activitySchema, 'findOneAndUpdate')
  //    .resolves(fakeActivity);
  //
  //  try {
  //    await activityRepository.completeActivity(activityId, userId);
  //  } catch (error) {
  //    expect(error).to.be.instanceOf(ForbiddenException);
  //    expect(error.message).to.include('User is not the owner of the activity');
  //  }
  //    expect(stub.calledOnce).to.be.true;
  //});

  describe('updateActivity', () => {
    it('should update an activity and return the activity updated', async () => {
      const activityId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId().toString();
      const data = { name: 'Updated activity', description: 'New description', dueDate: new Date() };

      const fakeActivity = {
        _id: activityId,
        userId: userId,
        name: data.name,
        description: data.description,
        dueDate: data.dueDate,
      };

      const stub = sandbox.stub(activitySchema, 'findOneAndUpdate').resolves(fakeActivity);
      const activity = await activityRepository.updateActivity(activityId, userId, data);

      expect(activity.id).eq(activityId.toString());
      expect(activity.userId).eq(userId);
      expect(activity.name).eq(data.name);
      expect(activity.description).eq(data.description);
      expect(activity.dueDate.toISOString()).eq(data.dueDate.toISOString());

      expect(stub.calledOnceWithExactly({ _id: activityId, userId: userId }, data, { upsert: false, new: true })).to.be
        .true;

      expect(stub.calledOnce).to.be.true;
    });

    describe('updateActivity - Exceptions', () => {
      it('should throw MongoInternalException if findOneAndUpdate fails', async () => {
        const activityId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId().toString();
        const data = { name: 'Updated activity', description: 'New description', dueDate: new Date() };

        const stub = sandbox.stub(activitySchema, 'findOneAndUpdate').rejects(new Error('Mongo Error'));
        try {
          await activityRepository.updateActivity(activityId, userId, data);
        } catch (error) {
          expect(error).to.be.instanceOf(MongoInternalException);
          expect(error.message).to.include('Error on updating activity');
        }
        expect(stub.calledOnce).to.be.true;
      });

      it('should throw NotFoundException if activity is not found', async () => {
        const activityId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId().toString();
        const data = { name: 'Updated activity', description: 'New description' };

        const stub = sandbox.stub(activitySchema, 'findOneAndUpdate').resolves(null);

        try {
          await activityRepository.updateActivity(activityId, userId, data);
        } catch (error) {
          expect(error).to.be.instanceOf(NotFoundException);
          expect(error.message).to.include('Activity not found or not updated');
        }
        expect(stub.calledOnce).to.be.true;
      });
    });
  });

  describe('soft-deleted', () => {
    it('should mark an activity as deleted', async () => {
      const activityId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId().toString();

      const fakeActivity = {
        _id: activityId,
        userId: userId,
        status: 'deleted',
      };

      const stub = sandbox.stub(activitySchema, 'findOneAndUpdate').resolves(fakeActivity);
      const activity = await activityRepository.updateActivity(activityId, userId, { status: 'deleted' });

      expect(activity.id).eq(activityId.toString());
      expect(activity.userId).eq(userId);
      expect(activity.status).eq('deleted');

      expect(stub.calledOnce).to.be.true;
    });
  });

  describe('getActivity', () => {
    it('should return an activity if it exists', async () => {
      const activityId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId().toString();

      const fakeActivity = {
        _id: activityId,
        userId: userId,
        name: 'Test activity',
        description: 'Description test',
      };

      const stub = sandbox.stub(activitySchema, 'findOne').resolves(fakeActivity);
      const activity = await activityRepository.getActivity(activityId, userId);

      expect(activity.id).eq(activityId.toString());
      expect(activity.userId).eq(userId);
      expect(activity.name).eq(fakeActivity.name);
      expect(activity.description).eq(fakeActivity.description);
      expect(stub.calledOnce).to.be.true;
    });

    describe('getActivity - Exceptions', () => {
      it('should throw NotFoundException if activity does not exist', async () => {
        const activityId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId().toString();

        const stub = sandbox.stub(activitySchema, 'findOne').resolves(null);

        try {
          await activityRepository.getActivity(activityId, userId);
        } catch (error) {
          expect(error).to.be.instanceOf(NotFoundException);
          expect(error.message).to.include('Activity not found');
        }
        expect(stub.calledOnce).to.be.true;
      });

      it('should throw MongoInternalException if findOne fails', async () => {
        const activityId = new mongoose.Types.ObjectId();
        const userId = new mongoose.Types.ObjectId().toString();

        const stub = sandbox.stub(activitySchema, 'findOne').rejects(new Error('Mongo error'));

        try {
          await activityRepository.getActivity(activityId, userId);
        } catch (error) {
          expect(error).to.be.instanceOf(MongoInternalException);
          expect(error.message).to.include('Error on getting activity');
        }
        expect(stub.calledOnce).to.be.true;
      });
    });
  });

  describe('addActivity', () => {
    it('should add new activity', async () => {
      const activityId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId().toString();
      const data = { name: 'Test activity', userId: userId };
      const fakeActivity = { _id: activityId, ...data, status: status.OPEN };

      const stub = sandbox.stub(activitySchema, 'create').resolves(fakeActivity);

      const activity = await activityRepository.add(data);

      expect(activity.id).eq(fakeActivity._id.toString());
      expect(activity.userId).eq(data.userId);
      expect(activity.name).eq(data.name);
      expect(activity.status).eq(status.OPEN);
      expect(stub.calledOnce).to.be.true;
    });

    describe('addActivity - Exceptions', () => {
      it('should throw MongoInternalException if create activity fails', async () => {
        const data = { name: 'Test activity', userId: new mongoose.Types.ObjectId().toString() };

        const stub = sandbox.stub(activitySchema, 'create').rejects(new Error('Mongo Error'));
        try {
          await activityRepository.add(data);
        } catch (error) {
          expect(error).to.be.instanceOf(MongoInternalException);
          expect(error.message).to.include('Error on adding activity:');
        }
        expect(stub.calledOnce).to.be.true;
      });

      //describe('getActivities with skip and limit', () => {
      //it('should return a list of activities', async () => {
      //  const userId = new mongoose.Types.ObjectId().toString();
      //  const skip = 0;
      //  const limit = 5;
      //
      //  const fakeActivities = [
      //    {
      //      _id: new mongoose.Types.ObjectId(),
      //      userId,
      //      name: 'Activity 1',
      //      description: 'desc activity 1',
      //      status: status.OPEN,
      //    },
      //    {
      //      _id: new mongoose.Types.ObjectId(),
      //      userId,
      //      name: 'Activity 2',
      //      description: 'desc activity 2',
      //      status: status.OPEN,
      //    },
      //  ];
      //
      //  const stub = sandbox.stub(activitySchema, 'find').callsFake(() => ({
      //    skip: sandbox.stub().callsFake(() => ({
      //      limit: sandbox.stub().resolves(fakeActivities),
      //    })),
      //  }));
      //
      //  const activities = await activityRepository.getActivities(userId, skip, limit);
      //
      //  expect(activities).to.be.an('array');
      //  expect(activities).to.have.lengthOf(fakeActivities.length);
      //
      //  activities.forEach((activity, index) => {
      //    expect(activity.id).to.eq(fakeActivities[index]._id.toString());
      //    expect(activity.userId).to.eq(fakeActivities[index].userId);
      //    expect(activity.name).to.eq(fakeActivities[index].name);
      //    expect(activity.description).to.eq(fakeActivities[index].description);
      //    expect(activity.status).to.eq(fakeActivities[index].status);
      //  });
      //  expect(stub.calledOnce).to.be.true;
      //});
      //
      // describe('getActivities with skip and limit - Exceptions', () => {
      //it('should throw MongoInternalException if getActivities fails', async () => {
      //  const userId = new mongoose.Types.ObjectId().toString();
      //  const skip = 0;
      //  const limit = 5;
      //
      //  const stub = sandbox
      //    .stub(activitySchema, 'find')
      //    .rejects(new Error('Error on getting activities'));
      //
      //  try {
      //    await activityRepository.getActivities(userId, skip, limit);
      //  } catch (error) {
      //    expect(error).to.be.instanceOf(MongoInternalException);
      //    expect(error.message).to.include('Error on getting activities');
      //  }
      //  expect(stub.calledOnce).to.be.true;
      //});
    });
  });
});

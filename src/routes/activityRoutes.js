import addController from '../../src/controllers/addController.js';
import archiveController from '../../src/controllers/archiveController.js';
import deleteController from '../../src/controllers/deleteController.js';
import getController from '../../src/controllers/getController.js';
import { getActivitiesByCursor, getMany } from '../../src/controllers/getManyController.js';
import updateController from '../../src/controllers/updateController.js';
import addValidator from '../../src/validators/addValidator.js';
import retrieveValidator from '../../src/validators/retrieveValidator.js';
import updateValidator from '../../src/validators/updateValidator.js';
import activateController from '../controllers/activateController.js';
import completeController from '../controllers/completeController.js';
import getUserListController from '../controllers/getUserListController.js';
import loginController from '../controllers/loginController.js';
import registerController from '../controllers/registerController.js';
import reopenController from '../controllers/reopenController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import activateValidator from '../validators/activateValidator.js';
import archiveValidator from '../validators/archiveValidator.js';
import completeValidator from '../validators/completeValidator.js';
import cursorValidator from '../validators/cursorValidator.js';
import loginUserValidator from '../validators/loginUserValidator.js';
import registerUserValidator from '../validators/registerUserValidator.js';
import reopenValidator from '../validators/reopenValidator.js';
import skipValidator from '../validators/skipValidator.js';
import userListValidator from '../validators/userListValidator.js';

const setup = (app) => {
  app.get('/', authMiddleware, skipValidator, getMany);
  app.get('/activities', authMiddleware, cursorValidator, getActivitiesByCursor);
  app.get('/:id', authMiddleware, retrieveValidator, getController);
  app.post('/', authMiddleware, addValidator, addController);
  app.patch('/:id/complete', authMiddleware, completeValidator, completeController);
  app.patch('/:id/reopen', authMiddleware, reopenValidator, reopenController);
  app.patch('/:id/archive', authMiddleware, archiveValidator, archiveController);
  app.patch('/:id', authMiddleware, updateValidator, updateController);
  app.delete('/:id', authMiddleware, deleteController);
  app.post('/user', registerUserValidator, registerController);
  app.get('/user/activate/:token', activateValidator, activateController);
  app.post('/user/login', loginUserValidator, loginController);
  app.get('/user/list', authMiddleware, userListValidator, getUserListController);
  app.use((error, req, res, next) => {
    if (error && error.error && error.error.isJoi) {
      res.status(400).json({
        type: error.type,
        message: error.error.toString(),
      });
    } else {
      next(error);
    }
  });
};

export default setup;

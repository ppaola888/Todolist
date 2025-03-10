import addValidator from '../../src/validators/addValidator.js';
import retrieveValidator from '../../src/validators/retrieveValidator.js';
import updateValidator from '../../src/validators/updateValidator.js';
import activateValidator from '../validators/activateValidator.js';
import addController from '../../src/controllers/addController.js';
import getManyController from '../../src/controllers/getManyController.js';
import getController from '../../src/controllers/getController.js';
import updateController from '../../src/controllers/updateController.js';
import deleteController from '../../src/controllers/deleteController.js';
import registerUserValidator from '../validators/registerUserValidator.js';
import registerController from '../controllers/registerController.js';
import activateController from '../controllers/activateController.js';

const setup = (app) => {
  app.get('/:id', retrieveValidator, getController);
  app.get('/', getManyController);
  app.post('/', addValidator, addController);
  app.patch('/:id', updateValidator, updateController);
  app.delete('/:id', deleteController);
  app.post('/user', registerUserValidator, registerController);
  app.get('/user/activate/:token', activateValidator, activateController);
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

import UserListNormalizer from '../normalizer/UserListNormalizer.js';
import userService from '../services/userService.js';

const getUserListController = async (req, res) => {
  const { text, cursor, limit, direction } = req.query;
  const sortBy = req.query.sortBy || 'username';
  try {
    const users = await userService.getUsersByDisplayName({ text, cursor, limit, direction, sortBy });

    const normalizedUserList = new UserListNormalizer(users, cursor, limit, direction, sortBy).normalize();

    return res.status(200).json(normalizedUserList);
  } catch (error) {
    return res.status(500).json({ message: 'Error while retrieving user list', error: error.message });
  }
};

export default getUserListController;

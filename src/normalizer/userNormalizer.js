const userNormalizer = (user, accessToken, refreshToken) => {
  return {
    userId: user._id,
    email: user.email,
    accessToken,
    refreshToken,
  };
};

export default userNormalizer;

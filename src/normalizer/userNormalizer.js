const userNormalizer = (user, accessToken, refreshToken) => {
  return {
    userId: user._id,
    email: user.email,
    accessToken,
    refreshToken,
  };
};

export default userNormalizer;

/*const userNormalizer = (user) => ({
  userId: user._id,
  email: user.email,
});

//Decorator 
const addTokens = (normalizer) => {
  return (user, accessToken, refreshToken) => {
    return {
      ...normalizer(user), 
      accessToken,
      refreshToken,
    };
  };
};
const userNormalizerWithTokens = addTokens(userNormalizer);
console.log(userNormalizerWithTokens(user, "accessToken", "refreshToken")); */

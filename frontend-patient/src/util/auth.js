export const getAuthToken = () => {
  const token = localStorage.getItem("token-patient");
  return token;
};

export const tokenLoader = () => {
  return getAuthToken();
};

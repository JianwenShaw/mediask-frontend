export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockLogin = async () => {
  await delay(1000);
  const data = { token: "mock-token", user: { id: "1", name: "张三", phone: "13800138000" } };
  localStorage.setItem("mediask_token", data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem("mediask_token");
};

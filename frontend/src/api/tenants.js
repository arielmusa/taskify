import api from "./http";

export const getTenants = async () => {
  const response = await api.get("/tenants");
  return response.data;
};

export const createTenant = async (name) => {
  const response = await api.post("/tenants", { name });
  return response.data;
};

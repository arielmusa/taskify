import api from "./http";

export async function getStatuses(tenantId, projectId) {
  const { data } = await api.get(
    `/tenants/${tenantId}/projects/${projectId}/statuses`
  );
  return data;
}

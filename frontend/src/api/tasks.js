import api from "./http";

export async function getTasks(tenantId, projectId) {
  const { data } = await api.get(
    `/tenants/${tenantId}/projects/${projectId}/tasks`
  );
  return data;
}

export async function createTask(tenantId, projectId, payload) {
  const { data } = await api.post(
    `/tenants/${tenantId}/projects/${projectId}/tasks`,
    payload
  );
  return data;
}

export async function updateTask(tenantId, projectId, taskId, payload) {
  const { data } = await api.put(
    `/tenants/${tenantId}/projects/${projectId}/tasks/${taskId}`,
    payload
  );
  return data;
}

export async function deleteTask(tenantId, projectId, taskId) {
  const { data } = await api.delete(
    `/tenants/${tenantId}/projects/${projectId}/tasks/${taskId}`
  );
  return data;
}

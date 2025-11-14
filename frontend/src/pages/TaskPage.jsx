import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStatuses } from "../api/statuses";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import { io } from "socket.io-client";

export default function TasksPage() {
  const { tenantId, projectId } = useParams();

  const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status_id: "",
  });

  // LOAD statuses and tasks
  useEffect(() => {
    async function load() {
      try {
        const s = await getStatuses(tenantId, projectId);
        setStatuses(s);

        const t = await getTasks(tenantId, projectId);
        setTasks(t);

        if (s.length > 0) {
          setForm((prev) => ({ ...prev, status_id: s[0].id }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [tenantId, projectId]);

  // SOCKET.IO
  useEffect(() => {
    const socket = io("http://localhost:3000", {
      withCredentials: true,
    });

    socket.emit("joinProject", projectId);

    socket.on("taskCreated", (task) => {
      setTasks((prev) => [...prev, task]);
    });

    socket.on("taskUpdated", (task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    });

    socket.on("taskDeleted", (payload) => {
      const deletedId = payload.id;
      setTasks((prev) => prev.filter((t) => t.id !== deletedId));
    });

    return () => socket.disconnect();
  }, [projectId]);

  // CREATE TASK
  async function handleCreate(e) {
    e.preventDefault();
    try {
      await createTask(tenantId, projectId, form);
      setForm({
        title: "",
        description: "",
        status_id: statuses[0]?.id || "",
      });
    } catch (err) {
      console.error(err);
    }
  }

  // UPDATE TASK STATUS
  async function changeStatus(taskId, statusId) {
    try {
      await updateTask(tenantId, projectId, taskId, { status_id: statusId });
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Task Board</h2>

      {/* CREATE TASK */}
      <form className="mb-4" onSubmit={handleCreate}>
        <input
          className="form-control mb-2"
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="form-control mb-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          className="form-select mb-2"
          value={form.status_id}
          onChange={(e) => setForm({ ...form, status_id: e.target.value })}
        >
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <button className="btn btn-primary">Create Task</button>
      </form>

      {/* KANBAN BOARD */}
      <div className="row">
        {statuses.map((status) => {
          const filtered = tasks.filter((t) => t.status_id === status.id);

          return (
            <div key={status.id} className="col">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <strong>{status.name}</strong>
                </div>

                <div className="card-body" style={{ minHeight: "200px" }}>
                  {filtered.map((task) => {
                    const statusIndex = statuses.findIndex(
                      (s) => s.id === task.status_id
                    );
                    const isFirst = statusIndex === 0;
                    const isLast = statusIndex === statuses.length - 1;

                    return (
                      <div
                        key={task.id}
                        className="p-2 border rounded mb-2 bg-white"
                      >
                        {/* TASK HEADER (title + delete) */}
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>{task.title}</strong>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              deleteTask(tenantId, projectId, task.id)
                            }
                          >
                            ✕
                          </button>
                        </div>

                        <p className="m-0 text-muted small">
                          {task.description || "No description"}
                        </p>

                        {/* ARROWS */}
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          {!isFirst && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                changeStatus(
                                  task.id,
                                  statuses[statusIndex - 1].id
                                )
                              }
                            >
                              ←
                            </button>
                          )}

                          <div className="flex-grow-1"></div>

                          {!isLast && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                changeStatus(
                                  task.id,
                                  statuses[statusIndex + 1].id
                                )
                              }
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filtered.length === 0 && (
                    <p className="text-muted small">No tasks</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

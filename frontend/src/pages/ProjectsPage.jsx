import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { getProjects, createProject } from "../api/projects";

export default function ProjectsPage() {
  const { tenantId } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProjects(tenantId);
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tenantId]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const newProject = await createProject(tenantId, form);
      setProjects((prev) => [...prev, newProject]);
      setForm({ name: "", description: "" });
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container py-4">
      <h2>Projects</h2>

      <form className="mb-4" onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Project name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        ></textarea>

        <button className="btn btn-primary">Create Project</button>
      </form>

      {/* Project list */}
      <div className="list-group">
        {projects.map((p) => (
          <div
            key={p.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{p.name}</strong>
              <p className="m-0 text-muted">{p.description}</p>
            </div>
            <Link
              className="btn btn-outline-secondary"
              to={`/tenants/${tenantId}/projects/${p.id}`}
            >
              Open
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

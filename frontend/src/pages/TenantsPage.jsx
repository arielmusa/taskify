import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTenants, createTenant } from "../api/tenants.js";

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [newTenant, setNewTenant] = useState("");

  useEffect(() => {
    getTenants().then(setTenants);
  }, []);

  const handleCreate = async () => {
    if (!newTenant.trim()) return;

    try {
      const created = await createTenant(newTenant);

      setTenants((prev) => [...prev, created]);
      setNewTenant("");
    } catch (err) {
      alert("Errore nella creazione del tenant");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">I tuoi Tenant</h2>

      <ul className="list-group mb-4">
        {tenants.map((tenant) => (
          <li
            key={tenant.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{tenant.name}</span>

            <Link
              to={`/tenants/${tenant.id}/projects`}
              className="btn btn-primary btn-sm"
            >
              Apri
            </Link>
          </li>
        ))}

        {tenants.length === 0 && (
          <li className="list-group-item text-muted">Nessun tenant presente</li>
        )}
      </ul>

      <div className="card p-3">
        <h5 className="mb-3">Crea nuovo tenant</h5>

        <input
          className="form-control mb-2"
          placeholder="Nome del tenant"
          value={newTenant}
          onChange={(e) => setNewTenant(e.target.value)}
        />

        <button className="btn btn-success" onClick={handleCreate}>
          Crea tenant
        </button>
      </div>
    </div>
  );
}

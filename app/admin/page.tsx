import { getLocalPhotos } from "@/lib/photos";
import Link from "next/link";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const photos = await getLocalPhotos();

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0f0f0f", color: "#fff", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid #333", paddingBottom: "1rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 600 }}>Daniel&apos;s Photo Admin</h1>
            <p style={{ margin: "0.5rem 0 0", color: "#888" }}>Manage your photo metadata locally.</p>
          </div>
          <Link href="/" style={{ padding: "0.5rem 1rem", backgroundColor: "#333", borderRadius: "6px", textDecoration: "none", color: "#fff", fontSize: "0.9rem" }}>
            View Site
          </Link>
        </header>
        
        <AdminDashboard initialPhotos={photos} />
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import WorldMap from "@/components/WorldMap";

type NodePin = { id: string; lat: number; lng: number; label?: string };
type Stats = { accounts: number; transactions: number };

export default function Page() {
  const [nodes, setNodes] = useState<NodePin[]>([]);
  const [stats, setStats] = useState<Stats>({ accounts: 0, transactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [nodesRes, statsRes] = await Promise.all([
          fetch("/nodes.json", { cache: "no-store" }),
          fetch("/api/stats", { cache: "no-store" }),
        ]);
        const nodesJson = nodesRes.ok ? await nodesRes.json() : [];
        const statsJson = statsRes.ok ? await statsRes.json() : { accounts: 0, transactions: 0 };
        if (alive) {
          setNodes(nodesJson);
          setStats({ accounts: Number(statsJson.accounts || 0), transactions: Number(statsJson.transactions || 0) });
        }
      } catch {
        // keep defaults
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <main style={{ maxWidth: 1024, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Aztec Node Tracker</h1>
      <p style={{ color: "#555", marginBottom: 20 }}>
        Map of community-reported Aztec nodes and simple network stats.
      </p>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#ffffff" }}>
          <div style={{ fontSize: 13, color: "#777" }}>Accounts Created</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.accounts.toLocaleString()}</div>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#ffffff" }}>
          <div style={{ fontSize: 13, color: "#777" }}>Total Transactions</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.transactions.toLocaleString()}</div>
        </div>
      </section>

      <section>
        <WorldMap nodes={nodes} />
        <div style={{ fontSize: 13, color: "#777", marginTop: 8 }}>
          Edit <code>public/nodes.json</code> to add/modify node pins.
        </div>
      </section>

      {!loading && nodes.length === 0 && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412" }}>
          No nodes found. Add some entries to <code>public/nodes.json</code>.
        </div>
      )}

      <section style={{ marginTop: 24, fontSize: 13, color: "#666" }}>
        <div><strong>Stats source:</strong> /api/stats → AZTEC_STATS_URL (JSON) or ACCOUNTS_TOTAL / TX_TOTAL env vars.</div>
      </section>
    </main>
  );
}

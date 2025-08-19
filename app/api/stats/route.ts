export const runtime = 'nodejs';

type Stats = { accounts: number; transactions: number };

function numberFromEnv(name: string): number | undefined {
  const v = process.env[name];
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET() {
  // Priority 1: External JSON endpoint (must return {accounts, transactions})
  const url = process.env.AZTEC_STATS_URL;
  if (url) {
    try {
      const resp = await fetch(url, { cache: 'no-store', headers: { 'accept': 'application/json' } });
      if (resp.ok) {
        const data = await resp.json() as Partial<Stats>;
        const accounts = Number(data.accounts ?? 0);
        const transactions = Number(data.transactions ?? 0);
        return Response.json({ accounts, transactions });
      }
    } catch (_) {
      // ignore and fall through to env fallback
    }
  }

  // Priority 2: Read from env numbers if provided
  const envAccounts = numberFromEnv('ACCOUNTS_TOTAL');
  const envTx = numberFromEnv('TX_TOTAL');
  if (envAccounts !== undefined || envTx !== undefined) {
    return Response.json({
      accounts: envAccounts ?? 0,
      transactions: envTx ?? 0,
    });
  }

  // Priority 3: Safe default
  return Response.json({ accounts: 0, transactions: 0 });
}

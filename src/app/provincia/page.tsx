import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { PROVINCE_LIST } from "@/lib/geo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "ETS per provincia",
  description: "Elenco degli enti del terzo settore italiani per provincia di sede legale.",
  path: "/provincia",
});

export default async function ProvinceIndexPage() {
  let counts = new Map<string, number>();
  try {
    const rows = await prisma.$queryRaw<Array<{ provincia: string | null; n: bigint }>>`
      SELECT provincia, COUNT(*) AS n FROM ets WHERE provincia IS NOT NULL GROUP BY provincia
    `;
    counts = new Map(rows.map((r) => [r.provincia ?? "", Number(r.n)]));
  } catch {
    // DB non pronto
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">ETS per provincia</h1>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
        {PROVINCE_LIST.map((p) => {
          const n = counts.get(p.sigla) ?? 0;
          return (
            <li key={p.sigla}>
              <Link
                href={`/provincia/${p.sigla.toLowerCase()}`}
                className="block p-2 border border-gray-200 rounded hover:border-brand-500 no-underline"
              >
                <span className="font-semibold text-gray-900">{p.nome}</span>{" "}
                <span className="text-xs text-gray-500">({p.sigla}) · {formatNumber(n)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

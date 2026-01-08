// npm i papaparse
import Papa from "papaparse";

export type ParsedProduct = {
 productCode: string; // SKU
 salePrice: number; // Preço Venda
 capPrice: number; // Preço Capa
};

// Normaliza cabeçalhos
function norm(s: string) {
 return s
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "") // remove acentos
  .replace(/[\u00A0]/g, " ") // NBSP -> espaço
  .replace(/_/g, " ")
  .replace(/\s+/g, " ")
  .trim();
}

function normalizeNumber(v: unknown): number {
 if (v === null || v === undefined) return 0;
 if (typeof v === "number") return Number.isFinite(v) ? v : 0;
 const s = String(v)
  .trim()
  .replace(/\s/g, "")
  .replace(/\./g, "")
  .replace(/,/g, ".");
 const n = Number(s);
 return Number.isFinite(n) ? n : 0;
}

function readAsText(file: File, encoding: string): Promise<string> {
 return new Promise((resolve, reject) => {
  const fr = new FileReader();
  fr.onerror = () => reject(fr.error);
  fr.onload = () => resolve(String(fr.result || ""));
  fr.readAsText(file, encoding);
 });
}

/** Converte CSV -> ParsedProduct[] com validação de preços */
export async function parsePriceCsv(file: File): Promise<ParsedProduct[]> {
 // 1) tenta UTF-8; fallback ISO-8859-1
 let text = await readAsText(file, "utf-8");
 const firstLine = text.split(/\r?\n/)[0] ?? "";
 if (firstLine.includes("�")) {
  text = await readAsText(file, "ISO-8859-1");
 }

 // 2) força delimitador e tipagem numérica
 const result = Papa.parse<Record<string, unknown>>(text, {
  header: true,
  skipEmptyLines: true,
  delimiter: ";",
  dynamicTyping: true,
  transformHeader: (h) => norm(h),
 });

 const rows = (result.data || []) as Array<Record<string, unknown>>;
 const products: ParsedProduct[] = [];

 for (const row of rows) {
  const skuVal = row["sku"];
  const saleVal = row["preco venda"];
  const capVal = row["preco capa"];

  if (!skuVal) continue;

  const productCode = String(skuVal).trim();
  const salePrice = normalizeNumber(saleVal);
  const capPrice = normalizeNumber(capVal);

  products.push({ productCode, salePrice, capPrice });
 }

 // 3️⃣ Validação — nenhum preço pode ser 0
 const invalid = products.filter((p) => p.salePrice <= 0 || p.capPrice <= 0);
 if (invalid.length > 0) {
  const invalidCodes = invalid.map((p) => p.productCode).join(", ");
  throw new Error(
   `Existem produtos com valores zerados: ${invalidCodes}. 
Corrija os preços no arquivo antes de importar.`
  );
 }

 return products;
}

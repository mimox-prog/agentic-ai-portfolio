// src/app/api/compliance-simulator/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import formidable from "formidable-serverless";
import fs from "fs";
import { buildIndex, queryIndex } from "@/lib/simpleSearch";
import { addDoc } from "@/lib/db";
import { nanoid } from "nanoid";

type ParsedResult = { filePath?: string; originalFilename?: string } | {};

export async function POST(req: Request) {
  try {
    // Parse multipart form (Node runtime)
    const form = formidable({ multiples: false });
    const parsed = await new Promise<ParsedResult>((resolve, reject) => {
      // formidable callback style — use Node runtime
      // @ts-ignore
      form.parse((req as any).rawBody || {}, (err: any, fields: any, files: any) => {
        if (err) return reject(err);
        if (!files || !files.file) return resolve({});
        const file = files.file;
        resolve({ filePath: file.filepath || file.path, originalFilename: file.originalFilename || file.name });
      });
    }).catch(() => ({}));

    // If no file uploaded, return demo response
    if (!parsed || typeof parsed !== "object" || !("filePath" in parsed) || !parsed.filePath) {
      const demo = [{ section: "General", risk: "No file uploaded (demo)", confidence: 0.45 }];
      return NextResponse.json({ risks: demo });
    }

    const filePath = (parsed as { filePath?: string }).filePath!;
    // Read file bytes
    const raw = fs.readFileSync(filePath);

    // Dynamically import pdf-parse to avoid static ESM/CommonJS mismatch
    const pdfParseModule = await import("pdf-parse").catch((e) => {
      throw new Error("pdf-parse import failed: " + String(e));
    });
    // pdf-parse may export as default or module itself
    const pdfParse = (pdfParseModule && (pdfParseModule.default || pdfParseModule)) as any;

    // Parse PDF
    const parsedPdf = await pdfParse(raw);
    const text = parsedPdf?.text || "";

    // Persist doc to local DB
    const id = nanoid();
    await addDoc({ id, slug: id, title: (parsed as any).originalFilename || filePath, description: text.slice(0, 200) });

    // Build a small index and query for risk-related terms (demo RAG)
    const index = buildIndex([{ id, text }]);
    const hits = queryIndex(index, "risk compliance regulation disclosure", 5);

    const risks = hits.map((h: any) => ({
      section: "extracted",
      snippet: h.text.slice(0, 400),
      confidence: Math.min(0.95, 0.5 + Math.random() * 0.45),
    }));

    return NextResponse.json({ risks });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

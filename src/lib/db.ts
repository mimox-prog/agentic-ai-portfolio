// src/lib/db.ts
import { promises as fs } from "fs";
import { join } from "path";

export type Project = {
  id: string;
  slug?: string;
  title?: string;
  domain?: string;
  description?: string;
  problem?: string;
  impact?: string;
  tech?: string[];
  tags?: string[];
  repo?: string;
};

type Schema = {
  docs: Project[];
};

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), "data");
const DB_FILE = join(DATA_DIR, "db.json");

async function ensureDbFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // If file doesn't exist, create with initial structure
    try {
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify({ docs: [] }, null, 2), "utf8");
    }
  } catch (err) {
    // rethrow with context
    throw new Error(`Failed to ensure DB file: ${String(err)}`);
  }
}

async function readDb(): Promise<Schema> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as Schema;
    // normalize
    parsed.docs = Array.isArray(parsed.docs) ? parsed.docs : [];
    return parsed;
  } catch (err) {
    // If file corrupted, reset to empty structure
    const empty: Schema = { docs: [] };
    await fs.writeFile(DB_FILE, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
}

async function writeDb(data: Schema): Promise<void> {
  await ensureDbFile();
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function initDb(): Promise<void> {
  await ensureDbFile();
  // ensure valid structure
  const db = await readDb();
  if (!Array.isArray(db.docs)) {
    db.docs = [];
    await writeDb(db);
  }
}

export async function getDocs(): Promise<Project[]> {
  const db = await readDb();
  return db.docs;
}

export async function addDoc(doc: Project): Promise<void> {
  const db = await readDb();
  db.docs.push(doc);
  await writeDb(db);
}

export async function findDocBySlug(slug: string): Promise<Project | null> {
  const db = await readDb();
  const found = db.docs.find((d) => d.slug === slug || d.id === slug) || null;
  return found;
}

export async function upsertDoc(doc: Project): Promise<void> {
  const db = await readDb();
  const idx = db.docs.findIndex((d) => d.id === doc.id || (doc.slug && d.slug === doc.slug));
  if (idx >= 0) {
    db.docs[idx] = { ...db.docs[idx], ...doc };
  } else {
    db.docs.push(doc);
  }
  await writeDb(db);
}

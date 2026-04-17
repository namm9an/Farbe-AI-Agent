import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import { env } from "@/lib/env";

let database: Database.Database | null = null;

const createDatabase = () => {
  const databasePath = path.resolve(process.cwd(), env.databaseUrl);
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS analysis_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      reference_name TEXT NOT NULL,
      target_name TEXT NOT NULL,
      match_score REAL NOT NULL,
      confidence REAL NOT NULL,
      findings_json TEXT NOT NULL,
      suggestions_json TEXT NOT NULL,
      summary TEXT NOT NULL
    );
  `);

  return db;
};

export const getDb = () => {
  if (!database) {
    database = createDatabase();
  }

  return database;
};

export const saveAnalysisRun = (input: {
  createdAt: string;
  referenceName: string;
  targetName: string;
  matchScore: number;
  confidence: number;
  findings: string[];
  suggestions: string[];
  summary: string;
}) => {
  const db = getDb();
  const statement = db.prepare(`
    INSERT INTO analysis_runs (
      created_at,
      reference_name,
      target_name,
      match_score,
      confidence,
      findings_json,
      suggestions_json,
      summary
    ) VALUES (
      @createdAt,
      @referenceName,
      @targetName,
      @matchScore,
      @confidence,
      @findingsJson,
      @suggestionsJson,
      @summary
    );
  `);

  statement.run({
    createdAt: input.createdAt,
    referenceName: input.referenceName,
    targetName: input.targetName,
    matchScore: input.matchScore,
    confidence: input.confidence,
    findingsJson: JSON.stringify(input.findings),
    suggestionsJson: JSON.stringify(input.suggestions),
    summary: input.summary,
  });
};

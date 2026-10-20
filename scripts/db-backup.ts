// Copies the SQLite database into backups/ with a timestamp in the name.
// Run with `pnpm db:backup` before changing the schema, seeding, or editing
// data in bulk. VACUUM INTO writes a consistent snapshot even while the dev
// server has the database open.

import "dotenv/config";

import { mkdirSync } from "node:fs";
import path from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../src/generated/prisma/client";

const backupDir = "backups";

const url = process.env.DATABASE_URL;
if (!url?.startsWith("file:")) {
	throw new Error("DATABASE_URL must point to a SQLite file (file:...)");
}

/** Local time as YYYY-MM-DD-HHmmss, sortable and safe in file names. */
function timestamp(date: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	return (
		`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
		`-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
	);
}

async function main() {
	const source = path.parse(url!.slice("file:".length));
	mkdirSync(backupDir, { recursive: true });
	const target = path.join(
		backupDir,
		`${source.name}-${timestamp(new Date())}${source.ext}`
	);

	const prisma = new PrismaClient({
		adapter: new PrismaBetterSqlite3({ url: url! }),
	});
	try {
		await prisma.$executeRaw`VACUUM INTO ${target}`;
	} finally {
		await prisma.$disconnect();
	}
	console.log(`Backed up the database to ${target}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

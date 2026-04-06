import fs from "fs";
import net from "net";
import path from "path";
import { PrismaClient } from "@prisma/client";

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function maskDatabaseUrl(connectionString) {
  try {
    const url = new URL(connectionString);
    const username = url.username ? `${decodeURIComponent(url.username)}:` : "";
    const databaseName = url.pathname.replace(/^\//, "") || "(default)";
    const query = url.search ? url.search : "";

    return `${url.protocol}//${username}***@${url.hostname}:${url.port || "(default)"}/${databaseName}${query}`;
  } catch {
    return "(invalid connection string)";
  }
}

function getConnectionTargets() {
  return [
    { label: "DATABASE_URL", value: process.env.DATABASE_URL },
    { label: "DIRECT_URL", value: process.env.DIRECT_URL },
  ].filter((entry) => Boolean(entry.value));
}

function testTcpConnection(hostname, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: hostname, port });
    let settled = false;

    const finish = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(5000);
    socket.once("connect", () => finish({ ok: true }));
    socket.once("timeout", () => finish({ ok: false, reason: "timeout" }));
    socket.once("error", (error) => finish({ ok: false, reason: error.message }));
  });
}

function summarizeError(error) {
  if (!error || typeof error !== "object") {
    return String(error);
  }

  const candidate = error;
  const parts = [];

  if ("name" in candidate && candidate.name) {
    parts.push(String(candidate.name));
  }

  if ("code" in candidate && candidate.code) {
    parts.push(`code=${String(candidate.code)}`);
  }

  if ("message" in candidate && candidate.message) {
    parts.push(
      String(candidate.message)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" | ")
    );
  }

  return parts.join(" | ");
}

async function testPrismaConnection(label, connectionString) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    console.log(`[${label}] Prisma query: OK`);
    return true;
  } catch (error) {
    console.log(`[${label}] Prisma query: FAIL`);
    console.log(`  ${summarizeError(error)}`);
    return false;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

async function main() {
  loadDotEnv(path.join(process.cwd(), ".env"));

  const targets = getConnectionTargets();

  if (targets.length === 0) {
    console.error("No DATABASE_URL or DIRECT_URL was found in the environment.");
    process.exitCode = 1;
    return;
  }

  let anySuccess = false;

  for (const target of targets) {
    console.log(`\n[${target.label}] ${maskDatabaseUrl(target.value)}`);

    let parsed;

    try {
      parsed = new URL(target.value);
    } catch {
      console.log(`[${target.label}] URL parse: FAIL`);
      console.log("  The connection string is not a valid URL.");
      continue;
    }

    const port = Number(parsed.port || "5432");
    const tcp = await testTcpConnection(parsed.hostname, port);
    console.log(`[${target.label}] TCP ${parsed.hostname}:${port}: ${tcp.ok ? "OK" : `FAIL (${tcp.reason})`}`);

    const prismaOk = await testPrismaConnection(target.label, target.value);
    anySuccess = anySuccess || prismaOk;

    if (tcp.ok && !prismaOk) {
      console.log(`  TCP is reachable, but Prisma could not complete a Postgres connection.`);
      console.log(`  Re-copy this connection string from the database provider dashboard and verify the project is active.`);
    }
  }

  if (!anySuccess) {
    console.log("\nDatabase check failed for every configured URL.");
    console.log("Recommended next steps:");
    console.log("  1. Verify the database project is active and not paused.");
    console.log("  2. Re-copy the latest connection string from the provider dashboard.");
    console.log("  3. If you use Supabase, set DATABASE_URL to the pooler URL and DIRECT_URL to the direct Postgres URL for local development.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(summarizeError(error));
  process.exit(1);
});

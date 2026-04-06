type DatabaseErrorCandidate = {
  name?: string;
  code?: string;
  message?: string;
};

const DATABASE_CONNECTION_ERROR_CODES = new Set(["P1001", "P1002", "P1017"]);

const DATABASE_CONNECTION_ERROR_PATTERNS = [
  /can't reach database server/i,
  /database server.*running/i,
  /timed out/i,
  /connection timed out/i,
  /connection refused/i,
  /connection reset/i,
  /server has closed the connection/i,
  /server closed the connection unexpectedly/i,
  /failed to connect to/i,
  /econnrefused/i,
  /econnreset/i,
  /etimedout/i,
];

const DATABASE_CONFIGURATION_ERROR_PATTERNS = [
  /environment variable not found: database_url/i,
  /error validating datasource `db`/i,
  /the provided database string is invalid/i,
  /invalid port number/i,
  /invalid connection string/i,
];

function toDatabaseErrorCandidate(error: unknown): DatabaseErrorCandidate | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  return error as DatabaseErrorCandidate;
}

export function isDatabaseConnectionError(error: unknown) {
  const candidate = toDatabaseErrorCandidate(error);

  if (!candidate) {
    return false;
  }

  const message = candidate.message ?? "";

  return (
    DATABASE_CONNECTION_ERROR_CODES.has(candidate.code ?? "") ||
    DATABASE_CONNECTION_ERROR_PATTERNS.some((pattern) => pattern.test(message))
  );
}

export function isDatabaseConfigurationError(error: unknown) {
  const candidate = toDatabaseErrorCandidate(error);

  if (!candidate) {
    return false;
  }

  const message = candidate.message ?? "";

  return DATABASE_CONFIGURATION_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export function isLikelyDatabaseError(error: unknown) {
  return isDatabaseConnectionError(error) || isDatabaseConfigurationError(error);
}

export function getDatabaseUnavailableMessage() {
  return "The database is currently unavailable. Please try again later.";
}

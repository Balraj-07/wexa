
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../../.env', import.meta.url) });

const required = [
  'COGNODB_URI',
  'COGNODB_USERNAME',
  'COGNODB_PASSWORD',
];

export const isConfigured = () =>
  required.every((key) => Boolean(process.env[key]));

let driver;

export function getDriver() {
  if (!isConfigured()) {
    throw Object.assign(
      new Error('CognoDB environment variables are missing.'),
      { code: 'DB_UNAVAILABLE' }
    );
  }

  if (!driver) {
    driver = neo4j.driver(
      process.env.COGNODB_URI,
      neo4j.auth.basic(
        process.env.COGNODB_USERNAME,
        process.env.COGNODB_PASSWORD
      ),
      {
        connectionTimeout: 15000,
        maxConnectionPoolSize: 20,
      }
    );
  }

  return driver;
}

export async function verifyConnection() {
  const dbDriver = getDriver();

  await dbDriver.verifyConnectivity();

  const session = dbDriver.session({
    defaultAccessMode: neo4j.session.READ,
    database: process.env.COGNODB_DATABASE || 'neo4j',
  });

  try {
    const result = await session.run('RETURN 1 AS result');

    return result.records[0].get('result').toNumber();
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = undefined;
  }
}

export async function runQuery(cypher, params = {}) {
  const session = getDriver().session({
    defaultAccessMode: neo4j.session.READ,
    database: process.env.COGNODB_DATABASE || 'neo4j',
  });

  try {
    return await session.run(cypher, params);
  } finally {
    await session.close();
  }
}

export async function runWriteQuery(cypher, params = {}) {
  const session = getDriver().session({
    defaultAccessMode: neo4j.session.WRITE,
    database: process.env.COGNODB_DATABASE || 'neo4j',
  });

  try {
    return await session.run(cypher, params);
  } finally {
    await session.close();
  }
}

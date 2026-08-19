import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
dotenv.config({ path: new URL('../../.env', import.meta.url) });

const required = ['COGNODB_URI', 'COGNODB_USERNAME', 'COGNODB_PASSWORD'];
export const isConfigured = () => required.every((key) => process.env[key]);
let driver;

export function getDriver() {
  if (!isConfigured()) throw Object.assign(new Error('Graph database is not configured.'), { code: 'DB_UNAVAILABLE' });
  if (!driver) driver = neo4j.driver(process.env.COGNODB_URI, neo4j.auth.basic(process.env.COGNODB_USERNAME, process.env.COGNODB_PASSWORD));
  return driver;
}

export async function verifyConnection() { await getDriver().verifyConnectivity(); }
export async function closeDriver() { if (driver) await driver.close(); driver = undefined; }
export async function runQuery(cypher, params = {}) {
  const session = getDriver().session({ defaultAccessMode: neo4j.session.READ });
  try { return await session.run(cypher, params); } finally { await session.close(); }
}

export async function runWriteQuery(cypher, params = {}) {
  const session = getDriver().session({ defaultAccessMode: neo4j.session.WRITE });
  try { return await session.run(cypher, params); } finally { await session.close(); }
}

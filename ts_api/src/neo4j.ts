import neo4jDriver, { Driver, auth } from 'neo4j-driver';

let neoDriver: Driver | null = null;

/**
 * Retrieves a singleton Neo4j Driver instance.
 * Ensures that only one connection is established throughout the application lifecycle.
 * 
 * @returns Neo4j Driver instance.
 */
export function getNeo4jDriver(): Driver {
  if (!neoDriver) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      throw new Error('NEO4J_URI, NEO4J_USER, and NEO4J_PASSWORD environment variables must be set.');
    }

    neoDriver = neo4jDriver.driver(uri, auth.basic(user, password));
  }
  return neoDriver!;
} 
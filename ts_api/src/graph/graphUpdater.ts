import { getNeo4jDriver } from '../neo4j';

/**
 * Adds an array of entities to the Neo4j Knowledge Graph.
 * Uses MERGE to ensure that each entity is unique based on its ID.
 * 
 * @param entities - Array of entities to add.
 */
export async function addEntitiesToKG(entities: any[]): Promise<void> {
  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    for (const entity of entities) {
      await session.run(
        `
        MERGE (ent:Entity {id: $id})
        ON CREATE SET ent.name = $name, ent.type = $type, ent.createdAt = timestamp()
        ON MATCH SET ent.updatedAt = timestamp()
        `,
        {
          id: entity.id,
          name: entity.name,
          type: entity.type,
        }
      );
    }
    console.log('Entities successfully added/updated in Neo4j.');
  } catch (error) {
    console.error('Error adding entities to Neo4j:', error);
    throw error;
  } finally {
    await session.close();
  }
}

/**
 * Adds an array of relations to the Neo4j Knowledge Graph.
 * Uses MERGE to ensure that each relation is unique based on its ID.
 * 
 * @param relations - Array of relations to add.
 */
export async function addRelationsToKG(relations: any[]): Promise<void> {
  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    for (const relation of relations) {
      await session.run(
        `
        MATCH (s:Entity {id: $source_id}), (t:Entity {id: $target_id})
        MERGE (s)-[rel:${relation.type} {id: $id}]->(t)
        ON CREATE SET rel.createdAt = timestamp()
        ON MATCH SET rel.updatedAt = timestamp()
        `,
        {
          id: relation.id,
          source_id: relation.source,
          target_id: relation.target,
        }
      );
    }
    console.log('Relations successfully added/updated in Neo4j.');
  } catch (error) {
    console.error('Error adding relations to Neo4j:', error);
    throw error;
  } finally {
    await session.close();
  }
} 
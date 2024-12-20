// nlp-module/src/mongoClient.ts

import { MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient> | null = null;

/**
 * Retrieves a singleton MongoClient instance.
 * Ensures that only one connection is established throughout the application lifecycle.
 * 
 * @returns Promise that resolves to a connected MongoClient instance.
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set.');
    }
    const client = new MongoClient(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      retryReads: true
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}
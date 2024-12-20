import { getMongoClient } from '../mongo';

/**
 * Stores a summarized version of the original text in MongoDB.
 * 
 * @param originalText - The original text that was summarized.
 * @param summary - The summarized version of the original text.
 */
export async function storeSummary(originalText: string, summary: string): Promise<void> {
  try {
    const client = await getMongoClient();
    const db = client.db('researcher');
    const collection = db.collection('summaries');

    await collection.insertOne({
      originalText,
      summary,
      timestamp: new Date()
    }, {
      forceServerObjectId: false // Let driver add _id if missing
    });

    console.log('Summary successfully stored in MongoDB.');
  } catch (error) {
    console.error('Error storing summary in MongoDB:', error);
    throw error;
  }
} 
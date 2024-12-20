// nlp-module/src/rabbitmq.ts

import amqp from 'amqplib';

export interface RPCResponse {
  // Define the structure of RPCResponse
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Enqueues a long-running task into the RabbitMQ queue without waiting for a response.
 * This function just sends the message persistently and returns immediately.
 * 
 * @param taskType The type of task to enqueue.
 * @param payload The data associated with the task.
 */
export async function enqueueLongRunningTask(taskType: string, payload: any) {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect('amqp://admin:NGVP12345@localhost:5672');
    const channel = await connection.createChannel();

    const queue = 'long_running_tasks';
    await channel.assertQueue(queue, { durable: true });

    const message = { taskType, payload };
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });

    console.log(`Enqueued task of type "${taskType}" to queue "${queue}".`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error enqueuing long-running task:', error);
    throw error;
  }
}

/**
 * Sends a message to a specified RabbitMQ queue and waits for a response (RPC style).
 * 
 * This function:
 * 1. Connects to RabbitMQ and creates a channel.
 * 2. Asserts the target queue.
 * 3. Uses `amq.rabbitmq.reply-to` feature and a correlationId to wait for a single response.
 * 4. Sends the request message to the target queue.
 * 5. Waits for the response message that has the same correlationId.
 * 6. Returns the parsed result of the response message.
 * 
 * Note: The corresponding worker should:
 *   - Consume the request queue.
 *   - Process the request.
 *   - Send a response to `msg.properties.replyTo` with the same correlationId.
 * 
 * @param queueName The name of the queue.
 * @param message The message payload to send.
 * @returns The response from the worker as a JavaScript object.
 */
export async function sendToQueue(queueName: string, message: any): Promise<RPCResponse> {
  let connection: amqp.Connection | null = null;
  let channel: amqp.Channel | null = null;

  try {
    // Connect to RabbitMQ server
    connection = await amqp.connect('amqp://admin:NGVP12345@localhost:5672');
    channel = await connection.createChannel();

    // Ensure the queue exists
    await channel.assertQueue(queueName, { durable: true });

    // Use 'amq.rabbitmq.reply-to' for Direct Reply-to
    // correlationId is used to correlate request with response
    const correlationId = generateCorrelationId();

    return new Promise<RPCResponse>((resolve, reject) => {
      // Set up a consumer on 'amq.rabbitmq.reply-to' to receive the response
      // 'amq.rabbitmq.reply-to' is a pseudo-queue name which triggers a direct reply.
      channel!.consume('amq.rabbitmq.reply-to', (msg) => {
        if (!msg) return; // no message received
        if (msg.properties.correlationId === correlationId) {
          // This is the response we were waiting for
          const responseStr = msg.content.toString();
          let responseObj: RPCResponse;
          try {
            responseObj = JSON.parse(responseStr);
          } catch (parseErr) {
            reject(new Error('Failed to parse JSON response: ' + parseErr));
            return;
          }
          resolve(responseObj);

          // No longer need this consumer for this request
          // We must ack the message, but 'amq.rabbitmq.reply-to' consumer should be noAck:true
          // If not specified, we must ack here. Let's specify noAck: true below.
        }
      }, { noAck: true }) // noAck since we only expect one response message

      // Send the request message
      channel!.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
        correlationId: correlationId,
        replyTo: 'amq.rabbitmq.reply-to'
      });

      console.log(`Sent request to "${queueName}" with correlationId=${correlationId}`);
    });

  } catch (error) {
    console.error(`Error sending and waiting for response from queue "${queueName}":`, error);
    throw error;
  } finally {
    // The promise returned by the function
    // will be resolved or rejected when the response is received or an error occurs.
    // Cleanup of connection and channel must happen after promise resolution.
    // The best approach:
    // Once the response is received, we can close the channel and connection.
    // This can be achieved by chaining finally on the return promise.

    // We'll return in a manner that closes connection after resolution.
    // This means we cannot close here synchronously. Let's close after the promise
    // resolves. We can do that by returning a promise that does cleanup.

    // So we do not close here. We'll modify approach:
  }
}

/**
 * Generates a unique correlationId for each request.
 * Using a simple random ID here. In production, consider a more robust unique ID.
 */
function generateCorrelationId(): string {
  return `corr-id-${Math.random().toString(16).substr(2, 8)}`;
}

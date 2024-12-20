// src/mcp/MCPClientWrapper.ts

import type { Subprocess } from 'bun';

type MCPProcess = Subprocess<"pipe", "pipe", "pipe">;

type MCPMessage = {
  type: string;
  data: any;
};

export class MCPClientWrapper {
  private mcpProcess: MCPProcess;
  private messageQueue: Array<(message: MCPMessage) => void> = [];
  private textDecoder = new TextDecoder();
  private textEncoder = new TextEncoder();
  private buffer = '';

  constructor() {
    this.mcpProcess = Bun.spawn(["bun", "run", "start"], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.setupMessageHandling();
  }
  private async setupMessageHandling() {
    if (!this.mcpProcess.stdout) {
      throw new Error('No stdout available');
    }

    for await (const chunk of this.mcpProcess.stdout) {
      this.buffer += this.textDecoder.decode(chunk, { stream: true });

      let newlineIndex;
      while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
        const messageStr = this.buffer.slice(0, newlineIndex);
        this.buffer = this.buffer.slice(newlineIndex + 1);

        try {
          const message = JSON.parse(messageStr) as MCPMessage;
          const handler = this.messageQueue.shift();
          if (handler) {
            handler(message);
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      }
    }
  }

  private async sendMessage(message: any): Promise<MCPMessage> {
    return new Promise((resolve) => {
      this.messageQueue.push(resolve);
      
      if (!this.mcpProcess.stdin) {
        throw new Error('No stdin available');
      }

      const data = this.textEncoder.encode(JSON.stringify(message) + '\n');
      this.mcpProcess.stdin.write(data);
    });
  }

  async initialize(config: any): Promise<void> {
    const message = {
      type: 'initialize',
      data: config
    };

    await this.sendMessage(message);
  }

  async generateResponse(prompt: string, options: any = {}): Promise<string> {
    const message = {
      type: 'generate',
      data: {
        prompt,
        options
      }
    };

    const response = await this.sendMessage(message);
    return response.data.response;
  }

  async generateWithTools(messages: any[], tools: any[], options: any = {}): Promise<any> {
    console.warn("_____________________________IN GEN WITH TOOLS:", messages, tools, options)
    const message = {
      type: 'generateWithTools',
      data: {
        messages,
        tools,
        options
      }
    };

    const response = await this.sendMessage(message);
    return response.data;
  }

  async executeTool(name: string, args: any): Promise<any> {
    const message = {
      type: 'executeTool',
      data: {
        name,
        args
      }
    };

    const response = await this.sendMessage(message);
    return response.data;
  }

  async close(): Promise<void> {
    this.mcpProcess.kill();
    await this.mcpProcess.exited;
  }
}
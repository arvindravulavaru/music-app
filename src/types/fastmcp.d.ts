declare module 'fastmcp' {
  export interface Context<T> {
    session?: T;
  }

  export interface Tool<T = unknown> {
    name: string;
    description: string;
    execute: (args: unknown, context: Context<T>) => Promise<string>;
  }

  export interface FastMCPConfig {
    name: string;
    version: string;
  }

  export interface SSEConfig {
    transportType: 'sse';
    sse: {
      endpoint: string;
      port: number;
    };
  }

  export class FastMCP {
    constructor(config: FastMCPConfig);
    addTool<T = unknown>(tool: Tool<T>): void;
    start(config: SSEConfig): Promise<void>;
  }

  export default FastMCP;
} 
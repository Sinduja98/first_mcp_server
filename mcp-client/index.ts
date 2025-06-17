import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readline from "readline/promises";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY =  process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

console.log("hello world");

interface MCPTool {
  name: string;
  description: string;
  input_schema: any;
}

class MCPClient {
  private mcp: Client;
  private openai: OpenAI;
  private transport: StdioClientTransport | null = null;
  private tools: MCPTool[] = [];

  constructor() {
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
  }

  async connectToServer(serverScriptPath: string) {
    try {
      const isJs = serverScriptPath.endsWith(".js");
      const isPy = serverScriptPath.endsWith(".py");
      if (!isJs && !isPy) {
        throw new Error("Server script must be a .js or .py file");
      }
      const command = isPy
        ? process.platform === "win32"
          ? "python"
          : "python3"
        : process.execPath;

      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath],
      });
      await this.mcp.connect(this.transport);

      const toolsResult = await this.mcp.listTools();
      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description ?? "",
          input_schema: tool.inputSchema,
        };
      });
      console.log(
        "Connected to server with tools:",
        this.tools.map(({ name }) => name)
      );
    } catch (e) {
      console.log("Failed to connect to MCP server: ", e);
      throw e;
    }
  }

  // Convert MCP tools to OpenAI function format
  private convertToolsToOpenAIFormat() {
    return this.tools.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema,
      },
    }));
  }

  async processQuery(query: string) {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "user",
          content: query,
        },
      ];
      
      console.log("Processing query:", query);
      
      const openaiTools = this.convertToolsToOpenAIFormat();
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4", // or "gpt-3.5-turbo", "gpt-4-turbo", etc.
        max_tokens: 1000,
        messages,
        tools: openaiTools.length > 0 ? openaiTools : undefined,
        tool_choice: openaiTools.length > 0 ? "auto" : undefined,
      });

      const finalText = [];
      const choice = response.choices[0];

      console.log("Response from OpenAI:", response);

      if (choice.message.content) {
        finalText.push(choice.message.content);
      }

      // Handle tool calls
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        for (const toolCall of choice.message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          try {
            console.log(`Calling tool: ${toolName} with args:`, toolArgs);
            const result = await this.mcp.callTool({
              name: toolName,
              arguments: toolArgs,
            });
            
            finalText.push(
              `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`
            );

            // Add the assistant's message with tool call
            messages.push({
              role: "assistant",
              content: choice.message.content,
              tool_calls: choice.message.tool_calls,
            });

            // Add the tool result
            messages.push({
              role: "tool",
              content: Array.isArray(result.content) 
                ? result.content.map(c => c.type === "text" ? c.text : JSON.stringify(c)).join("\n")
                : String(result.content),
              tool_call_id: toolCall.id,
            });

            // Get the final response after tool execution
            console.log("Getting followup response...");
            const followupResponse = await this.openai.chat.completions.create({
              model: "gpt-4",
              max_tokens: 1000,
              messages,
              tools: openaiTools.length > 0 ? openaiTools : undefined,
            });

            const followupChoice = followupResponse.choices[0];
            if (followupChoice.message.content) {
              finalText.push(followupChoice.message.content);
            }
          } catch (error) {
            console.error(`Error calling tool ${toolName}:`, error);
            finalText.push(`Error calling tool ${toolName}: ${error}`);
          }
        }
      }

      return finalText.join("\n");
    } catch (error) {
      console.error("Error processing query:", error);
      return "An error occurred while processing your query.";
    }
  }

  async chatLoop() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      console.log("\nMCP Client Started!");
      console.log("API Key loaded:", OPENAI_API_KEY ? "Yes" : "No");
      console.log("Type your queries or 'quit' to exit.");

      while (true) {
        console.log("\nTEST");
        const message = await rl.question("\nQuery: ");
        console.log("You: " + message);
        if (message.toLowerCase() === "quit") {
          break;
        }
        const response = await this.processQuery(message);
        console.log("Response: " + response);
        console.log("\n" + response);
      }
    } finally {
      rl.close();
    }
  }

  async cleanup() {
    await this.mcp.close();
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Usage: node index.js <path_to_server_script>");
    return;
  }
  const mcpClient = new MCPClient();
  try {
    await mcpClient.connectToServer(process.argv[2]);
    await mcpClient.chatLoop();
  } finally {
    await mcpClient.cleanup();
    process.exit(0);
  }
}

main();
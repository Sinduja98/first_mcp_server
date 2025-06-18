**MCP Client and Server**

A simple yet powerful CLI application that connects an OpenAI-powered client to a custom MCP (Model Context Protocol) server, enabling dynamic tool execution via natural language.

**Features**
- Connects to an MCP server running Python or Node.js.

- Uses OpenAI's Function Calling to handle user queries.

- Supports dynamic tool invocation (e.g., math operations, greetings).

- Real-time command-line interaction with automatic follow-up responses.

**Installation and Setup**
- Clone the repository:
  - git clone https://github.com/Sinduja98/first_mcp_server.git
  - cd first_mcp_server

- Install Node.js dependencies:
    - npm install

- Install MCP Python server dependencies:
    - pip install mcp[cli]

- Set up environment variables:
    - OPENAI_API_KEY=your_openai_api_key

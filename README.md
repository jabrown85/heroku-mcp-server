# heroku-mcp-server

## Overview

The Heroku Platform MCP Server is a specialized Model Context Protocol (MCP) implementation designed to facilitate
seamless interaction between Large Language Models and the Heroku Platform. This server aims at providing a robust set
of tools and capabilities that enable LLMs to read, manage, and operate Heroku Platform resources.

Key Features:

- Direct interaction with Heroku Platform resources through LLM-driven tools
- Secure and authenticated access to Heroku Platform APIs, leveraging Heroku CLI
- Natural language interface for Heroku Platform interactions

Note: The Heroku Platform MCP Server is currently in early development. As we continue to enhance and refine the
implementation, the available functionality and tools may evolve. We welcome feedback and contributions to help shape
the future of this project.

## Installation

Install the Heroku Platform MCP Server globally using npm:

```sh
npm -i -g @heroku/mcp-server
```

## Configuration

### Authentication Setup

Generate a Heroku authorization token using one of these methods:

- Through your Heroku Dashboard account profile
- Using the Heroku CLI command:
  ```sh
    heroku authorizations:create
  ```

Copy the token and use it as your `HEROKU_API_KEY` in the following steps.

### Usage with [Claude Desktop](https://claude.ai/download)

Add this to your `claude_desktop_config.json`:

```json
"mcpServers": {
  "heroku": {
    "command": "heroku-mcp-server",
    "env": {
      "HEROKU_API_KEY": "<YOUR_HEROKU_AUTH_TOKEN>"
    }
  }
}
```

### Usage with [Zed](https://github.com/zed-industries/zed)

Add this to your Zed settings.json:

```json
"context_servers": [
  "heroku-mcp-server": {
    "command": {
      "path": "heroku-mcp-server",
      "env": {
        "HEROKU_API_KEY": "<YOUR_HEROKU_AUTH_TOKEN>"
      }
    }
  }
],
```

### Usage with [Cursor](https://www.cursor.com/)

Add this to your Cursor mcp.json:

```json
"mcpServers": {
  "heroku": {
    "command": "heroku-mcp-server",
    "env": {
      "HEROKU_API_KEY": "<YOUR_HEROKU_AUTH_TOKEN>"
    }
  },
}
```

## Debugging

You can use the MCP inspector to debug the server.

```
npx @modelcontextprotocol/inspector heroku-mcp-server
```

Or if you've installed the package in a specific directory or are developing on it:

```
cd path/to/servers/src/git
npx @modelcontextprotocol/inspector dist/index.js
```

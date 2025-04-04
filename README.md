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
### Usage with [Windsurf](https://www.windsurf.com/)

Add this to your Windsurf mcp_config.json:

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

You can use the MCP inspector or the vscode run/debug to run and debug the server.

1. link the project as a global CLI using `npm link` from the project root
2. build using `npm run build:dev`, or;
3. to watch for file changes and build automatically use `npm run build:watch`

Option 1 - use the @modelcontextprotocol/inspector (no breakpoints in code):

```
# Breakpoints are not available
npx @modelcontextprotocol/inspector heroku-mcp-server
```

Option 2 - use the VSCode run/debug launcher (fully functional breakpoints in code):

1. Locate and click on the run debug
2. select the configuration labeled "MCP Server Launcher" in the dropdown
3. click on the green run/debug button

Or if you've installed the package in a specific directory or are developing on it:

```
cd path/to/servers/src/git
npx @modelcontextprotocol/inspector dist/index.js
```

### VS Code / Cursor Debugging Setup

To setup local debugging with breakpoints:

1. Store your Heroku auth token in VS Code user settings:

   - Open Command Palette (Cmd/Ctrl + Shift + P)
   - Type "Preferences: Open User Settings (JSON)"
   - Add the following:

   ```json
   {
     "heroku.mcp.authToken": "your-token-here"
   }
   ```

2. Create or update `.vscode/launch.json`:

   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "MCP Server Launcher",
         "skipFiles": ["<node_internals>/**"],
         "program": "${workspaceFolder}/node_modules/@modelcontextprotocol/inspector/bin/cli.js",
         "outFiles": ["${workspaceFolder}/**/dist/**/*.js"],
         "env": {
           "HEROKU_API_KEY": "${config:heroku.mcp.authToken}",
           "DEBUG": "true"
         },
         "args": ["heroku-mcp-server"],
         "sourceMaps": true,
         "console": "integratedTerminal",
         "internalConsoleOptions": "neverOpen",
         "preLaunchTask": "npm: build:watch"
       },
       {
         "type": "node",
         "request": "attach",
         "name": "Attach to Debug Hook Process",
         "port": 9332,
         "skipFiles": ["<node_internals>/**"],
         "sourceMaps": true,
         "outFiles": ["${workspaceFolder}/dist/**/*.js"]
       },
       {
         "type": "node",
         "request": "attach",
         "name": "Attach to REPL Process",
         "port": 9333,
         "skipFiles": ["<node_internals>/**"],
         "sourceMaps": true,
         "outFiles": ["${workspaceFolder}/dist/**/*.js"]
       }
     ],
     "compounds": [
       {
         "name": "Attach to MCP Server",
         "configurations": ["Attach to Debug Hook Process", "Attach to REPL Process"]
       }
     ]
   }
   ```

3. Create `.vscode/tasks.json`:

   ```json
   {
     "version": "2.0.0",
     "tasks": [
       {
         "type": "npm",
         "script": "build:watch",
         "group": {
           "kind": "build",
           "isDefault": true
         },
         "problemMatcher": ["$tsc"]
       }
     ]
   }
   ```

4. To debug:
   - Set breakpoints in your TypeScript files
   - Press F5 or use the Run and Debug sidebar
   - The debugger will automatically build your TypeScript files before launching

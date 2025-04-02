#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import * as pjson from '../package.json' with { type: 'json' };
import * as apps from './tools/apps.js';
import * as spaces from './tools/spaces.js';
import * as teams from './tools/teams.js';

import { HerokuREPL } from './repl/heroku-cli-repl.js';

const VERSION = pjson.default.version;

const server = new McpServer({ name: 'Heroku MCP Server', version: VERSION });
const herokuRepl = new HerokuREPL();

// App-related tools
apps.registerListAppsTool(server, herokuRepl);
apps.registerGetAppInfoTool(server, herokuRepl);
apps.registerCreateAppTool(server, herokuRepl);
apps.registerRenameAppTool(server, herokuRepl);
apps.registerTransferAppTool(server, herokuRepl);

// Space-related tools
spaces.registerListPrivateSpacesTool(server, herokuRepl);

// Team-related tools
teams.registerListTeamsTool(server, herokuRepl);

/**
 * Run the server
 */
async function runServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('Heroku MCP Server running on stdio');
}

try {
  await runServer();
} catch (error) {
  const { message } = error as Error;
  process.stderr.write(`Fatal error in main():, ${message}`);
  process.exit(1);
}

/**
 * Hook to intercept all command results before they are
 * sent back to the LLM. This is useful for logging
 * or modifying command results (not-implemented).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
for await (const command of herokuRepl) {
  // do nothing until logger is implemented
}

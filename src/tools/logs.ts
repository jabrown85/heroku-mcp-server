import { z } from 'zod';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { handleCliOutput } from '../utils/handle-cli-output.js';
import { CommandBuilder } from '../utils/command-builder.js';
import { TOOL_COMMAND_MAP } from '../utils/tool-commands.js';
import { HerokuREPL } from '../repl/heroku-cli-repl.js';
import { McpToolResponse } from '../utils/mcp-tool-response.js';

/**
 * Schema for retrieving application logs with various filtering and output options.
 * This schema defines the structure and validation rules for the logs operation.
 */
export const getAppGetAppLogsOptionsSchema = z.object({
  app: z
    .string()
    .describe(
      'Specifies the target Heroku app whose logs to retrieve. Requirements and behaviors: ' +
        '1) App must exist and be accessible to you with appropriate permissions, ' +
        '2) The response includes both system events and application output, ' +
        "3) Currently it's only available to Cedar generation apps."
    ),
  dynoName: z
    .string()
    .optional()
    .describe(
      'Filter logs by specific dyno instance. Important behaviors: ' +
        '1) Format is "process_type.instance_number" (e.g., "web.1", "worker.2"). ' +
        '2) You cannot specify both dynoName and processType parameters together. ' +
        'Best practice: Use when debugging specific dyno behavior or performance issues.'
    ),
  source: z
    .string()
    .optional()
    .describe(
      'Filter logs by their origin. Key characteristics: ' +
        '1) Common values: "app" (application logs), "heroku" (platform events), ' +
        '2) When omitted, shows logs from all sources. ' +
        'Best practice: Use "app" for application debugging, "heroku" for platform troubleshooting.'
    ),
  processType: z
    .string()
    .optional()
    .describe(
      'Filter logs by process type. Key characteristics: ' +
        '1) Common values: "web" (web dynos), "worker" (background workers), ' +
        '2) Shows logs from all instances of the specified process type, ' +
        '3) You cannot specify both dynoName and processType parameters together. ' +
        'Best practice: Use when debugging issues specific to web or worker processes.'
    )
});

/**
 * Type definition for options when retrieving application logs.
 */
export type GetAppLogsOptions = z.infer<typeof getAppGetAppLogsOptionsSchema>;

/**
 * Registers the get app logs tool with the MCP server.
 * This tool provides access to application logs with various filtering options.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerGetAppLogsTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'get_app_logs',
    'View application logs with flexible filtering options. Use this tool when you need to: ' +
      '1) Monitor application activity in real-time, 2) Debug issues by viewing recent logs, ' +
      '3) Filter logs by dyno, process type, or source.',
    getAppGetAppLogsOptionsSchema.shape,
    async (options: GetAppLogsOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.LOGS)
        .addFlags({
          app: options.app,
          'dyno-name': options.dynoName,
          source: options.source,
          'process-type': options.processType
        })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

import { z } from 'zod';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { handleCliOutput } from '../utils/handle-cli-output.js';
import { CommandBuilder } from '../utils/command-builder.js';
import { TOOL_COMMAND_MAP } from '../utils/tool-commands.js';
import type { HerokuREPL } from '../repl/heroku-cli-repl.js';
import type { McpToolResponse } from '../utils/mcp-tool-response.js';

/**
 * Schema for listing processes.
 */
export const psListOptionsSchema = z.object({
  app: z.string().describe('Name of the app to list processes for'),
  json: z.boolean().optional().describe('Return process information in json format')
});

export type PsListOptions = z.infer<typeof psListOptionsSchema>;

/**
 * Schema for scaling processes.
 */
export const psScaleOptionsSchema = z.object({
  app: z.string().describe('Name of the app to scale'),
  dyno: z
    .string()
    .optional()
    .describe(
      'The type and quantity of dynos to scale (e.g., web=3:Standard-2X, worker+1). Omit to display current formation.'
    )
});

export type PsScaleOptions = z.infer<typeof psScaleOptionsSchema>;

/**
 * Schema for restarting processes.
 */
export const psRestartOptionsSchema = z.object({
  app: z.string().describe('Name of the app to restart processes for'),
  'dyno-name': z
    .string()
    .optional()
    .describe(
      'Specific dyno to restart (e.g., web.1). If neither dyno-name nor process-type specified, restarts all dynos'
    ),
  'process-type': z
    .string()
    .optional()
    .describe(
      'Type of dynos to restart (e.g., web). If neither dyno-name nor process-type specified, restarts all dynos'
    )
});

export type PsRestartOptions = z.infer<typeof psRestartOptionsSchema>;

/**
 * Registers the ps tool with the MCP server.
 *
 * @param server - The MCP server instance.
 * @param herokuRepl - The Heroku REPL instance.
 */
export const registerPsListTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'ps_list',
    '[DESC] List dynos for an app\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] json: json output\n' +
      '[USAGE] Monitor running dynos, check dyno status\n' +
      '[RELATED] ps_scale (adjust dynos), ps_restart (restart processes)',
    psListOptionsSchema.shape,
    async (options: PsListOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PS)
        .addFlags({
          app: options.app,
          json: options.json
        })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the ps:scale tool with the MCP server.
 *
 * @param server - The MCP server instance.
 * @param herokuRepl - The Heroku REPL instance.
 */
export const registerPsScaleTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'ps_scale',
    '[DESC] Scale dyno quantity up or down\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] dyno: <string> Dyno type, quantity and size (e.g., web=3:Standard-2X)\n' +
      '[USAGE] Scale dynos up/down, resize dynos, view current formation\n' +
      '[EXAMPLES] Scale and resize: web=3:Standard-2X worker+1\n' +
      '          View formation: omit dyno parameter\n' +
      '[FORMAT] TYPE=QUANTITY[:SIZE] or TYPE+/-QUANTITY[:SIZE]\n' +
      '[RELATED] ps_list (list dynos)',
    psScaleOptionsSchema.shape,
    async (options: PsScaleOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PS_SCALE)
        .addFlags({
          app: options.app
        })
        .addPositionalArguments(options.dyno ? { dyno: options.dyno } : {})
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the ps:restart tool with the MCP server.
 *
 * @param server - The MCP server instance.
 * @param herokuRepl - The Heroku REPL instance.
 */
export const registerPsRestartTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'ps_restart',
    '[DESC] Restart app dynos\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] dyno-name: specific dyno (e.g., web.1)\n' +
      '      process-type: type of dynos (e.g., web)\n' +
      '[BEHAVIOR] If neither dyno-name nor process-type specified, restarts all dynos\n' +
      '[EXAMPLES] Restart specific dyno: --dyno-name web.1\n' +
      '          Restart all web dynos: --process-type web\n' +
      '          Restart all dynos: no additional parameters\n' +
      '[RELATED] ps_list (list dynos)',
    psRestartOptionsSchema.shape,
    async (options: PsRestartOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PS_RESTART)
        .addFlags({
          app: options.app,
          'dyno-name': options['dyno-name'],
          'process-type': options['process-type']
        })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

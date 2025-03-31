import { z } from 'zod';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { handleCliError } from '../utils/handle-cli-error.js';
import { CommandBuilder } from '../utils/command-builder.js';
import { TOOL_COMMAND_MAP } from '../utils/tool-commands.js';
import { HerokuREPL } from '../repl/heroku-cli-repl.js';
import { McpToolResponse } from '../utils/mcp-tool-response.js';

/**
 * Schema for listing Heroku Teams with output format options.
 * This schema defines the structure and validation rules for the list teams operation.
 *
 * [json] - Controls the output format. When true, returns a detailed JSON response containing
 * team metadata such as enterprise account name. When false or omitted, returns a simplified text format.
 */
export const listTeamsOptionsSchema = z.object({
  json: z
    .boolean()
    .optional()
    .describe(
      'Controls the output format. When true, returns a detailed JSON response containing team metadata such as ' +
        'enterprise account name. When false or omitted, returns a simplified text format.'
    )
});

/**
 * Type definition for options when listing Heroku Teams.
 * This type is derived from the listTeamsOptionsSchema and provides type safety for the list teams operation.
 */
export type ListTeamsOptions = z.infer<typeof listTeamsOptionsSchema>;

/**
 * Registers the list_teams tool with the MCP server.
 * This tool provides information about accessible Heroku Teams,
 * including membership details and enterprise relationships.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerListTeamsTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'list_teams',
    'List Heroku Teams the user belongs to. Use this tool when you need to: ' +
      '1) View all accessible teams, 2) Check team membership, ' +
      '3) Get team metadata and enterprise relationships, or ' +
      '4) Verify team access for app operations. ' +
      'Supports JSON output for detailed team information.',
    listTeamsOptionsSchema.shape,
    async (options: ListTeamsOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.LIST_TEAMS).addFlags({ json: options.json }).build();

      try {
        const output = await herokuRepl.executeCommand(command);
        return { content: [{ type: 'text', text: output }] };
      } catch (error) {
        return handleCliError(error);
      }
    }
  );
};

import { z } from 'zod';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { handleCliOutput } from '../utils/handle-cli-output.js';
import { CommandBuilder } from '../utils/command-builder.js';
import { TOOL_COMMAND_MAP } from '../utils/tool-commands.js';
import { HerokuREPL } from '../repl/heroku-cli-repl.js';
import { McpToolResponse } from '../utils/mcp-tool-response.js';

/**
 * Schema for listing Heroku applications with filtering and output format options.
 * This schema defines the structure and validation rules for the list apps operation.
 */
export const listAppsOptionsSchema = z.object({
  all: z
    .boolean()
    .optional()
    .describe(
      'When true, displays a comprehensive list including: (1) apps owned by the user and (2) apps where the user ' +
        'is a collaborator through direct access or team membership. When false or omitted, shows only owned apps.'
    ),
  json: z
    .boolean()
    .optional()
    .describe(
      'Controls the output format. When true, returns a detailed JSON response containing app metadata such as ' +
        'generation, buildpacks, owner information, and region. When false or omitted, returns a simplified text ' +
        'format.'
    ),
  personal: z
    .boolean()
    .optional()
    .describe(
      'Forces the tool to list applications from your personal account, even when you have a default team configured. ' +
        'When true, overrides any default team setting and shows only apps owned by your personal account. ' +
        'This is particularly useful when you work with multiple teams but need to specifically view your personal apps. ' +
        'When false or omitted, follows the default behavior of using the default team if one is set.'
    ),
  space: z
    .string()
    .optional()
    .describe(
      'Filters the results to show only apps within a specific private space. Provide the private space name to ' +
        'filter. This parameter is mutually exclusive with the team parameter.'
    ),
  team: z
    .string()
    .optional()
    .describe(
      'Filters the results to show only apps belonging to a specific team. Provide the team name to filter. ' +
        'This parameter is mutually exclusive with the space parameter.'
    )
});

/**
 * Type definition for the options used when listing Heroku applications.
 * This type is derived from the listAppsOptionsSchema and provides type safety for the list apps operation.
 */
export type ListAppsOptions = z.infer<typeof listAppsOptionsSchema>;

/**
 * Registers the list_apps tool with the MCP server.
 * This tool allows users to list Heroku applications with various filtering options
 * and output formats.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerListAppsTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'list_apps',
    'List Heroku applications with flexible filtering options. Use this tool when you need to: ' +
      '1) Show all apps owned by the user, 2) Show apps where the user is a collaborator (use all=true), ' +
      '3) Filter apps by team or private space, or 4) Get detailed app metadata in JSON format. ' +
      'The response includes app names, regions, and ownership information.',
    listAppsOptionsSchema.shape,
    async (options: ListAppsOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.LIST_APPS)
        .addFlags({
          all: options.all,
          json: options.json,
          personal: options.personal,
          space: options.space,
          team: options.team
        })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Schema for getting information about a Heroku application.
 * This schema defines the structure and validation rules for the get app info operation.
 */
export const getAppInfoOptionsSchema = z.object({
  app: z
    .string()
    .describe(
      'The name of the Heroku app to get information about. This must be an existing app that you have access to.'
    ),
  json: z
    .boolean()
    .optional()
    .describe(
      'Controls the output format. When true, returns a detailed JSON response containing app metadata such as ' +
        'add-ons, dynos, buildpack configurations, collaborators, and domain information. When false or omitted, ' +
        'returns a simplified text format.'
    )
});

/**
 * Type definition for the options used when getting information about a Heroku application.
 * This type is derived from the getAppInfoOptionsSchema and provides type safety for the get app info operation.
 */
export type GetAppInfoOptions = z.infer<typeof getAppInfoOptionsSchema>;

/**
 * Registers the get_app_info tool with the MCP server.
 * This tool provides detailed information about a specific Heroku application,
 * including configuration, dynos, add-ons, and more.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerGetAppInfoTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'get_app_info',
    'Get comprehensive information about a Heroku application. Use this tool when you need to: ' +
      '1) View app configuration and settings, 2) Check dyno formation and scaling, ' +
      '3) List add-ons and buildpacks, 4) View collaborators and access details, ' +
      '5) Check domains and certificates. Accepts app name and optional JSON format. ' +
      'Returns detailed app status and configuration.',
    getAppInfoOptionsSchema.shape,
    async (options: GetAppInfoOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.GET_APP_INFO)
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
 * Schema for creating a new Heroku application.
 * This schema defines the structure and validation rules for the create app operation.
 */
export const createAppOptionsSchema = z.object({
  app: z
    .string()
    .optional()
    .describe(
      'Specifies the desired name for the new Heroku app. If omitted, Heroku will auto-generate a random name. ' +
        "Best practice: Provide a meaningful, unique name that reflects your application's purpose."
    ),
  region: z
    .enum(['us', 'eu'])
    .optional()
    .describe(
      'Determines the geographical region where your app will run. Options: "us" (United States) or "eu" (Europe). ' +
        'Defaults to "us" if not specified. Note: Cannot be used with space parameter.'
    ),
  space: z
    .string()
    .optional()
    .describe(
      'Places the app in a specific private space, which provides enhanced security and networking features. ' +
        'Specify the private space name. Note: When used, the app inherits the region from the private space and ' +
        'the region parameter cannot be used.'
    ),
  team: z
    .string()
    .optional()
    .describe(
      'Associates the app with a specific team for collaborative development and management. Provide the team name ' +
        "to set ownership. The app will be created under the team's account rather than your personal account."
    )
});

/**
 * Type definition for the options used when creating a new Heroku application.
 * This type is derived from the createAppOptionsSchema and provides type safety for the create app operation.
 */
export type CreateAppOptions = z.infer<typeof createAppOptionsSchema>;

/**
 * Registers the create_app tool with the MCP server.
 * This tool enables creation of new Heroku applications with customizable settings
 * for region, team ownership, and private space placement.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerCreateAppTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'create_app',
    'Create a new Heroku application with customizable settings. Use this tool when a user wants to: ' +
      '1) Create a new app with a specific name, 2) Create an app in a particular region (US/EU), ' +
      '3) Create an app within a team, or 4) Create an app in a private space. ' +
      "The tool handles name generation if not specified and returns the new app's details.",
    createAppOptionsSchema.shape,
    async (options: CreateAppOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.CREATE_APP)
        .addPositionalArguments({ app: options.app })
        .addFlags({
          region: options.region,
          space: options.space,
          team: options.team
        })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Schema for renaming a Heroku application.
 * This schema defines the structure and validation rules for the rename app operation.
 */
export const renameAppOptionsSchema = z.object({
  app: z
    .string()
    .describe(
      'The current name of the Heroku app you want to rename. This must be an existing app that you have access to.'
    ),
  newName: z.string().describe('The new name you want to give to the app. Must be unique across all Heroku apps.')
});

/**
 * Type definition for the options used when renaming a Heroku application.
 * This type is derived from the renameAppOptionsSchema and provides type safety for the rename app operation.
 */
export type RenameAppOptions = z.infer<typeof renameAppOptionsSchema>;

/**
 * Registers the rename_app tool with the MCP server.
 * This tool allows renaming of existing Heroku applications while ensuring
 * name availability and access permissions.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerRenameAppTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'rename_app',
    'Rename an existing Heroku application. Use this tool when a user needs to: ' +
      "1) Change an app's name, or 2) Resolve naming conflicts. " +
      'Requires both current app name and desired new name. ' +
      'The tool validates name availability and handles the rename process.',
    renameAppOptionsSchema.shape,
    async (options: RenameAppOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.RENAME_APP)
        .addFlags({ app: options.app })
        .addPositionalArguments({ newName: options.newName })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Schema for transferring ownership of a Heroku application.
 * This schema defines the structure and validation rules for the transfer app operation.
 */
export const transferAppOptionsSchema = z.object({
  app: z
    .string()
    .describe(
      'The name of the Heroku app you want to transfer ownership of. You must be the current owner of this app or ' +
        'a team admin to transfer it.'
    ),
  recipient: z
    .string()
    .describe(
      'The email address of the user or the name of the team who will receive ownership of the app. The recipient ' +
        'must have a Heroku account.'
    )
});

/**
 * Type definition for the options used when transferring a Heroku application.
 * This type is derived from the transferAppOptionsSchema and provides type safety for the transfer app operation.
 */
export type TransferAppOptions = z.infer<typeof transferAppOptionsSchema>;

/**
 * Registers the transfer_app tool with the MCP server.
 * This tool facilitates ownership transfer of Heroku applications between users
 * or to teams, with appropriate permission checks.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerTransferAppTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'transfer_app',
    'Transfer ownership of a Heroku application. Use this tool when a user wants to: ' +
      "1) Transfer an app to another user's account, 2) Move an app to a team, " +
      '3) Change app ownership for organizational purposes. ' +
      'Requires the app name and recipient (email for users, name for teams). ' +
      'The current user must be the app owner or a team admin to perform the transfer.',
    transferAppOptionsSchema.shape,
    async (options: TransferAppOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.TRANSFER_APP)
        .addFlags({ app: options.app })
        .addPositionalArguments({ recipient: options.recipient })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

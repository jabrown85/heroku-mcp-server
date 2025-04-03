import { z } from 'zod';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { handleCliOutput } from '../utils/handle-cli-output.js';
import { CommandBuilder } from '../utils/command-builder.js';
import { TOOL_COMMAND_MAP } from '../utils/tool-commands.js';
import { HerokuREPL } from '../repl/heroku-cli-repl.js';
import { McpToolResponse } from '../utils/mcp-tool-response.js';

/**
 * Schema for listing Heroku add-ons with filtering and output format options.
 * This schema defines the structure and validation rules for the list add-ons operation.
 */
export const listAddonsOptionsSchema = z.object({
  all: z
    .boolean()
    .optional()
    .describe(
      'Forces the tool to list all add-ons across all apps accessible to the user. When true, this flag: ' +
        '1) Overrides any default app setting from Git remote configuration, ' +
        '2) Ignores the app flag if provided, ' +
        '3) Shows a comprehensive list including: app name, add-on name, service plan, billing status, and ' +
        'provisioning status for each add-on. When false or omitted, respects the default app setting and ' +
        'the app flag.'
    ),
  app: z
    .string()
    .optional()
    .describe(
      'Specifies a single Heroku app whose add-ons you want to list. Important behaviors: ' +
        '1) When provided, shows add-ons and attachments only for this specific app, ' +
        '2) When omitted, falls back to the default app from Git remote if configured, ' +
        '3) If no default app exists, lists add-ons for all accessible apps, ' +
        '4) This flag is completely ignored when all=true. ' +
        'The response includes both provisioned add-ons and add-on attachments from other apps.'
    ),
  json: z
    .boolean()
    .optional()
    .describe(
      'Controls the response format and detail level. When true, returns a structured JSON response containing: ' +
        '1) Complete add-on metadata including ID, name, and creation timestamp, ' +
        '2) Detailed plan information including tier and cost, ' +
        '3) Configuration variables set by the add-on, ' +
        '4) Attachment details if the add-on is shared with other apps, ' +
        '5) Billing and compliance status information. ' +
        'When false or omitted, returns a human-readable text format with basic information.'
    )
});

/**
 * Type definition for the options used when listing Heroku add-ons.
 */
export type ListAddonsOptions = z.infer<typeof listAddonsOptionsSchema>;

/**
 * Registers the list_addons tool with the MCP server.
 * This tool enables listing of Heroku add-ons with various filtering options
 * and output formats. It can show add-ons for specific apps or across all accessible apps.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerListAddonsTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'list_addons',
    'List Heroku add-ons with flexible filtering options. Use this tool when you need to: ' +
      '1) View all add-ons across your apps, 2) List add-ons for a specific app, ' +
      '3) Get detailed add-on metadata in JSON format.',
    listAddonsOptionsSchema.shape,
    async (options: ListAddonsOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.LIST_ADDONS)
        .addFlags({
          all: options.all,
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
 * Schema for getting information about a specific Heroku add-on.
 */
export const getAddonInfoOptionsSchema = z.object({
  addon: z
    .string()
    .describe(
      'Identifies the add-on to retrieve information about. Accepts three types of identifiers: ' +
        '1) Add-on ID (uuid format, works globally without app context), ' +
        '2) Add-on name (e.g., "postgresql-curved-12345", works globally without app context), ' +
        '3) Attachment name (e.g., "DATABASE", requires app context). ' +
        'Important behaviors: ' +
        '- When using attachment name, must provide app flag or have default app set, ' +
        '- Attachment name must be from the app where attached, not the provisioning app, ' +
        '- Add-on ID and unique names work with correct app context or without app context, ' +
        '- Must have access to the app where the add-on is either provisioned or attached.'
    ),
  app: z
    .string()
    .optional()
    .describe(
      'Provides application context for finding the add-on. Affects how the addon parameter is interpreted: ' +
        '1) When provided: ' +
        '   - Searches for the add-on only within this specific app, ' +
        '   - Enables use of attachment names in the addon parameter, ' +
        '   - Must have access to this app. ' +
        '2) When omitted: ' +
        '   - First tries using default app from Git remote configuration, ' +
        '   - If no default app, addon parameter must be an ID or globally unique name, ' +
        '   - Cannot use attachment names without app context. ' +
        'Best practice: Always provide when using attachment names.'
    )
});

/**
 * Type definition for the options used when getting add-on information.
 */
export type GetAddonInfoOptions = z.infer<typeof getAddonInfoOptionsSchema>;

/**
 * Registers the get_addon_info tool with the MCP server.
 * This tool provides detailed information about a specific Heroku add-on,
 * including its attachments, billing and state.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerGetAddonInfoTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'get_addon_info',
    'Get comprehensive information about a Heroku add-on. Use this tool when you need to: ' +
      '1) View add-on details, 2) Check plan details and state, ' +
      '3) View billing information. Accepts add-on ID, name, or attachment name.',
    getAddonInfoOptionsSchema.shape,
    async (options: GetAddonInfoOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.GET_ADDON_INFO)
        .addFlags({ app: options.app })
        .addPositionalArguments({ addon: options.addon })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Schema for creating a new Heroku add-on.
 */
export const createAddonOptionsSchema = z.object({
  app: z
    .string()
    .describe(
      'Specifies the target Heroku app for add-on provisioning. Requirements and behaviors: ' +
        '1) App must exist and be accessible to you with write permissions, ' +
        '2) App region may affect which add-on services are available, ' +
        '3) If app is in a Private Space, only add-ons compliant with the space requirements can be provisioned. ' +
        'The add-on will be provisioned directly to this app and config vars will be set automatically.'
    ),
  as: z
    .string()
    .optional()
    .describe(
      'Sets a custom local name for the add-on attachment in the app. Important details: ' +
        '1) Must be unique within the app (no other attachment can use the same name), ' +
        '2) Used as a prefix for config vars (e.g., "CUSTOM_NAME_URL" instead of "HEROKU_POSTGRESQL_URL"), ' +
        '3) Makes the add-on easier to identify in app context (e.g., "as: DATABASE" is clearer than "postgresql-curved-12345"), ' +
        '4) When omitted, Heroku generates a default name based on the add-on service. ' +
        'Best practice: Use meaningful names that indicate the add-on\'s purpose (e.g., "PRIMARY_DB", "CACHE").'
    ),
  name: z
    .string()
    .optional()
    .describe(
      'Assigns a custom global identifier for the add-on instance. Key characteristics: ' +
        '1) Must be unique across all add-ons in Heroku (not just your apps), ' +
        '2) Can be used to reference the add-on from any app or context, ' +
        '3) Useful for identifying the add-on in cross-app scenarios or automation, ' +
        '4) When omitted, Heroku generates a unique name (e.g., "postgresql-curved-12345"). ' +
        'Best practice: Include app name or environment if using custom names (e.g., "myapp-prod-db").'
    ),
  serviceAndPlan: z
    .string()
    .describe(
      'Specifies which add-on service and plan to provision. Format and behavior: ' +
        '1) Required format: "service_slug:plan_slug" (e.g., "heroku-postgresql:essential-0"), ' +
        '2) If only service slug provided, the default (usually the cheapest or free) plan will be selected, ' +
        '3) Some plans may have prerequisites (e.g., inside a private space, specific regions). ' +
        'Use list_addon_services and list_addon_plans tools to discover available options.'
    )
});

/**
 * Type definition for the options used when creating an add-on.
 */
export type CreateAddonOptions = z.infer<typeof createAddonOptionsSchema>;

/**
 * Registers the create_addon tool with the MCP server.
 * This tool enables provisioning of new Heroku add-ons with customizable settings
 * for service plans, attachment names, and global identifiers.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerCreateAddonTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'create_addon',
    'Create a new Heroku add-on for an application. Use this tool when you need to: ' +
      '1) Provision a new add-on for your app, 2) Specify a particular service and plan, ' +
      '3) Set a custom name for the add-on or attachment. The tool handles the provisioning process ' +
      "and returns the new add-on's details.",
    createAddonOptionsSchema.shape,
    async (options: CreateAddonOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.CREATE_ADDON)
        .addFlags({
          app: options.app,
          as: options.as,
          name: options.name
        })
        .addPositionalArguments({ 'service:plan': options.serviceAndPlan })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Schema for listing available add-on services.
 */
export const listAddonServicesOptionsSchema = z.object({
  json: z
    .boolean()
    .optional()
    .describe(
      'Controls the output format. When true, returns a detailed JSON response containing additional add-on service ' +
        'metadata such as sharing options and supported app generations. When false or omitted, returns a simplified ' +
        'text format including only the add-on service slug, name and state.'
    )
});

/**
 * Type definition for the options used when listing add-on services.
 */
export type ListAddonServicesOptions = z.infer<typeof listAddonServicesOptionsSchema>;

/**
 * Registers the list_addon_services tool with the MCP server.
 * This tool provides information about available Heroku add-on services,
 * including their current state and supported features.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerListAddonServicesTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'list_addon_services',
    'List available Heroku add-on services. Use this tool when you need to view all available add-on services. ' +
      'Returns a list of add-on services with their basic information.',
    listAddonServicesOptionsSchema.shape,
    async (options: ListAddonServicesOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.LIST_ADDON_SERVICES)
        .addFlags({
          json: options.json
        })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Schema for listing plans for a specific add-on service.
 */
export const listAddonPlansOptionsSchema = z.object({
  service: z
    .string()
    .describe(
      'Identifies the add-on service whose plans you want to list. Requirements and behaviors: ' +
        '1) Must be a valid service slug (e.g., "heroku-postgresql", "heroku-redis", etc.), ' +
        '2) Can be obtained from the list_addon_services command output. '
    ),
  json: z
    .boolean()
    .optional()
    .describe(
      'Controls the response format and detail level. When true, returns a structured JSON response containing ' +
        'additional add-on plan metadata including descriptions, pricing and indicating if the plan is installable' +
        'inside a private space or not. When false or omitted, returns a human-readable text format.'
    )
});

/**
 * Type definition for the options used when listing add-on service plans.
 */
export type ListAddonPlansOptions = z.infer<typeof listAddonPlansOptionsSchema>;

/**
 * Registers the list_addon_plans tool with the MCP server.
 * This tool provides detailed information about available plans for a specific
 * add-on service, including pricing, features, and provisioning requirements.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerListAddonPlansTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'list_addon_plans',
    'List available plans for a specific Heroku add-on service. Use this tool when you need to: ' +
      '1) View all plans for a service, 2) Compare plan pricing, ' +
      '3) Check plan availability. Requires add-on service slug and returns detailed plan information.',
    listAddonPlansOptionsSchema.shape,
    async (options: ListAddonPlansOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.LIST_ADDON_PLANS)
        .addFlags({
          json: options.json
        })
        .addPositionalArguments({ service: options.service })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

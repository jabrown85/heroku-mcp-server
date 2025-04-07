import { z } from 'zod';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { handleCliOutput } from '../utils/handle-cli-output.js';
import { CommandBuilder } from '../utils/command-builder.js';
import { TOOL_COMMAND_MAP } from '../utils/tool-commands.js';
import type { HerokuREPL } from '../repl/heroku-cli-repl.js';
import type { McpToolResponse } from '../utils/mcp-tool-response.js';

/**
 * Schema for executing PostgreSQL queries.
 * This schema defines the structure and validation rules for running SQL queries.
 */
export const pgPsqlOptionsSchema = z.object({
  command: z
    .string()
    .optional()
    .describe(
      'SQL command to run; file is ignored if provided; must be single line; must supply either command or file'
    ),
  file: z
    .string()
    .optional()
    .describe(
      'SQL file to run; command is ignored if provided; must be an absolute path; must supply either command or file'
    ),
  credential: z.string().optional().describe('credential to use'),
  app: z.string().describe('app to run command against'),
  database: z
    .string()
    .optional()
    .describe(
      "Config var containing the connection string, unique name, ID, or alias of the database. To access another app's database, prepend the app name to the config var or alias with `APP_NAME::`. If omitted, DATABASE_URL is used."
    )
});

export type PgPsqlOptions = z.infer<typeof pgPsqlOptionsSchema>;

/**
 * Schema for getting database information.
 */
export const pgInfoOptionsSchema = z.object({
  app: z.string().describe('The name of the Heroku app whose database to inspect.'),
  database: z
    .string()
    .optional()
    .describe(
      "Config var containing the connection string, unique name, ID, or alias of the database. To access another app's database, prepend the app name to the config var or alias with `APP_NAME::`. If omitted, all databases are shown."
    )
});

export type PgInfoOptions = z.infer<typeof pgInfoOptionsSchema>;

/**
 * Schema for viewing active queries.
 */
export const pgPsOptionsSchema = z.object({
  app: z.string().describe('The name of the Heroku app whose database processes to view.'),
  verbose: z
    .boolean()
    .optional()
    .describe('When true, shows additional query details including query plan and memory usage.'),
  database: z
    .string()
    .optional()
    .describe(
      "Config var containing the connection string, unique name, ID, or alias of the database. To access another app's database, prepend the app name to the config var or alias with `APP_NAME::`. If omitted, DATABASE_URL is used."
    )
});

export type PgPsOptions = z.infer<typeof pgPsOptionsSchema>;

/**
 * Schema for viewing database locks.
 */
export const pgLocksOptionsSchema = z.object({
  app: z.string().describe('The name of the Heroku app whose database locks to view.'),
  truncate: z.boolean().optional().describe('When true, truncates queries to 40 characters.'),
  database: z
    .string()
    .optional()
    .describe(
      "Config var containing the connection string, unique name, ID, or alias of the database. To access another app's database, prepend the app name to the config var or alias with `APP_NAME::`. If omitted, DATABASE_URL is used."
    )
});

export type PgLocksOptions = z.infer<typeof pgLocksOptionsSchema>;

/**
 * Schema for viewing query statistics.
 */
export const pgOutliersOptionsSchema = z.object({
  app: z.string().describe('The name of the Heroku app whose query statistics to analyze.'),
  num: z.number().optional().describe('The number of queries to display. Defaults to 10.'),
  reset: z.boolean().optional().describe('When true, resets statistics gathered by pg_stat_statements.'),
  truncate: z.boolean().optional().describe('When true, truncates queries to 40 characters.'),
  database: z
    .string()
    .optional()
    .describe(
      "Config var containing the connection string, unique name, ID, or alias of the database. To access another app's database, prepend the app name to the config var or alias with `APP_NAME::`. If omitted, DATABASE_URL is used."
    )
});

export type PgOutliersOptions = z.infer<typeof pgOutliersOptionsSchema>;

/**
 * Schema for viewing database credentials.
 */
export const pgCredentialsOptionsSchema = z.object({
  app: z.string().describe('The name of the Heroku app whose database credentials to view.'),
  database: z
    .string()
    .optional()
    .describe(
      "Config var containing the connection string, unique name, ID, or alias of the database. To access another app's database, prepend the app name to the config var or alias with `APP_NAME::`. If omitted, DATABASE_URL is used."
    )
});

export type PgCredentialsOptions = z.infer<typeof pgCredentialsOptionsSchema>;

/**
 * Schema for terminating database processes.
 */
export const pgKillOptionsSchema = z.object({
  app: z.string().describe('The name of the Heroku app whose database process to terminate.'),
  pid: z.number().describe('The process ID to terminate, as shown by pg_ps.'),
  force: z.boolean().optional().describe('When true, forces immediate termination instead of graceful shutdown.'),
  database: z
    .string()
    .optional()
    .describe(
      "Config var containing the connection string, unique name, ID, or alias of the database. To access another app's database, prepend the app name to the config var or alias with `APP_NAME::`. If omitted, DATABASE_URL is used."
    )
});

export type PgKillOptions = z.infer<typeof pgKillOptionsSchema>;

/**
 * Schema for managing database maintenance.
 */
export const pgMaintenanceOptionsSchema = z.object({
  app: z.string().describe('Show current maintenance information for the app.'),
  database: z
    .string()
    .optional()
    .describe(
      "Config var containing the connection string, unique name, ID, or alias of the database. To access another app's database, prepend the app name to the config var or alias with `APP_NAME::`. If omitted, DATABASE_URL is used."
    )
});

export type PgMaintenanceOptions = z.infer<typeof pgMaintenanceOptionsSchema>;

/**
 * Schema for managing database backups.
 */
export const pgBackupsOptionsSchema = z.object({
  app: z.string().describe('The name of the Heroku app whose backups to manage.')
});

export type PgBackupsOptions = z.infer<typeof pgBackupsOptionsSchema>;

/**
 * Schema for upgrading database version.
 */
export const pgUpgradeOptionsSchema = z.object({
  app: z.string().describe('The name of the Heroku app whose database to upgrade.'),
  version: z.string().optional().describe('PostgreSQL version to upgrade to'),
  confirm: z.string().optional().describe('Confirmation string required for this potentially destructive operation.'),
  database: z
    .string()
    .optional()
    .describe(
      "Config var containing the connection string, unique name, ID, or alias of the database. To access another app's database, prepend the app name to the config var or alias with `APP_NAME::`. If omitted, DATABASE_URL is used."
    )
});

export type PgUpgradeOptions = z.infer<typeof pgUpgradeOptionsSchema>;

/**
 * Registers the pg:psql tool with the MCP server.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerPgPsqlTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pg_psql',
    'Execute SQL queries against Heroku PostgreSQL databases. Use this tool when you need to: ' +
      '1) Run SQL queries for database analysis, 2) Investigate database locks and performance, ' +
      '3) Make schema modifications or updates, 4) Execute complex database operations. ' +
      'The tool provides direct SQL access with support for file-based queries and credential management.',
    pgPsqlOptionsSchema.shape,
    async (options: PgPsqlOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_PSQL)
        .addFlags({
          app: options.app,
          command: `"${options.command?.replaceAll('\n', ' ') ?? ''}"`,
          file: options.file,
          credential: options.credential
        })
        .addPositionalArguments({ database: options.database })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pg:info tool with the MCP server.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerPgInfoTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pg_info',
    'Display detailed information about Heroku PostgreSQL databases. Use this tool when you need to: ' +
      '1) View comprehensive database configuration and status, 2) Monitor database performance metrics, ' +
      '3) Check connection and resource utilization, 4) Assess database health and capacity. ' +
      'The tool provides detailed insights into database operations and configuration.',
    pgInfoOptionsSchema.shape,
    async (options: PgInfoOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_INFO)
        .addFlags({
          app: options.app
        })
        .addPositionalArguments({ database: options.database })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pg:ps tool with the MCP server.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerPgPsTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pg_ps',
    'Monitor active database queries and processes. Use this tool when you need to: ' +
      '1) View currently executing queries, 2) Track query progress and resource usage, ' +
      '3) Identify long-running or blocked queries, 4) Debug performance issues in real-time. ' +
      'The tool provides detailed visibility into database activity with optional verbose output.',
    pgPsOptionsSchema.shape,
    async (options: PgPsOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_PS)
        .addFlags({
          app: options.app,
          verbose: options.verbose
        })
        .addPositionalArguments({ database: options.database })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pg:locks tool with the MCP server.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerPgLocksTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pg_locks',
    'Analyze database locks and blocking transactions. Use this tool when you need to: ' +
      '1) Identify blocked queries and lock chains, 2) Investigate deadlock situations, ' +
      '3) Monitor transaction lock states, 4) Resolve blocking issues affecting performance. ' +
      'The tool helps diagnose and resolve database concurrency problems.',
    pgLocksOptionsSchema.shape,
    async (options: PgLocksOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_LOCKS)
        .addFlags({
          app: options.app,
          truncate: options.truncate
        })
        .addPositionalArguments({ database: options.database })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pg:outliers tool with the MCP server.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerPgOutliersTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pg_outliers',
    'Identify resource-intensive database operations. Use this tool when you need to: ' +
      '1) Find slow or expensive queries, 2) Analyze query performance patterns, ' +
      '3) Optimize database workload, 4) Track query statistics over time. ' +
      'The tool helps identify opportunities for performance optimization.',
    pgOutliersOptionsSchema.shape,
    async (options: PgOutliersOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_OUTLIERS)
        .addFlags({
          app: options.app,
          num: options.num?.toString(),
          reset: options.reset,
          truncate: options.truncate
        })
        .addPositionalArguments({ database: options.database })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pg:credentials tool with the MCP server.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerPgCredentialsTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pg_credentials',
    'Manage database access credentials and security. Use this tool when you need to: ' +
      '1) View current database credentials, 2) Configure database access permissions, ' +
      '3) Rotate credentials for security compliance, 4) Set up monitoring access. ' +
      'The tool helps maintain secure database access and credential management.',
    pgCredentialsOptionsSchema.shape,
    async (options: PgCredentialsOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_CREDENTIALS)
        .addFlags({
          app: options.app
        })
        .addPositionalArguments({ database: options.database })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pg:kill tool with the MCP server.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerPgKillTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pg_kill',
    'Terminate specific database processes. Use this tool when you need to: ' +
      '1) Stop problematic or stuck queries, 2) Clear blocking transactions, ' +
      '3) Manage resource-intensive operations, 4) Handle runaway processes safely. ' +
      'The tool provides controlled process termination with optional force mode.',
    pgKillOptionsSchema.shape,
    async (options: PgKillOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_KILL)
        .addFlags({
          app: options.app,
          force: options.force
        })
        .addPositionalArguments({
          pid: options.pid.toString(),
          database: options.database
        })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pg:maintenance tool with the MCP server.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerPgMaintenanceTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pg_maintenance',
    'Monitor database maintenance status and operations. Use this tool when you need to: ' +
      '1) Check current maintenance windows, 2) View scheduled maintenance activities, ' +
      '3) Track maintenance operation progress, 4) Plan database maintenance tasks. ' +
      'The tool provides visibility into database maintenance state and scheduling.',
    pgMaintenanceOptionsSchema.shape,
    async (options: PgMaintenanceOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_MAINTENANCE)
        .addFlags({
          app: options.app
        })
        .addPositionalArguments({ database: options.database })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pg:backups tool with the MCP server.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerPgBackupsTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pg_backups',
    'Manage database backup operations and schedules. Use this tool when you need to: ' +
      '1) View existing database backups, 2) Monitor backup schedules and status, ' +
      '3) Track backup operation progress, 4) Verify backup availability. ' +
      'The tool helps maintain database backup operations and disaster recovery readiness.',
    pgBackupsOptionsSchema.shape,
    async (options: PgBackupsOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_BACKUPS)
        .addFlags({
          app: options.app
        })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pg:upgrade tool with the MCP server.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerPgUpgradeTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pg_upgrade',
    'Upgrade PostgreSQL database version. Use this tool when you need to: ' +
      '1) Migrate to a newer PostgreSQL version, 2) Plan version upgrade paths, ' +
      '3) Execute controlled version migrations, 4) Verify upgrade compatibility. ' +
      'The tool manages safe database version upgrades with confirmation protection.',
    pgUpgradeOptionsSchema.shape,
    async (options: PgUpgradeOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_UPGRADE)
        .addFlags({
          app: options.app,
          version: options.version,
          confirm: options.confirm
        })
        .addPositionalArguments({ database: options.database })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

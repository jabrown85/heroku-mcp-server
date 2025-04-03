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
  command: z.string().optional().describe('SQL command to run'),
  file: z.string().optional().describe('SQL file to run'),
  credential: z.string().optional().describe('credential to use'),
  app: z.string().describe('app to run command against'),
  remote: z.string().optional().describe('git remote of app to use'),
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
  remote: z.string().optional().describe('git remote of app to use'),
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
  remote: z.string().optional().describe('git remote of app to use'),
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
  remote: z.string().optional().describe('git remote of app to use'),
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
  remote: z.string().optional().describe('git remote of app to use'),
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
  remote: z.string().optional().describe('git remote of app to use'),
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
  pid: z.number().describe('The process ID to terminate, as shown by pg:ps.'),
  force: z.boolean().optional().describe('When true, forces immediate termination instead of graceful shutdown.'),
  remote: z.string().optional().describe('git remote of app to use'),
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
  app: z.string().describe('The name of the Heroku app whose maintenance to manage.'),
  remote: z.string().optional().describe('git remote of app to use'),
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
  app: z.string().describe('The name of the Heroku app whose backups to manage.'),
  verbose: z.boolean().optional().describe('Show additional backup information.'),
  confirm: z.string().optional().describe('Confirmation string for destructive actions.'),
  output: z.string().optional().describe('Output format.'),
  'wait-interval': z.string().optional().describe('Wait interval for backup operations.'),
  at: z.string().optional().describe('Schedule backups at specified time.'),
  quiet: z.boolean().optional().describe('Suppress output.'),
  remote: z.string().optional().describe('git remote of app to use')
});

export type PgBackupsOptions = z.infer<typeof pgBackupsOptionsSchema>;

/**
 * Schema for copying database data.
 */
export const pgCopyOptionsSchema = z.object({
  app: z.string().describe('The name of the Heroku app to run command against.'),
  source: z.string().describe('Config var exposed to the owning app containing the source database URL.'),
  target: z.string().describe('Config var exposed to the owning app containing the target database URL.'),
  'wait-interval': z.string().optional().describe('Wait interval for copy operation.'),
  verbose: z.boolean().optional().describe('Show additional copy information.'),
  confirm: z.string().optional().describe('Confirmation string required for potentially destructive operations.'),
  remote: z.string().optional().describe('git remote of app to use')
});

export type PgCopyOptions = z.infer<typeof pgCopyOptionsSchema>;

/**
 * Schema for upgrading database version.
 */
export const pgUpgradeOptionsSchema = z.object({
  app: z.string().describe('The name of the Heroku app whose database to upgrade.'),
  version: z.string().optional().describe('PostgreSQL version to upgrade to'),
  confirm: z.string().optional().describe('Confirmation string required for this potentially destructive operation.'),
  remote: z.string().optional().describe('git remote of app to use'),
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
    '[DESC] Execute SQL queries against Heroku PostgreSQL database\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] command: SQL to execute - single line only; file: SQL file path; credential: alternate auth; database: specific DB\n' +
      '[USAGE] Query analysis, locks investigation, schema updates\n' +
      '[RELATED] pg:ps (verify execution), pg:locks (check blocking), pg:credentials (auth)',
    pgPsqlOptionsSchema.shape,
    async (options: PgPsqlOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_PSQL)
        .addFlags({
          app: options.app,
          command: `"${options.command?.replaceAll('\n', '') ?? ''}"`,
          file: options.file,
          credential: options.credential,
          remote: options.remote
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
    '[DESC] Display detailed information about a Heroku PostgreSQL database\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] database: specific DB to inspect\n' +
      '[USAGE] Performance investigation, connection monitoring\n' +
      '[RELATED] pg:ps (active queries), pg:backups (database health)',
    pgInfoOptionsSchema.shape,
    async (options: PgInfoOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_INFO)
        .addFlags({
          app: options.app,
          remote: options.remote
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
    '[DESC] View active queries and their execution details\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] verbose: detailed output; database: specific DB\n' +
      '[USAGE] Identify running queries, monitor progress, verify blocking locks\n' +
      '[RELATED] pg:locks (check blocking), pg:outliers (analyze performance)',
    pgPsOptionsSchema.shape,
    async (options: PgPsOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_PS)
        .addFlags({
          app: options.app,
          verbose: options.verbose,
          remote: options.remote
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
    '[DESC] View database locks and identify blocking transactions\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] truncate: shorten output; database: specific DB\n' +
      '[USAGE] Deadlock investigation, lock chain analysis\n' +
      '[RELATED] pg:ps (blocking queries), pg:psql (detailed investigation)',
    pgLocksOptionsSchema.shape,
    async (options: PgLocksOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_LOCKS)
        .addFlags({
          app: options.app,
          truncate: options.truncate,
          remote: options.remote
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
    '[DESC] Identify resource-intensive and long-running queries\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] num: result limit; reset: clear stats; truncate: shorten display; database: specific DB\n' +
      '[USAGE] Performance analysis, query optimization\n' +
      '[TIPS] Reset periodically; Use with pg:indexes; Follow up with pg:psql',
    pgOutliersOptionsSchema.shape,
    async (options: PgOutliersOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_OUTLIERS)
        .addFlags({
          app: options.app,
          num: options.num?.toString(),
          reset: options.reset,
          truncate: options.truncate,
          remote: options.remote
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
    '[DESC] Manage database connection credentials and access\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] database: specific DB to manage\n' +
      '[USAGE] Setup monitoring, configure access, rotate credentials\n' +
      '[SECURITY] Rotate every 30-90 days; Use --reset for immediate rotation',
    pgCredentialsOptionsSchema.shape,
    async (options: PgCredentialsOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_CREDENTIALS)
        .addFlags({
          app: options.app,
          remote: options.remote
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
    '[DESC] Terminate specific database processes\n' +
      '[PARAM] app: <string> Target application name; pid: <number> Process ID to terminate\n' +
      '[OPT] force: immediate termination; database: specific DB\n' +
      '[SAFETY] Non-destructive to data; Use force cautiously; Verify PID with pg:ps\n' +
      '[USAGE] Stop long queries, clear stuck processes',
    pgKillOptionsSchema.shape,
    async (options: PgKillOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_KILL)
        .addFlags({
          app: options.app,
          force: options.force,
          remote: options.remote
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
    '[DESC] Manage database maintenance windows and operations\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] database: specific DB to maintain\n' +
      '[IMPACT] May affect availability; Includes vacuum, analyze, index rebuilds\n' +
      '[TIMING] Schedule during low-usage periods\n' +
      '[RELATED] pg:info (health), pg:backups (safety)',
    pgMaintenanceOptionsSchema.shape,
    async (options: PgMaintenanceOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_MAINTENANCE)
        .addFlags({
          app: options.app,
          remote: options.remote
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
    '[DESC] Manage database backups and schedules\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] at: schedule timing; verbose: detailed output; output: format control\n' +
      '[USAGE] Create/monitor backups, manage retention\n' +
      '[TIPS] Schedule regular backups; Verify before major operations',
    pgBackupsOptionsSchema.shape,
    async (options: PgBackupsOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_BACKUPS)
        .addFlags({
          app: options.app,
          verbose: options.verbose,
          confirm: options.confirm,
          output: options.output,
          'wait-interval': options['wait-interval'],
          at: options.at,
          quiet: options.quiet,
          remote: options.remote
        })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pg:copy tool with the MCP server.
 *
 * @param server - The MCP server instance to register the tool with
 * @param herokuRepl - The Heroku REPL instance for executing commands
 */
export const registerPgCopyTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pg_copy',
    '[DESC] Copy database between Heroku applications\n' +
      '[PARAM] app: <string> Target app; source: <string> Source DB; target: <string> Target DB\n' +
      '[OPT] wait-interval: progress frequency; verbose: detailed output\n' +
      '[SAFETY] Requires confirmation; Verify DB sizes; Create backup first\n' +
      '[IMPACT] May require downtime; Check app compatibility',
    pgCopyOptionsSchema.shape,
    async (options: PgCopyOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_COPY)
        .addFlags({
          app: options.app,
          'wait-interval': options['wait-interval'],
          verbose: options.verbose,
          confirm: options.confirm,
          remote: options.remote
        })
        .addPositionalArguments({
          source: options.source,
          target: options.target
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
    '[DESC] Upgrade a Heroku PostgreSQL database to a newer version\n' +
      '[PARAM] app: <string> Target application name\n' +
      '[OPT] version: new version; confirm: confirmation string; database: specific DB\n' +
      '[USAGE] Critical operations workflow: 1) Check current version with pg:info',
    pgUpgradeOptionsSchema.shape,
    async (options: PgUpgradeOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PG_UPGRADE)
        .addFlags({
          app: options.app,
          version: options.version,
          confirm: options.confirm,
          remote: options.remote
        })
        .addPositionalArguments({ database: options.database })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

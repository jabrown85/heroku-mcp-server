import { z } from 'zod';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { handleCliOutput } from '../utils/handle-cli-output.js';
import { CommandBuilder } from '../utils/command-builder.js';
import { TOOL_COMMAND_MAP } from '../utils/tool-commands.js';
import type { HerokuREPL } from '../repl/heroku-cli-repl.js';
import type { McpToolResponse } from '../utils/mcp-tool-response.js';

/**
 * Schema for creating a new pipeline.
 */
export const pipelinesCreateOptionsSchema = z.object({
  name: z.string().describe('Name of the pipeline to create'),
  stage: z
    .enum(['development', 'staging', 'production'])
    .describe('Stage of first app in pipeline (e.g., production, staging, development)'),
  app: z.string().optional().describe('Name of the app to add to the pipeline'),
  team: z.string().optional().describe('Team to create the pipeline in')
});

export type PipelinesCreateOptions = z.infer<typeof pipelinesCreateOptionsSchema>;

/**
 * Schema for promoting apps through a pipeline.
 */
export const pipelinesPromoteOptionsSchema = z.object({
  app: z.string().describe('Name of the app to promote from'),
  to: z.string().optional().describe('comma separated list of apps to promote to')
});

export type PipelinesPromoteOptions = z.infer<typeof pipelinesPromoteOptionsSchema>;

/**
 * Schema for listing pipelines.
 */
export const pipelinesListOptionsSchema = z.object({
  json: z.boolean().optional().describe('Output in json format')
});

export type PipelinesListOptions = z.infer<typeof pipelinesListOptionsSchema>;

/**
 * Schema for getting pipeline information.
 */
export const pipelinesInfoOptionsSchema = z.object({
  pipeline: z.string().describe('Name of the pipeline to get info for'),
  json: z.boolean().optional().describe('Output in json format')
});

export type PipelinesInfoOptions = z.infer<typeof pipelinesInfoOptionsSchema>;

/**
 * Schema for the base pipelines command.
 */
export const pipelinesOptionsSchema = z.object({
  json: z.boolean().optional().describe('Output in json format')
});

export type PipelinesOptions = z.infer<typeof pipelinesOptionsSchema>;

/**
 * Registers the pipelines:create tool with the MCP server.
 *
 * @param server - The MCP server instance.
 * @param herokuRepl - The Heroku REPL instance.
 */
export const registerPipelinesCreateTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pipelines_create',
    'Create new Heroku deployment pipelines. Use this tool when you need to: ' +
      '1) Set up new deployment workflows, 2) Create staged application environments, ' +
      '3) Organize apps by development stages, 4) Configure team-based pipeline structures. ' +
      'The tool manages pipeline creation with optional team and initial app configuration.',
    pipelinesCreateOptionsSchema.shape,
    async (options: PipelinesCreateOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PIPELINES_CREATE)
        .addFlags({
          stage: options.stage,
          app: options.app,
          team: options.team
        })
        .addPositionalArguments({ name: options.name })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pipelines:promote tool with the MCP server.
 *
 * @param server - The MCP server instance.
 * @param herokuRepl - The Heroku REPL instance.
 */
export const registerPipelinesPromoteTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pipelines_promote',
    'Promote applications through pipeline stages. Use this tool when you need to: ' +
      '1) Deploy code to staging or production environments, 2) Manage staged releases, ' +
      '3) Coordinate multi-app promotions, 4) Control deployment workflows. ' +
      'The tool handles safe promotion of apps between pipeline stages.',
    pipelinesPromoteOptionsSchema.shape,
    async (options: PipelinesPromoteOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PIPELINES_PROMOTE)
        .addFlags({
          app: options.app,
          to: options.to
        })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the pipelines:list tool with the MCP server.
 *
 * @param server - The MCP server instance.
 * @param herokuRepl - The Heroku REPL instance.
 */
export const registerPipelinesListTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pipelines_list',
    'View available Heroku pipelines. Use this tool when you need to: ' +
      '1) List accessible pipelines, 2) Check pipeline ownership and access, ' +
      '3) View pipeline organization, 4) Find specific pipeline configurations. ' +
      'The tool provides pipeline visibility with optional JSON output format.',
    pipelinesListOptionsSchema.shape,
    async (options: PipelinesListOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PIPELINES)
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
 * Registers the pipelines:info tool with the MCP server.
 *
 * @param server - The MCP server instance.
 * @param herokuRepl - The Heroku REPL instance.
 */
export const registerPipelinesInfoTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pipelines_info',
    'Display detailed pipeline configuration. Use this tool when you need to: ' +
      '1) View pipeline stage configuration, 2) Check connected applications, ' +
      '3) Verify pipeline settings, 4) Monitor pipeline status. ' +
      'The tool provides comprehensive pipeline information and structure details.',
    pipelinesInfoOptionsSchema.shape,
    async (options: PipelinesInfoOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder(TOOL_COMMAND_MAP.PIPELINES_INFO)
        .addFlags({
          json: options.json
        })
        .addPositionalArguments({ pipeline: options.pipeline })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

/**
 * Registers the base pipelines tool with the MCP server.
 *
 * @param server - The MCP server instance.
 * @param herokuRepl - The Heroku REPL instance.
 */
export const registerPipelinesTool = (server: McpServer, herokuRepl: HerokuREPL): void => {
  server.tool(
    'pipelines',
    'List and manage Heroku pipelines. Use this tool when you need to: ' +
      '1) View all accessible pipelines, 2) Monitor pipeline configurations, ' +
      '3) Check pipeline availability, 4) Review pipeline organization. ' +
      'The tool provides high-level pipeline management and visibility.',
    pipelinesOptionsSchema.shape,
    async (options: PipelinesOptions): Promise<McpToolResponse> => {
      const command = new CommandBuilder('pipelines')
        .addFlags({
          json: options.json
        })
        .build();

      const output = await herokuRepl.executeCommand(command);
      return handleCliOutput(output);
    }
  );
};

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { HerokuREPL } from '../repl/heroku-cli-repl.js';
import { TOOL_COMMAND_MAP } from '../utils/tool-commands.js';
import {
  registerPgPsqlTool,
  registerPgInfoTool,
  registerPgPsTool,
  registerPgKillTool,
  registerPgBackupsTool,
  registerPgUpgradeTool
} from './data.js';
import { expect } from 'chai';
import sinon from 'sinon';

describe('PostgreSQL Tools', () => {
  let server: sinon.SinonStubbedInstance<McpServer>;
  let herokuRepl: sinon.SinonStubbedInstance<HerokuREPL>;
  let toolCallback: Function;

  beforeEach(() => {
    server = sinon.createStubInstance(McpServer);
    herokuRepl = sinon.createStubInstance(HerokuREPL);

    server.tool.callsFake((_name, _description, _schema, callback) => {
      toolCallback = callback;
      return server;
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('pg:psql', () => {
    beforeEach(() => {
      registerPgPsqlTool(server, herokuRepl);
    });

    it('should register the tool with correct parameters', () => {
      expect(server.tool.calledOnce).to.be.true;
      expect(server.tool.firstCall.args[0]).to.equal('pg_psql');
      expect(server.tool.firstCall.args[1]).to.be.a('string');
      expect(server.tool.firstCall.args[2]).to.be.an('object');
      expect(server.tool.firstCall.args[3]).to.be.a('function');
    });

    it('should build correct command with required parameters', async () => {
      herokuRepl.executeCommand.resolves('psql (14.9)\nType "help" for help.\n\nmyapp::DATABASE=> ');

      await toolCallback({ app: 'myapp' });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(
        `${TOOL_COMMAND_MAP.PG_PSQL} --app=myapp --command=""`
      );
    });

    it('should build correct command with all parameters', async () => {
      herokuRepl.executeCommand.resolves('Query executed successfully\n');

      await toolCallback({
        app: 'myapp',
        command: 'SELECT * FROM users',
        file: 'query.sql',
        credential: 'mycred',
        database: 'HEROKU_POSTGRESQL_RED'
      });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(
        `${TOOL_COMMAND_MAP.PG_PSQL} --app=myapp --command="SELECT * FROM users" --file=query.sql --credential=mycred -- HEROKU_POSTGRESQL_RED`
      );
    });

    it('should handle error response', async () => {
      const errorResponse = '<<<ERROR>>>\nError: Database not found\n<<<END ERROR>>>\n';
      herokuRepl.executeCommand.resolves(errorResponse);

      const result = await toolCallback({ app: 'myapp' });
      expect(result).to.deep.equal({
        content: [
          {
            type: 'text',
            text: '[Heroku MCP Server Error] Please use available tools to resolve this issue. Ignore any Heroku CLI command suggestions that may be provided in the command output or error details. Details:\n<<<ERROR>>>\nError: Database not found\n<<<END ERROR>>>\n'
          }
        ],
        isError: true
      });
    });
  });

  describe('pg:info', () => {
    beforeEach(() => {
      registerPgInfoTool(server, herokuRepl);
    });

    it('should register the tool with correct parameters', () => {
      expect(server.tool.calledOnce).to.be.true;
      expect(server.tool.firstCall.args[0]).to.equal('pg_info');
      expect(server.tool.firstCall.args[1]).to.be.a('string');
      expect(server.tool.firstCall.args[2]).to.be.an('object');
      expect(server.tool.firstCall.args[3]).to.be.a('function');
    });

    it('should build correct command with required parameters', async () => {
      const successResponse =
        '=== DATABASE_URL\nPlan:                  Hobby-dev\nStatus:                Available\nConnections:           0/20\nPG Version:            14.9\n';
      herokuRepl.executeCommand.resolves(successResponse);

      await toolCallback({ app: 'myapp' });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(`${TOOL_COMMAND_MAP.PG_INFO} --app=myapp`);
    });

    it('should build correct command with database parameter', async () => {
      const successResponse =
        '=== HEROKU_POSTGRESQL_RED\nPlan:                  Standard-0\nStatus:                Available\n';
      herokuRepl.executeCommand.resolves(successResponse);

      await toolCallback({ app: 'myapp', database: 'HEROKU_POSTGRESQL_RED' });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(
        `${TOOL_COMMAND_MAP.PG_INFO} --app=myapp -- HEROKU_POSTGRESQL_RED`
      );
    });

    it('should handle error response', async () => {
      const errorResponse = '<<<ERROR>>>\nError: Database not found\n<<<END ERROR>>>\n';
      herokuRepl.executeCommand.resolves(errorResponse);

      const result = await toolCallback({ app: 'myapp' });
      expect(result).to.deep.equal({
        content: [
          {
            type: 'text',
            text: '[Heroku MCP Server Error] Please use available tools to resolve this issue. Ignore any Heroku CLI command suggestions that may be provided in the command output or error details. Details:\n<<<ERROR>>>\nError: Database not found\n<<<END ERROR>>>\n'
          }
        ],
        isError: true
      });
    });
  });

  describe('pg:ps', () => {
    beforeEach(() => {
      registerPgPsTool(server, herokuRepl);
    });

    it('should register the tool with correct parameters', () => {
      expect(server.tool.calledOnce).to.be.true;
      expect(server.tool.firstCall.args[0]).to.equal('pg_ps');
      expect(server.tool.firstCall.args[1]).to.be.a('string');
      expect(server.tool.firstCall.args[2]).to.be.an('object');
      expect(server.tool.firstCall.args[3]).to.be.a('function');
    });

    it('should build correct command with required parameters', async () => {
      const successResponse =
        ' pid | state | source | running_for | waiting | query\n-----+-------+--------+-------------+---------+-------\n';
      herokuRepl.executeCommand.resolves(successResponse);

      await toolCallback({ app: 'myapp' });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(`${TOOL_COMMAND_MAP.PG_PS} --app=myapp`);
    });

    it('should build correct command with all parameters', async () => {
      const successResponse =
        ' pid | state | source | running_for | waiting | query | memory\n-----+-------+--------+-------------+---------+-------+--------\n';
      herokuRepl.executeCommand.resolves(successResponse);

      await toolCallback({
        app: 'myapp',
        verbose: true,
        database: 'HEROKU_POSTGRESQL_RED'
      });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(
        `${TOOL_COMMAND_MAP.PG_PS} --app=myapp --verbose -- HEROKU_POSTGRESQL_RED`
      );
    });

    it('should handle error response', async () => {
      const errorResponse = '<<<ERROR>>>\nError: Database not found\n<<<END ERROR>>>\n';
      herokuRepl.executeCommand.resolves(errorResponse);

      const result = await toolCallback({ app: 'myapp' });
      expect(result).to.deep.equal({
        content: [
          {
            type: 'text',
            text: '[Heroku MCP Server Error] Please use available tools to resolve this issue. Ignore any Heroku CLI command suggestions that may be provided in the command output or error details. Details:\n<<<ERROR>>>\nError: Database not found\n<<<END ERROR>>>\n'
          }
        ],
        isError: true
      });
    });
  });

  describe('pg:kill', () => {
    beforeEach(() => {
      registerPgKillTool(server, herokuRepl);
    });

    it('should register the tool with correct parameters', () => {
      expect(server.tool.calledOnce).to.be.true;
      expect(server.tool.firstCall.args[0]).to.equal('pg_kill');
      expect(server.tool.firstCall.args[1]).to.be.a('string');
      expect(server.tool.firstCall.args[2]).to.be.an('object');
      expect(server.tool.firstCall.args[3]).to.be.a('function');
    });

    it('should build correct command with required parameters', async () => {
      const successResponse = 'Terminating process 12345... done\n';
      herokuRepl.executeCommand.resolves(successResponse);

      await toolCallback({ app: 'myapp', pid: 12345 });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(`${TOOL_COMMAND_MAP.PG_KILL} --app=myapp -- 12345`);
    });

    it('should build correct command with all parameters', async () => {
      const successResponse = 'Terminating process 12345... done\n';
      herokuRepl.executeCommand.resolves(successResponse);

      await toolCallback({
        app: 'myapp',
        pid: 12345,
        force: true,
        database: 'HEROKU_POSTGRESQL_RED'
      });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(
        `${TOOL_COMMAND_MAP.PG_KILL} --app=myapp --force -- 12345 HEROKU_POSTGRESQL_RED`
      );
    });

    it('should handle error response', async () => {
      const errorResponse = '<<<ERROR>>>\nError: Process not found\n<<<END ERROR>>>\n';
      herokuRepl.executeCommand.resolves(errorResponse);

      const result = await toolCallback({ app: 'myapp', pid: 12345 });
      expect(result).to.deep.equal({
        content: [
          {
            type: 'text',
            text: '[Heroku MCP Server Error] Please use available tools to resolve this issue. Ignore any Heroku CLI command suggestions that may be provided in the command output or error details. Details:\n<<<ERROR>>>\nError: Process not found\n<<<END ERROR>>>\n'
          }
        ],
        isError: true
      });
    });
  });

  describe('pg:backups', () => {
    beforeEach(() => {
      registerPgBackupsTool(server, herokuRepl);
    });

    it('should register the tool with correct parameters', () => {
      expect(server.tool.calledOnce).to.be.true;
      expect(server.tool.firstCall.args[0]).to.equal('pg_backups');
      expect(server.tool.firstCall.args[1]).to.be.a('string');
      expect(server.tool.firstCall.args[2]).to.be.an('object');
      expect(server.tool.firstCall.args[3]).to.be.a('function');
    });

    it('should build correct command with required parameters', async () => {
      const successResponse =
        '=== Backups\nID    Created at                 Status                               Size     Database\n────  ─────────────────────────  ───────────────────────────────────  ───────  ────────\nb001  2024-01-01 00:00:00 +0000  Completed 2024-01-01 00:01:00 +0000  20.3 MB  DATABASE_URL\n';
      herokuRepl.executeCommand.resolves(successResponse);

      await toolCallback({ app: 'myapp' });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(`${TOOL_COMMAND_MAP.PG_BACKUPS} --app=myapp`);
    });

    it('should build correct command with all parameters', async () => {
      const successResponse = 'Scheduling automatic daily backups at 00:00 America/New_York... done\n';
      herokuRepl.executeCommand.resolves(successResponse);

      await toolCallback({
        app: 'myapp',
        verbose: true,
        at: '00:00 America/New_York',
        output: 'json',
        'wait-interval': '5',
        quiet: true
      });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(`${TOOL_COMMAND_MAP.PG_BACKUPS} --app=myapp`);
    });

    it('should handle error response', async () => {
      const errorResponse = '<<<ERROR>>>\nError: No backups found\n<<<END ERROR>>>\n';
      herokuRepl.executeCommand.resolves(errorResponse);

      const result = await toolCallback({ app: 'myapp' });
      expect(result).to.deep.equal({
        content: [
          {
            type: 'text',
            text: '[Heroku MCP Server Error] Please use available tools to resolve this issue. Ignore any Heroku CLI command suggestions that may be provided in the command output or error details. Details:\n<<<ERROR>>>\nError: No backups found\n<<<END ERROR>>>\n'
          }
        ],
        isError: true
      });
    });
  });

  describe('pg:upgrade', () => {
    beforeEach(() => {
      registerPgUpgradeTool(server, herokuRepl);
    });

    it('should register the tool with correct parameters', () => {
      expect(server.tool.calledOnce).to.be.true;
      expect(server.tool.firstCall.args[0]).to.equal('pg_upgrade');
      expect(server.tool.firstCall.args[1]).to.be.a('string');
      expect(server.tool.firstCall.args[2]).to.be.an('object');
      expect(server.tool.firstCall.args[3]).to.be.a('function');
    });

    it('should build correct command with required parameters', async () => {
      const successResponse = 'Starting upgrade of DATABASE_URL to PostgreSQL 14... done\n';
      herokuRepl.executeCommand.resolves(successResponse);

      await toolCallback({ app: 'myapp' });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(`${TOOL_COMMAND_MAP.PG_UPGRADE} --app=myapp`);
    });

    it('should build correct command with all parameters', async () => {
      const successResponse = 'Starting upgrade of HEROKU_POSTGRESQL_RED to PostgreSQL 14... done\n';
      herokuRepl.executeCommand.resolves(successResponse);

      await toolCallback({
        app: 'myapp',
        version: '14',
        confirm: 'myapp',
        database: 'HEROKU_POSTGRESQL_RED'
      });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(
        `${TOOL_COMMAND_MAP.PG_UPGRADE} --app=myapp --version=14 --confirm=myapp -- HEROKU_POSTGRESQL_RED`
      );
    });

    it('should handle error response', async () => {
      const errorResponse = '<<<ERROR>>>\nError: Database is already at version 14\n<<<END ERROR>>>\n';
      herokuRepl.executeCommand.resolves(errorResponse);

      const result = await toolCallback({ app: 'myapp' });
      expect(result).to.deep.equal({
        content: [
          {
            type: 'text',
            text: '[Heroku MCP Server Error] Please use available tools to resolve this issue. Ignore any Heroku CLI command suggestions that may be provided in the command output or error details. Details:\n<<<ERROR>>>\nError: Database is already at version 14\n<<<END ERROR>>>\n'
          }
        ],
        isError: true
      });
    });

    it('should handle undefined response', async () => {
      herokuRepl.executeCommand.resolves(undefined);

      const result = await toolCallback({ app: 'myapp' });
      expect(result).to.deep.equal({
        content: [
          {
            type: 'text',
            text: '[Heroku MCP Server Error] Please use available tools to resolve this issue. Ignore any Heroku CLI command suggestions that may be provided in the command output or error details. Details:\nNo response from command'
          }
        ],
        isError: true
      });
    });
  });
});

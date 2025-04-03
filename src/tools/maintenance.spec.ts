import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { HerokuREPL } from '../repl/heroku-cli-repl.js';
import { TOOL_COMMAND_MAP } from '../utils/tool-commands.js';
import { registerMaintenanceOnTool, registerMaintenanceOffTool } from './maintenance.js';
import { expect } from 'chai';
import sinon from 'sinon';

describe('Maintenance Tools', () => {
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

  describe('maintenance:on', () => {
    beforeEach(() => {
      registerMaintenanceOnTool(server, herokuRepl);
    });

    it('should register the tool with correct parameters', () => {
      expect(server.tool.calledOnce).to.be.true;
      expect(server.tool.firstCall.args[0]).to.equal('maintenance_on');
      expect(server.tool.firstCall.args[1]).to.be.a('string');
      expect(server.tool.firstCall.args[2]).to.be.an('object');
      expect(server.tool.firstCall.args[3]).to.be.a('function');
    });

    it('should build correct command with required parameters', async () => {
      herokuRepl.executeCommand.resolves('Enabling maintenance mode for myapp... done\n');

      await toolCallback({ app: 'myapp' });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(`${TOOL_COMMAND_MAP.MAINTENANCE_ON} --app=myapp`);
    });

    it('should handle successful response', async () => {
      const successResponse = 'Enabling maintenance mode for myapp... done\n';
      herokuRepl.executeCommand.resolves(successResponse);

      const result = await toolCallback({ app: 'myapp' });
      expect(result).to.deep.equal({
        content: [{ type: 'text', text: 'Enabling maintenance mode for myapp... done\n' }]
      });
    });

    it('should handle error response', async () => {
      const errorResponse = '<<<ERROR>>>\nError: App not found\n<<<END ERROR>>>\n';
      herokuRepl.executeCommand.resolves(errorResponse);

      const result = await toolCallback({ app: 'myapp' });
      expect(result).to.deep.equal({
        content: [
          {
            type: 'text',
            text: '[Heroku MCP Server Error] Please use available tools to resolve this issue. Ignore any Heroku CLI command suggestions that may be provided in the command output or error details. Details:\n<<<ERROR>>>\nError: App not found\n<<<END ERROR>>>\n'
          }
        ],
        isError: true
      });
    });
  });

  describe('maintenance:off', () => {
    beforeEach(() => {
      registerMaintenanceOffTool(server, herokuRepl);
    });

    it('should register the tool with correct parameters', () => {
      expect(server.tool.calledOnce).to.be.true;
      expect(server.tool.firstCall.args[0]).to.equal('maintenance_off');
      expect(server.tool.firstCall.args[1]).to.be.a('string');
      expect(server.tool.firstCall.args[2]).to.be.an('object');
      expect(server.tool.firstCall.args[3]).to.be.a('function');
    });

    it('should build correct command with required parameters', async () => {
      herokuRepl.executeCommand.resolves('Disabling maintenance mode for myapp... done\n');

      await toolCallback({ app: 'myapp' });
      expect(herokuRepl.executeCommand.calledOnce).to.be.true;
      expect(herokuRepl.executeCommand.firstCall.args[0]).to.equal(`${TOOL_COMMAND_MAP.MAINTENANCE_OFF} --app=myapp`);
    });

    it('should handle successful response', async () => {
      const successResponse = 'Disabling maintenance mode for myapp... done\n';
      herokuRepl.executeCommand.resolves(successResponse);

      const result = await toolCallback({ app: 'myapp' });
      expect(result).to.deep.equal({
        content: [{ type: 'text', text: 'Disabling maintenance mode for myapp... done\n' }]
      });
    });

    it('should handle error response', async () => {
      const errorResponse = '<<<ERROR>>>\nError: App not found\n<<<END ERROR>>>\n';
      herokuRepl.executeCommand.resolves(errorResponse);

      const result = await toolCallback({ app: 'myapp' });
      expect(result).to.deep.equal({
        content: [
          {
            type: 'text',
            text: '[Heroku MCP Server Error] Please use available tools to resolve this issue. Ignore any Heroku CLI command suggestions that may be provided in the command output or error details. Details:\n<<<ERROR>>>\nError: App not found\n<<<END ERROR>>>\n'
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

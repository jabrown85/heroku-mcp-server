import { expect } from 'chai';
import sinon from 'sinon';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { HerokuREPL } from '../repl/heroku-cli-repl.js';
import { listPrivateSpacesOptionsSchema, registerListPrivateSpacesTool } from './spaces.js';
import { CommandBuilder } from '../utils/command-builder.js';
import { TOOL_COMMAND_MAP } from '../utils/tool-commands.js';

describe('spaces topic tools', () => {
  describe('registerListPrivateSpacesTool', () => {
    let server: sinon.SinonStubbedInstance<McpServer>;
    let herokuRepl: sinon.SinonStubbedInstance<HerokuREPL>;
    let toolCallback: Function;

    beforeEach(() => {
      server = sinon.createStubInstance(McpServer);
      herokuRepl = sinon.createStubInstance(HerokuREPL);

      // Capture the callback function when tool is registered
      server.tool.callsFake((_name, _description, _schema, callback) => {
        toolCallback = callback;
        return server;
      });

      registerListPrivateSpacesTool(server, herokuRepl);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('registers the tool with correct name and schema', () => {
      expect(server.tool.calledOnce).to.be.true;
      const call = server.tool.getCall(0);
      expect(call.args[0]).to.equal('list_private_spaces');
      expect(call.args[2]).to.deep.equal(listPrivateSpacesOptionsSchema.shape);
    });

    it('executes command successfully with json flag', async () => {
      const expectedOutput = '{"spaces": []}';
      const expectedCommand = new CommandBuilder(TOOL_COMMAND_MAP.LIST_PRIVATE_SPACES).addFlags({ json: true }).build();

      herokuRepl.executeCommand.resolves(expectedOutput);

      const result = await toolCallback({ json: true }, {});
      expect(herokuRepl.executeCommand.calledOnceWith(expectedCommand)).to.be.true;
      expect(result).to.deep.equal({
        content: [{ type: 'text', text: expectedOutput }]
      });
    });

    it('executes command successfully without json flag', async () => {
      const expectedOutput = 'No spaces found';
      const expectedCommand = new CommandBuilder(TOOL_COMMAND_MAP.LIST_PRIVATE_SPACES)
        .addFlags({ json: false })
        .build();

      herokuRepl.executeCommand.resolves(expectedOutput);

      const result = await toolCallback({ json: false }, {});
      expect(herokuRepl.executeCommand.calledOnceWith(expectedCommand)).to.be.true;
      expect(result).to.deep.equal({
        content: [{ type: 'text', text: expectedOutput }]
      });
    });

    it('handles CLI errors properly', async () => {
      const errorMessage = 'API error';
      const error = new Error(errorMessage);
      herokuRepl.executeCommand.rejects(error);

      const result = await toolCallback({}, {});
      expect(result).to.deep.equal({
        isError: true,
        content: [
          {
            type: 'text',
            text:
              '[Heroku MCP Server Error] Please use available tools to resolve this issue. ' +
              'Ignore any Heroku CLI command suggestions that may be provided in the error details. ' +
              `Details: ${errorMessage}`
          }
        ]
      });
    });
  });
});

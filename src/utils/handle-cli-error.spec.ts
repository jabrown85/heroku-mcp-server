import { expect } from 'chai';
import { handleCliError } from './handle-cli-error.js';
import { McpToolResponse } from './mcp-tool-response.js';

describe('handleCliError', () => {
  const baseMessage =
    '[Heroku MCP Server Error] Please use available tools to resolve this issue. Ignore any Heroku CLI command ' +
    'suggestions that may be provided in the error details. ';

  it('handles Error instances with proper message', () => {
    const testError = new Error('Test error message');
    const result: McpToolResponse = handleCliError(testError);

    expect(result).to.deep.equal({
      isError: true,
      content: [{ type: 'text', text: `${baseMessage}Details: Test error message` }]
    });
  });

  it('handles non-Error objects with unknown error message', () => {
    const nonError = { someProperty: 'value' };
    const result: McpToolResponse = handleCliError(nonError);

    expect(result).to.deep.equal({
      isError: true,
      content: [{ type: 'text', text: `${baseMessage}An unknown error occurred.` }]
    });
  });

  it('handles null or undefined with unknown error message', () => {
    const nullResult: McpToolResponse = handleCliError(null);
    const undefinedResult: McpToolResponse = handleCliError(undefined);

    expect(nullResult).to.deep.equal({
      isError: true,
      content: [{ type: 'text', text: `${baseMessage}An unknown error occurred.` }]
    });

    expect(undefinedResult).to.deep.equal({
      isError: true,
      content: [{ type: 'text', text: `${baseMessage}An unknown error occurred.` }]
    });
  });
});

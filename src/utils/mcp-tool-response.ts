/**
 * Interface representing the standard response format for MCP tool operations.
 * This interface defines the structure of responses returned by tool handlers.
 *
 * [x: string] - Additional properties that may be present in the response
 *
 * [isError] - Indicates whether the operation resulted in an error
 *
 * content - Array containing the response content
 * in a standardized format
 */
export type McpToolResponse = {
  [x: string]: unknown;
  isError?: boolean;
  content: Array<{
    type: 'text';
    text: string;
  }>;
};

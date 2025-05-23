/**
 * A builder class for constructing Heroku CLI commands with flags and positional arguments.
 * This class provides a fluent interface for building command-line arguments in a structured way.
 */
export class CommandBuilder {
  private baseCommand: string;
  private flags: string[] = [];
  private args: string[] = [];

  /**
   * Creates a new CommandBuilder instance.
   *
   * @param baseCommand - The base Heroku CLI command to execute (e.g., 'apps', 'apps:create')
   */
  public constructor(baseCommand: string) {
    this.baseCommand = baseCommand;
  }

  /**
   * Adds command-line flags to the command.
   *
   * @param flags - An object containing flag names and their values. Boolean flags are added without values,
   * while string flags are added with their values.
   * @returns The builder instance for method chaining
   */
  public addFlags(flags: Record<string, boolean | string | undefined>): this {
    for (const [flag, value] of Object.entries(flags)) {
      if (value) {
        if (typeof value === 'boolean') this.flags.push(`--${flag}`);
        else this.flags.push(`--${flag}=${value}`);
      }
    }
    return this;
  }

  /**
   * Adds positional arguments to the command.
   *
   * @param args - An object containing argument names and their values. Only values are used in the final command.
   * @returns The builder instance for method chaining
   */
  public addPositionalArguments(args: Record<string, string | undefined>): this {
    for (const [, value] of Object.entries(args)) {
      if (value) this.args.push(value);
    }
    return this;
  }

  /**
   * Builds and returns the complete command string.
   *
   * @returns A string representing the command with all flags and arguments
   */
  public build(): string {
    let command = this.baseCommand;
    if (this.flags.length > 0) command += ` ${this.flags.join(' ')}`;
    if (this.args.length > 0) command += ` -- ${this.args.join(' ')}`;
    return command;
  }
}

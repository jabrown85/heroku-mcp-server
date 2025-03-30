/**
 * Build a command string with flags and arguments
 *
 * @param command the command to run
 * @param flags the flags to pass to the command
 * @param args the arguments to pass to the command
 * @returns the command string to run
 */
export function commandBuilder(
  command: string,
  flags: Record<string, string | boolean | string[]>,
  args?: string[]
): string {
  const flagsArray = Object.entries(flags).map(([key, value]) => {
    if (typeof value === 'boolean') {
      return value ? `--${key}` : '';
    } else if (Array.isArray(value)) {
      return value.map((v) => `--${key} ${v}`).join(' ');
    } else {
      return `--${key} ${value}`;
    }
  });
  return `${command} ${(args ?? []).join(' ')} ${(flagsArray || []).join(' ')}`;
}

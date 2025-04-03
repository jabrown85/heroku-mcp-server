/**
 * Maps tool names to their corresponding Heroku CLI commands.
 * This mapping ensures consistent command usage across the application.
 */
export const TOOL_COMMAND_MAP = {
  // App-related commands
  LIST_APPS: 'apps',
  CREATE_APP: 'apps:create',
  RENAME_APP: 'apps:rename',
  TRANSFER_APP: 'apps:transfer',
  GET_APP_INFO: 'apps:info',

  // Space-related commands
  LIST_PRIVATE_SPACES: 'spaces',

  // Team-related commands
  LIST_TEAMS: 'teams',

  // Addons commands
  LIST_ADDONS: 'addons',
  GET_ADDON_INFO: 'addons:info',
  CREATE_ADDON: 'addons:create',
  LIST_ADDON_SERVICES: 'addons:services',
  LIST_ADDON_PLANS: 'addons:plans'
} as const;

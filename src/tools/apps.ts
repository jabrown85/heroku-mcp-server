import { z } from 'zod';

export const herokuAppsFlags = {
  all: z.boolean().optional().describe('include apps in all teams'),

  json: z.boolean().optional().describe('output in json format'),

  space: z.string().optional().describe('filter by space'),

  personal: z.boolean().optional().describe('list apps in personal account when a default team is set'),

  'internal-routing': z.boolean().optional().describe('filter to Internal Web Apps'),

  team: z.string().optional().describe('team to use')
};

export type HerokuAppsFlags = typeof herokuAppsFlags;

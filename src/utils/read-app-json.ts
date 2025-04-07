import path from 'node:path';
import fs from 'node:fs/promises';
import { Validator } from 'jsonschema';

/**
 * Retrieves the app.json. This file must be in the
 * root of the workspace and must be valid.
 *
 * @param workspaceRootUri The workspace uri to retrieve the file from
 * @param appJsonFile The app.json file to read
 * @returns The typed app.json as an object
 * @throws {Error} If the app.json cannot be read or is invalid
 */
export async function readAppJson(workspaceRootUri: string, appJsonFile?: Uint8Array): Promise<AppJson> {
  const appJsonUri = path.join(workspaceRootUri, 'app.json');
  let appJsonBytes: Uint8Array | undefined = appJsonFile;
  if (!appJsonFile) {
    try {
      await fs.stat(appJsonUri);
    } catch {
      throw new Error(`Cannot find app.json file at ${appJsonUri}`);
    }
    appJsonBytes = await fs.readFile(appJsonUri);
  }

  let appJson: AppJson;
  try {
    appJson = JSON.parse(Buffer.from(appJsonBytes!).toString()) as AppJson;
  } catch (e) {
    throw new Error(`Cannot parse the app.json file: ${(e as Error).message}`);
  }
  const validator = new Validator();
  const schema = await import('./app-json.schema.json', { with: { type: 'json' } });

  const result = validator.validate(appJson, schema.default);
  if (!result.valid) {
    throw new Error(`Invalid app.json file: ${result.errors.map((e) => e.message).join(', ')}`);
  }
  return appJson;
}
/**
 * Represents the root configuration for a Heroku application.
 * This schema defines the structure of an app.json file which is used to
 * configure Heroku applications for deployment and review apps.
 */
export type AppJson = {
  name?: string;
  description?: string;
  keywords?: string[];
  website?: string;
  repository?: string;
  logo?: string;
  success_url?: string;
  scripts?: Scripts;
  env?: EnvironmentVariables;
  formation?: Formation;
  addons?: Addon[];
  buildpacks?: Buildpack[];
  environments?: Environments;
  stack?: HerokuStack;
  image?: string;
};

/**
 * Defines scripts that run at specific lifecycle events during deployment.
 */
export type Scripts = {
  postdeploy?: string;
  'pr-predestroy'?: string;
};

/**
 * Represents a single environment variable configuration.
 */
export type EnvironmentVariable = {
  description?: string;
  value?: string;
  required?: boolean;
  generator?: 'secret';
};

/**
 * Maps environment variable names to their configurations.
 */
export type EnvironmentVariables = {
  [key: string]: EnvironmentVariable;
};

/**
 * Defines the configuration for a specific process type in the application.
 */
export type DynoFormation = {
  quantity: number;
  size?: DynoSize;
};

/**
 * Maps process types to their dyno formations.
 */
export type Formation = {
  [key: string]: DynoFormation;
};

/**
 * Represents the available dyno sizes in Heroku.
 */
export type DynoSize =
  | 'free'
  | 'eco'
  | 'hobby'
  | 'basic'
  | 'standard-1x'
  | 'standard-2x'
  | 'performance-m'
  | 'performance-l'
  | 'private-s'
  | 'private-m'
  | 'private-l'
  | 'shield-s'
  | 'shield-m'
  | 'shield-l';

/**
 * Detailed configuration for a Heroku addon.
 */
export type AddonConfig = {
  plan: string;
  as?: string;
  options?: Record<string, unknown>;
};

/**
 * Represents a Heroku addon.
 */
export type Addon = string | AddonConfig;

/**
 * Defines a buildpack configuration for the application.
 */
export type Buildpack = {
  url: string;
};

/**
 * Base configuration for different environments.
 */
export type EnvironmentConfig = {
  env?: EnvironmentVariables;
  formation?: Formation;
  addons?: Addon[];
  buildpacks?: Buildpack[];
};

/**
 * Configuration specific to test environments.
 */
export type TestEnvironment = EnvironmentConfig & {
  scripts?: {
    test?: string;
  };
};

/**
 * Contains environment-specific configurations.
 */
export type Environments = {
  test?: TestEnvironment;
  review?: EnvironmentConfig;
  production?: EnvironmentConfig;
};

/**
 * Represents the available Heroku stack versions.
 */
export type HerokuStack = 'heroku-18' | 'heroku-20' | 'heroku-22' | 'heroku-24';

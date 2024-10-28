// From https://github.com/pnd280/complexity/blob/alpha/vite-plugins/vite-plugin-run-command-on-demand.ts

import chalk from "chalk";
import { exec } from "child_process";


const pluginName = "vite-plugin-run-command-on-demand";

/**
 * Logs a message with the plugin name.
 * @param {string} message - The message to log.
 */
const log = (message) => console.log(chalk.blue(`\n[${pluginName}]`), message);

/**
 * Logs an error message with the plugin name.
 * @param {string} message - The error message to log.
 */
const logError = (message) =>
  console.error(chalk.blue(`\n[${pluginName}]`), chalk.red(message), "\n");

/**
 * Runs a shell command.
 * @param {string} command - The command to run.
 * @returns {Promise<void>} A promise that resolves when the command completes.
 */
const runCommand = (command) =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logError(`Error executing command: ${command}\n${stderr}`);
        reject(error);
      } else {
        log(`Command executed successfully: ${command}\n${stdout}`);
        resolve();
      }
    });
  });

/**
 * @typedef {Object} CustomCommandsPluginOptions
 * @property {string} [beforeServerStart] - Command to run before the server starts.
 * @property {string} [afterServerStart] - Command to run after the server starts.
 * @property {string} [onHotUpdate] - Command to run on hot update.
 * @property {string} [beforeBuild] - Command to run before the build starts.
 * @property {string} [afterBuild] - Command to run after the build ends.
 * @property {string} [closeBundle] - Command to run when the bundle is closed.
 */

/**
 * Executes a command if it is defined.
 * @param {string|undefined} command - The command to execute.
 * @param {string} errorMessage - The error message to log if the command fails.
 */
const executeCommand = async (command, errorMessage) => {
  if (command) {
    try {
      await runCommand(command);
    } catch {
      logError(errorMessage);
    }
  }
};

/**
 * Checks if the current environment is allowed.
 * @returns {boolean} True if the environment is "development" or "production".
 */
const isAllowedEnvironment = () => {
  const env = process.env.NODE_ENV;
  return env === "development" || env === "production";
};

/**
 * Vite plugin to run custom commands on demand.
 * @param {CustomCommandsPluginOptions} [options={}] - The plugin options.

 */
export default function customCommandsPlugin(options = {}) {
  return {
    name: pluginName,
    configureServer(server) {
      if (!isAllowedEnvironment()) return;
      server.httpServer?.once("listening", async () => {
        await executeCommand(
          options.beforeServerStart,
          `Error running beforeServerStart command: ${options.beforeServerStart}`
        );
        await executeCommand(
          options.afterServerStart,
          `Error running afterServerStart command: ${options.afterServerStart}`
        );
      });
    },
    async handleHotUpdate(ctx) {
      if (!isAllowedEnvironment()) return ctx.modules;
      const isPageReload = ctx.modules.some((module) => !module.isSelfAccepting);
      if (!isPageReload) {
        await executeCommand(
          options.onHotUpdate,
          `Error running onHotUpdate command: ${options.onHotUpdate}`
        );
      }
      return ctx.modules;
    },
    async buildStart() {
      if (!isAllowedEnvironment()) return;
      await executeCommand(
        options.beforeBuild,
        `Error running beforeBuild command: ${options.beforeBuild}`
      );
    },
    async buildEnd() {
      if (!isAllowedEnvironment()) return;
      await executeCommand(
        options.afterBuild,
        `Error running afterBuild command: ${options.afterBuild}`
      );
    },
    async closeBundle() {
      if (!isAllowedEnvironment()) return;
      await executeCommand(
        options.closeBundle,
        `Error running closeBundle command: ${options.closeBundle}`
      );
    },
  };
}
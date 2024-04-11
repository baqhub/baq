#!/usr/bin/env node
import {Command} from "@commander-js/extra-typings";
import finder from "find-package-json";
import {addCommand} from "./commands/addCommand.js";
import {initCommand} from "./commands/initCommand.js";
import {loginCommand} from "./commands/loginCommand.js";
import {logoutCommand} from "./commands/logoutCommand.js";
import {publishCommand} from "./commands/publishCommand.js";
import {removeCommand} from "./commands/removeCommand.js";
import {restoreCommand} from "./commands/restoreCommand.js";
import {watchCommand} from "./commands/watchCommand.js";
import metaToPaths from "./helpers/fs.js";

// Suppress experimental warnings.
process.removeAllListeners("warning");
process.on("warning", l => {
  if (l.name !== "ExperimentalWarning") {
    console.warn(l);
  }
});

// Find the CLI version.
const {directoryPath} = metaToPaths(import.meta);
const version = finder(directoryPath).next().value?.version || "0.0.0";

const program = new Command()
  .addHelpText(
    "before",
    "    _______  _______   _______  " +
      "\r\n  \u2571\u2571      \u2571 \u2571       \u2572\u2572\u2571       \u2572\u2572" +
      "\r\n \u2571\u2571       \u2572\u2571        \u2571\u2571        \u2571\u2571" +
      "\r\n\u2571         \u2571         \u2571\u2572__      \u2571 " +
      "\r\n\u2572________\u2571\u2572___\u2571____\u2571   \u2572_____\u2571  \r\n"
  )
  .name("baq")
  .description("CLI tool to manage BAQ types in your TypeScript project.")
  .version(version, "-v, --version")
  .option("-d, --debug", "print full errors and debug information");

export type Program = typeof program;

program
  .command("init")
  .description("initialize a new BAQ project")
  .argument("[folder]", "path to the project folder", ".")
  .action(folderPath => initCommand(program, folderPath));

program
  .command("add")
  .description("add a new record type to this project")
  .argument("<type>", "identity of the record type to add")
  .argument("[name]", "override the name of the record type")
  .action((type, name) => addCommand(program, type, name));

program
  .command("remove")
  .description("remove a record type from this project")
  .argument("<name>", "name of the record type to remove")
  .action(name => removeCommand(program, name));

program
  .command("watch")
  .description("re-generate project files on change")
  .action(() => watchCommand(program));

program
  .command("restore", {isDefault: true, hidden: true})
  .description("re-generate the project files")
  .action(() => restoreCommand(program));

program
  .command("login")
  .description("authenticate with a BAQ server")
  .argument("<entity>", "")
  .action(entity => loginCommand(program, entity));

program
  .command("logout")
  .description("clear local credentials")
  .action(() => logoutCommand(program));

program
  .command("publish")
  .description("upload the project local record types")
  .action(() => publishCommand(program));

program.parseAsync();

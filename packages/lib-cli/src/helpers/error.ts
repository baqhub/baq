import {CustomError} from "@baqhub/sdk";
import {Program} from "../index.js";

interface ProgramErrorOptions {
  code?: string;
  exitCode?: number;
}

export class ProgramError extends CustomError {
  constructor(
    public message: string,
    public options: ProgramErrorOptions = {}
  ) {
    super(message);
  }
}

export async function handleErrors(
  program: Program,
  worker: () => Promise<unknown>,
  genericError: string
): Promise<void> {
  try {
    await worker();
  } catch (error) {
    if (error instanceof ProgramError) {
      program.error(error.message, {
        code: error.options.code,
        exitCode: error.options.exitCode,
      });
    }

    if (program.opts().debug) {
      throw error;
    }

    program.error(genericError);
  }
}

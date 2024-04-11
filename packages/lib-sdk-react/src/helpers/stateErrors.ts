import {CustomError} from "@baqhub/sdk";

export class InvalidActionError extends CustomError {
  constructor(state: unknown, action: unknown) {
    super("Invalid action: " + JSON.stringify({state, action}));
  }
}

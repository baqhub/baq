/** Custom class to use when sub-classing Error. */
export class CustomError extends Error {
  constructor(message?: string) {
    // "Error" breaks the prototype chain here.
    super(message);

    // Restore it.
    const actualPrototype = new.target.prototype;
    Object.setPrototypeOf(this, actualPrototype);
  }
}

export class ErrorWithData extends CustomError {
  constructor(
    message: string,
    public data: Record<string, unknown>
  ) {
    super(message);
  }
}

export function never(): never {
  throw new Error("This should never happen.");
}

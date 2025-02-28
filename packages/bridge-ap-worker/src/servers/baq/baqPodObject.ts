import {DurableObject} from "cloudflare:workers";

export class BaqPodObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async initialize(entity: string) {}

  async fetch(request: Request) {
    return new Response("Hello, World!");
  }
}

export interface PodIdStore {
  get(entity: string): Promise<string | undefined>;
}

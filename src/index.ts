import { z } from "zod";

export interface ZtorageOptions<S extends z.ZodRawShape> {
  schema: z.ZodObject<S>;
  onGetItem(key: keyof S): Promise<string | null>;
  onSetItem(key: keyof S, value: string): Promise<void>;
  onRemoveItem(key: keyof S): Promise<void>;
}

export default class Ztorage<S extends z.ZodRawShape> {
  private schema: ZtorageOptions<S>["schema"];
  private onGetItem: ZtorageOptions<S>["onGetItem"];
  private onSetItem: ZtorageOptions<S>["onSetItem"];
  private onRemoveItem: ZtorageOptions<S>["onRemoveItem"];

  constructor(options: ZtorageOptions<S>) {
    this.schema = options.schema;
    this.onSetItem = options.onSetItem;
    this.onGetItem = options.onGetItem;
    this.onRemoveItem = options.onRemoveItem;
  }

  async getItem<K extends keyof S>(key: K): Promise<z.infer<S[K]> | null> {
    const item = await this.onGetItem(key);

    if (
      item === null ||
      item === "null" ||
      item === undefined ||
      item === "undefined"
    ) {
      return null;
    }

    const parsedItem = JSON.parse(item as string);
    const validatedItem = await this.schema.shape[key].parseAsync(parsedItem);

    return validatedItem;
  }

  async setItem<K extends keyof S>(key: K, value: z.input<S[K]>) {
    const parsedValue = await this.schema.shape[key].parseAsync(value);
    const stringValue = JSON.stringify(parsedValue);

    this.onSetItem(key, stringValue);
  }

  async removeItem<K extends keyof S>(key: K) {
    await this.onRemoveItem(key);
  }
}

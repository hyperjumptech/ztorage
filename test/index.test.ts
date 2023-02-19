import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import Ztorage from "../src";

const testSchema = z.object({
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
  object: z.object({
    key1: z.string(),
    key2: z.number(),
  }),
  array: z.array(z.string()),
});

describe("Ztorage", () => {
  it("should call onGetItem and return parsed string value", async () => {
    const onGetItemMock = vi.fn();

    const storage = new Ztorage({
      schema: testSchema,
      onGetItem: onGetItemMock,
      onSetItem: vi.fn(),
      onRemoveItem: vi.fn(),
    });

    onGetItemMock.mockResolvedValueOnce(JSON.stringify("string"));
    const stringValue = await storage.getItem("string");
    expect(onGetItemMock).toHaveBeenCalledWith("string");
    expect(stringValue).toStrictEqual("string");

    onGetItemMock.mockResolvedValueOnce(JSON.stringify(123456789));
    const numberValue = await storage.getItem("number");
    expect(onGetItemMock).toHaveBeenCalledWith("number");
    expect(numberValue).toStrictEqual(123456789);

    onGetItemMock.mockResolvedValueOnce(JSON.stringify(false));
    const booleanValue = await storage.getItem("boolean");
    expect(onGetItemMock).toHaveBeenCalledWith("boolean");
    expect(booleanValue).toStrictEqual(false);

    onGetItemMock.mockResolvedValueOnce(
      JSON.stringify({ key1: "string", key2: 123456789 })
    );
    const objectValue = await storage.getItem("object");
    expect(onGetItemMock).toHaveBeenCalledWith("object");
    expect(objectValue).toStrictEqual({ key1: "string", key2: 123456789 });

    onGetItemMock.mockResolvedValueOnce(JSON.stringify(["string", "string"]));
    const arrayValue = await storage.getItem("array");
    expect(onGetItemMock).toHaveBeenCalledWith("array");
    expect(arrayValue).toStrictEqual(["string", "string"]);

    onGetItemMock.mockResolvedValueOnce(JSON.stringify(null));
    const nullValue = await storage.getItem("string");
    expect(onGetItemMock).toHaveBeenCalledWith("string");
    expect(nullValue).toStrictEqual(null);
  });

  it("should call onSetItem with parsed and stringified value", async () => {
    const onSetItemMock = vi.fn();

    const storage = new Ztorage({
      schema: testSchema,
      onGetItem: vi.fn(),
      onSetItem: onSetItemMock,
      onRemoveItem: vi.fn(),
    });

    await storage.setItem("string", "string");
    expect(onSetItemMock).toHaveBeenCalledWith(
      "string",
      JSON.stringify("string")
    );

    await storage.setItem("number", 123456789);
    expect(onSetItemMock).toHaveBeenCalledWith(
      "number",
      JSON.stringify(123456789)
    );

    await storage.setItem("object", { key1: "string", key2: 123456789 });
    expect(onSetItemMock).toHaveBeenCalledWith(
      "object",
      JSON.stringify({ key1: "string", key2: 123456789 })
    );

    await storage.setItem("array", ["string", "string"]);
    expect(onSetItemMock).toHaveBeenCalledWith(
      "array",
      JSON.stringify(["string", "string"])
    );
  });

  it("should call onRemoveItem and remove the value for the given key", async () => {
    const onRemoveItem = vi.fn();

    const storage = new Ztorage({
      schema: testSchema,
      onGetItem: vi.fn(),
      onSetItem: vi.fn(),
      onRemoveItem: onRemoveItem,
    });

    await storage.removeItem("string");
    expect(onRemoveItem).toHaveBeenCalledWith("string");

    await storage.removeItem("number");
    expect(onRemoveItem).toHaveBeenCalledWith("number");

    await storage.removeItem("object");
    expect(onRemoveItem).toHaveBeenCalledWith("object");

    await storage.removeItem("array");
    expect(onRemoveItem).toHaveBeenCalledWith("array");
  });
});

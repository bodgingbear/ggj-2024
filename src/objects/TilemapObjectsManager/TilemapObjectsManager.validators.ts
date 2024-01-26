import { z } from "zod";

type TiledObject = Phaser.Types.Tilemaps.TiledObject;

export interface TiledPlayerObject {
  x: number;
  y: number;
  sprite: "fat-kid" | "poor-kid" | "small-kid";
}

const PropertiesValidator = z.array(
  z.object({
    name: z.string(),
    type: z.string(),
    value: z.string(),
  }),
);

const PlayerValidator = z.object({
  x: z.number(),
  y: z.number(),
  type: z.literal("Player"),
  properties: z.object({
    sprite: z.union([z.literal("fat-kid"), z.literal("poor-kid"), z.literal("small-kid")]),
  }),
});

export function parseTiledPlayerObject(obj: TiledObject): TiledPlayerObject | null {
  const parsedProperties = PropertiesValidator.safeParse(obj.properties);
  if (!parsedProperties.success) {
    return null;
  }

  const propertiesObject = Object.fromEntries(parsedProperties.data.map((property) => [property.name, property.value]));
  const data = PlayerValidator.safeParse({
    ...obj,
    properties: propertiesObject,
  });

  if (!data.success) {
    return null;
  }

  return {
    x: data.data.x,
    y: data.data.y,
    sprite: data.data.properties.sprite,
  };
}

export function assertExistence<T>(value: T | null): asserts value is T {
  if (value === null) {
    throw new Error("Expected value to exist");
  }
}

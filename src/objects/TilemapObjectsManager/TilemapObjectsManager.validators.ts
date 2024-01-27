import { z } from "zod";
import { BasicSoldierOpts, SoldierAnimationName } from "../Soliders/BasicSoldier/BasicSoldier";
import { SickChildAnimationName } from "../SickChild/SickChild";

type TiledObject = Phaser.Types.Tilemaps.TiledObject;

export interface TiledPlayerObject {
  x: number;
  y: number;
  sprite: SickChildAnimationName;
}

export interface TiledBasicSoldierObject {
  x: number;
  y: number;
  options: BasicSoldierOpts;
  sprite: SoldierAnimationName;
}

const PropertiesValidator = z.array(
  z.object({
    name: z.string(),
    type: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]),
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

function parseProperties(properties: unknown) {
  const parsedProperties = PropertiesValidator.safeParse(properties);
  if (!parsedProperties.success) {
    return null;
  }

  const propertiesObject = Object.fromEntries(parsedProperties.data.map((property) => [property.name, property.value]));
  return propertiesObject;
}

export function parseTiledPlayerObject(obj: TiledObject): TiledPlayerObject | null {
  const data = PlayerValidator.safeParse({
    ...obj,
    properties: parseProperties(obj.properties),
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

const BasicSoldierValidator = z.object({
  x: z.number(),
  y: z.number(),
  type: z.literal("BasicSoldier"),
  properties: z.object({
    rotationRangeStart: z.number(),
    rotationRangeEnd: z.number(),
    shootInterval: z.number(),
    shootIntervalJitter: z.number(),
    bulletsInSeries: z.number(),
    rotationSpeed: z.number(),
    stopOnShoot: z.boolean(),
    sprite: z.literal("basic-soldier"),
  }),
});

export function parseBasicSoldier(obj: TiledObject): TiledBasicSoldierObject | null {
  const data = BasicSoldierValidator.safeParse({
    ...obj,
    properties: parseProperties(obj.properties),
  });

  if (!data.success) {
    return null;
  }

  const { rotationRangeStart, rotationRangeEnd, sprite, ...options } = data.data.properties;

  return {
    x: data.data.x,
    y: data.data.y,
    options: {
      ...options,
      rotationRange: [rotationRangeStart, rotationRangeEnd],
    },
    sprite,
  };
}

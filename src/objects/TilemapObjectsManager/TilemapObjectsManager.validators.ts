import { z } from "zod";
import { BasicSoldierOpts, SoldierAnimationName } from "../Soliders/BasicSoldier/BasicSoldier";
import { SickChildAnimationName, SickChildInitialDirection } from "../SickChild/SickChild";
import { SniperOpts } from "../Soliders/Sniper";

type TiledObject = Phaser.Types.Tilemaps.TiledObject;

export interface TiledPlayerObject {
  x: number;
  y: number;
  sprite: SickChildAnimationName;
  initialDirection: SickChildInitialDirection;
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
    sprite: z.union([z.literal("fat-kid"), z.literal("poor-kid"), z.literal("small-kid"), z.literal("girl")]),
    initialDirection: z.union([z.literal("up"), z.literal("down"), z.literal("left"), z.literal("right")]),
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
    initialDirection: data.data.properties.initialDirection,
  };
}

export interface TiledBasicSoldierObject {
  x: number;
  y: number;
  options: BasicSoldierOpts;
  sprite: SoldierAnimationName;
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
    startingRotation: z.number(),
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

export interface TiledColliderObject {
  x: number;
  y: number;
  width: number;
  height: number;
}
const ColliderValidator = z.object({
  x: z.number(),
  y: z.number(),
  height: z.number(),
  width: z.number(),
  type: z.literal("Collider"),
});

export function parseCollider(obj: TiledObject): TiledColliderObject | null {
  const data = ColliderValidator.safeParse({
    ...obj,
    properties: parseProperties(obj.properties),
  });

  if (!data.success) {
    return null;
  }

  return {
    x: data.data.x,
    y: data.data.y,
    height: data.data.height,
    width: data.data.width,
  };
}

export interface TiledSniperObject {
  x: number;
  y: number;
  options: SniperOpts;
  sprite: SoldierAnimationName;
}
const SniperValidator = z.object({
  x: z.number(),
  y: z.number(),
  type: z.literal("Sniper"),
  properties: z.object({
    rotationRangeStart: z.number(),
    rotationRangeEnd: z.number(),
    startingRotation: z.number(),
    rotationSpeed: z.number(),
    timeToShoot: z.number(),
    cooldown: z.number(),
    sprite: z.literal("basic-soldier"),
  }),
});

export function parseSniper(obj: TiledObject): TiledSniperObject | null {
  const data = SniperValidator.safeParse({
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

export interface TiledExitTriggerObject {
  x: number;
  y: number;
  width: number;
  height: number;
}
const ExitTriggerValidator = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  type: z.literal("ExitTrigger"),
});

export function parseExitTrigger(obj: TiledObject): TiledExitTriggerObject | null {
  const data = ExitTriggerValidator.safeParse({
    ...obj,
    properties: parseProperties(obj.properties),
  });

  if (!data.success) {
    return null;
  }

  return {
    x: data.data.x,
    y: data.data.y,
    width: data.data.width,
    height: data.data.height,
  };
}

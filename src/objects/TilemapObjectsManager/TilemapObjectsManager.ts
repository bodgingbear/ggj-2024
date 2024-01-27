import {
  TiledBasicSoldierObject,
  TiledColliderObject,
  TiledPlayerObject,
  parseBasicSoldier,
  parseCollider,
  parseTiledPlayerObject,
} from "./TilemapObjectsManager.validators";

export class TilemapObjectsManager {
  public players!: TiledPlayerObject[];
  public basicSoldiers!: TiledBasicSoldierObject[];
  public colliders!: TiledColliderObject[];

  constructor(private map: Phaser.Tilemaps.Tilemap) {
    const objects = this.map.getObjectLayerNames().flatMap((name) => this.map.getObjectLayer(name)?.objects ?? []);

    const { players, basicSoldiers, colliders } = this.processObjects(objects, {
      players: parseTiledPlayerObject,
      basicSoldiers: parseBasicSoldier,
      colliders: parseCollider,
    });

    this.players = players;
    this.basicSoldiers = basicSoldiers;
    this.colliders = colliders;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private processObjects<T extends Record<string, any>>(
    objects: Phaser.Types.Tilemaps.TiledObject[],
    parsers: T,
  ): { [key in keyof T]: Exclude<ReturnType<T[key]>, null>[] } {
    const output = Object.fromEntries(Object.keys(parsers).map((key) => [key, [] as unknown[]])) as {
      [key in keyof T]: Exclude<ReturnType<T[key]>, null>[];
    };
    const parsersList = Object.entries(parsers).map(([key, parser]) => [key, parser] as const);

    for (const object of objects) {
      for (const [key, parser] of parsersList) {
        if (parser(object) !== null) {
          output[key].push(parser(object));
          continue;
        }
      }
    }

    return output;
  }
}

import {
  parseBasicSoldier,
  parseCollider,
  parseSniper,
  parseTiledPlayerObject,
} from "./TilemapObjectsManager.validators";

const OBJECTS_DEF = {
  players: parseTiledPlayerObject,
  basicSoldiers: parseBasicSoldier,
  snipers: parseSniper,
  colliders: parseCollider,
} as const;

export class TilemapObjectsManager {
  public objects: { [key in keyof typeof OBJECTS_DEF]: Exclude<ReturnType<(typeof OBJECTS_DEF)[key]>, null>[] };

  constructor(private map: Phaser.Tilemaps.Tilemap) {
    const objects = this.map.getObjectLayerNames().flatMap((name) => this.map.getObjectLayer(name)?.objects ?? []);

    this.objects = this.processObjects(objects, OBJECTS_DEF);
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

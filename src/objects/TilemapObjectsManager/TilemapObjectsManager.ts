import { TiledPlayerObject, parseTiledPlayerObject } from "./TilemapObjectsManager.validators";

export class TilemapObjectsManager {
  public players!: TiledPlayerObject[];

  constructor(private map: Phaser.Tilemaps.Tilemap) {
    const placements = this.map.getObjectLayer("Placements");

    const { players } = this.processObjects(placements?.objects ?? [], {
      players: parseTiledPlayerObject,
    });

    this.players = players;
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

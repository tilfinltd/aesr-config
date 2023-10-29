import { ConfigLoader } from "./config-loader.js";
import { IniParser } from "./ini-parser.js";
import { ProfileSet } from "./profile-set.js";

export * from "./config-loader.js";
export * from "./ini-parser.js";
export * from "./profile-set.js";
export type * from "./type.js";

export class ConfigParser {
  static parseIni(text: string): ProfileSet {
    const sectionItems = new IniParser().parse(text);
    const rawProfileSet = new ConfigLoader().load(sectionItems);
    return new ProfileSet(rawProfileSet);
  }
}

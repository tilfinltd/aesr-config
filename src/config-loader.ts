import { SectionItem } from "./ini-parser.js";
import { ComplexProfileItem, ProfileItem } from "./type.js";

export class ConfigLoadError extends Error {
  public readonly line: number;

  constructor(message: string, line: number) {
    super(message);
    this.line = line;
  }
}

export class ConfigLoader {
  #singleProfiles: ProfileItem[] = [];
  #complexProfiles: ComplexProfileItem[] = [];

  load(sectionItems: SectionItem[]): {
    singles: ProfileItem[];
    complexes: ComplexProfileItem[];
  } {
    this.#singleProfiles = [];
    this.#complexProfiles = [];

    const destsBySrcMap: { [key: string]: ProfileItem[] } = {}; // { <srcProfileName>: [<destProfile>... ] }
    const profiles: (ProfileItem & { isRoot?: boolean })[] = [];

    sectionItems.forEach((sectionItem) => {
      const srcProf = sectionItem.params.source_profile;

      const item = this.createProfileItem(sectionItem);
      if (srcProf) {
        if (srcProf in destsBySrcMap) {
          destsBySrcMap[srcProf].push(item);
        } else {
          destsBySrcMap[srcProf] = [item];
        }
      }
      profiles.push({ ...item, isRoot: !srcProf });
    });

    profiles.forEach((item) => {
      const { name, isRoot } = item;
      delete item.isRoot;

      if (name in destsBySrcMap) {
        this.#complexProfiles.push({
          ...item,
          targets: destsBySrcMap[name],
        });
        delete destsBySrcMap[name];
      } else if (isRoot) {
        this.#singleProfiles.push(item);
      }
    });

    const undefinedSources = Object.keys(destsBySrcMap).join(", ");
    if (undefinedSources) {
      throw new ConfigLoadError(
        `The following profiles are referenced as \`source_profile\` but not defined: ${undefinedSources}`,
        0,
      );
    }

    return {
      singles: this.#singleProfiles,
      complexes: this.#complexProfiles,
    };
  }

  createProfileItem(sectionItem: SectionItem) {
    const name = sectionItem.name.replace(/^profile\s+/i, "");
    let { aws_account_id, role_arn, role_name, source_profile, ...others } =
      sectionItem.params;

    if (role_arn) {
      if (aws_account_id || role_name) {
        throw new ConfigLoadError(
          "The profile includes both `role_arn` and either `aws_account_id` or `role_name`.",
          sectionItem.startLine,
        );
      }

      const result = this.parseRoleArn(role_arn);
      if (!result) {
        throw new ConfigLoadError(
          "The profile includes invalid `role_arn` parameter.",
          sectionItem.startLine,
        );
      }
      aws_account_id = result.aws_account_id;
      role_name = result.role_name;
    }

    if (!aws_account_id)
      throw new ConfigLoadError(
        "The profile doesn't specify an AWS account ID.",
        sectionItem.startLine,
      );

    return {
      name,
      aws_account_id,
      role_name,
      ...others,
    };
  }

  parseRoleArn(
    roleArn: string,
  ): { aws_account_id: string; role_name: string } | null {
    const si = roleArn.indexOf("/");
    const prefix = roleArn.substring(0, si);
    const role = roleArn.substring(si + 1);
    if (role === undefined) return null;

    const iams = prefix.split(":");
    if (
      iams[0] !== "arn" ||
      iams[2] !== "iam" ||
      iams[3] !== "" ||
      iams[5] !== "role"
    )
      return null;

    return { aws_account_id: iams[4], role_name: role };
  }
}

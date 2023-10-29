import {
  ComplexBaseProfile,
  ComplexProfile,
  ComplexProfileItem,
  ComplexTargetProfile,
  ProfileItem,
  SingleProfile,
} from "./type.js";

export class ProfileSet {
  readonly singles: SingleProfile[];
  readonly complexes: ComplexProfile[];

  constructor(rawProfileSet: {
    singles?: ProfileItem[];
    complexes?: ComplexProfileItem[];
  }) {
    const { singles, complexes } = rawProfileSet;

    this.singles = [];
    if (singles) {
      if (!(singles instanceof Array)) {
        throw new ValidationError("singles must be an array.");
      }
      singles.forEach((item, i) => {
        this.singles.push(this.createSingleProfile(item, i));
      });
    }

    this.complexes = [];
    if (complexes) {
      if (!(complexes instanceof Array)) {
        throw new ValidationError("complexes must be an array.");
      }
      complexes.forEach((item, i) => {
        this.complexes.push(this.createComplexProfile(item, i));
      });
    }
  }

  createSingleProfile(profile: ProfileItem, index: number): SingleProfile {
    const PATH = `singles[${index}]`;
    const { name, aws_account_id, role_name, ...others } = profile;
    if (
      this.validateRequiredString(name, PATH, "name") &&
      this.validateRequiredString(aws_account_id, PATH, "aws_account_id") &&
      this.validateRequiredString(role_name, PATH, "role_name")
    ) {
      return { name, aws_account_id, role_name, ...others };
    }
    throw new ValidationError("unreachable");
  }

  createComplexProfile(
    complexProfile: ComplexProfileItem,
    index: number,
  ): ComplexProfile {
    const { targets, ...baseProfile } = complexProfile;
    const newBaseProfile = this.createComplexBaseProfile(baseProfile, index);
    if (!(targets instanceof Array)) {
      throw new ValidationError(
        `complexes[${index}].targets must be an array.`,
      );
    }

    let newTargets: ComplexTargetProfile[];
    try {
      const baseHasTargetRole = !!baseProfile.target_role_name;
      newTargets = targets.map((item, i) =>
        this.createComplexTargetProfile(item, i, baseHasTargetRole),
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        err.message = `complexes[${index}].${err.message}`;
      }
      throw err;
    }

    return { ...newBaseProfile, targets: newTargets };
  }

  createComplexBaseProfile(
    profile: Omit<ComplexProfileItem, "targets">,
    index: number,
  ): ComplexBaseProfile {
    const PATH = `complexes[${index}]`;
    this.validateRequiredString(profile.name, PATH, "name");
    this.validateRequiredString(profile.aws_account_id, PATH, "aws_account_id");
    this.validateStringOrUndefined(
      profile.aws_account_alias,
      PATH,
      "aws_account_alias",
    );
    this.validateStringOrUndefined(profile.role_name, PATH, "role_name");
    this.validateStringOrUndefined(
      profile.target_role_name,
      PATH,
      "target_role_name",
    );
    return profile as ComplexBaseProfile;
  }

  createComplexTargetProfile(
    profile: ProfileItem,
    index: number,
    baseHasTargetRole: boolean,
  ): ComplexTargetProfile {
    const PATH = `targets[${index}]`;
    this.validateRequiredString(profile.name, PATH, "name");
    this.validateRequiredString(profile.aws_account_id, PATH, "aws_account_id");
    if (baseHasTargetRole) {
      this.validateStringOrUndefined(profile.role_name, PATH, "role_name");
    } else {
      this.validateRequiredString(profile.role_name, PATH, "role_name");
    }
    return profile as ComplexTargetProfile;
  }

  private validateRequiredString(
    value: unknown,
    owner: string,
    field: string,
  ): value is string {
    const t = typeof value;
    if (t === "string" && t.length > 0) return true;
    throw new ValidationError(
      `${owner}.${field} is required to be a valid string.`,
    );
  }

  private validateStringOrUndefined(
    value: unknown,
    owner: string,
    field: string,
  ): value is string | undefined {
    const t = typeof value;
    if ((t === "string" && t.length > 0) || t === "undefined") return true;
    throw new ValidationError(`${owner}.${field} must be a valid string.`);
  }
}

class ValidationError extends Error {}

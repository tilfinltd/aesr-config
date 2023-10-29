export interface ProfileItem {
  name: string;
  aws_account_id: string;
  color?: string;
  image?: string;
  region?: string;
  role_name?: string;
  source_profile?: string;
}

export interface ComplexProfileItem extends ProfileItem {
  aws_account_alias?: string;
  target_role_name?: string;
  targets: ProfileItem[];
}

export interface SingleProfile {
  name: string;
  aws_account_id: string;
  role_name: string;
  color?: string;
  image?: string;
  region?: string;
}

export interface ComplexTargetProfile
  extends Omit<ProfileItem, "source_profile"> {}

export interface ComplexBaseProfile {
  name: string;
  aws_account_id: string;
  aws_account_alias?: string;
  role_name?: string;
  target_role_name?: string;
}

export interface ComplexProfile extends ComplexBaseProfile {
  targets: ComplexTargetProfile[];
}

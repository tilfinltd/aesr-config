import { describe, it } from "node:test";
import assert from "node:assert";
import { SectionItem } from "../src/ini-parser.js";
import { ConfigLoader } from "../src/config-loader.js";

describe("ConfigLoader", () => {
  const configLoader = new ConfigLoader();

  describe("Single Configurations and Complex Configurations", () => {
    it("loads single and complex profiles", () => {
      const sectionItems: SectionItem[] = [
        {
          name: "profile target1-1",
          startLine: 1,
          params: {
            aws_account_id: "111122223334",
            role_name: "role1",
            source_profile: "base1",
          },
        },
        {
          name: "target1-2",
          startLine: 5,
          params: {
            role_arn: "arn:aws:iam::111122223335:role/role2",
            source_profile: "base1",
          },
        },
        {
          name: "target1-3",
          startLine: 8,
          params: {
            role_arn: "arn:aws:iam::111122223336:role/sso/path/to/role",
            source_profile: "base1",
          },
        },
        {
          name: "base1",
          startLine: 10,
          params: {
            aws_account_id: "111100003333",
          },
        },
        {
          name: "base2",
          startLine: 13,
          params: { aws_account_id: "222200001111" },
        },
        {
          name: "profile targetex",
          startLine: 16,
          params: {
            aws_account_id: "333300001112",
            role_name: "roleex",
          },
        },
        {
          name: "target2-1",
          startLine: 21,
          params: {
            aws_account_id: "222200001112",
            role_name: "role3",
            source_profile: "base2",
          },
        },
      ];
      const profileSet = configLoader.load(sectionItems);
      assert.deepEqual(profileSet.singles![0], {
        name: "targetex",
        aws_account_id: "333300001112",
        role_name: "roleex",
      });
      assert.deepEqual(profileSet.complexes![0], {
        name: "base1",
        aws_account_id: "111100003333",
        role_name: undefined,
        targets: [
          {
            name: "target1-1",
            aws_account_id: "111122223334",
            role_name: "role1",
          },
          {
            name: "target1-2",
            aws_account_id: "111122223335",
            role_name: "role2",
          },
          {
            name: "target1-3",
            aws_account_id: "111122223336",
            role_name: "sso/path/to/role",
          },
        ],
      });
      assert.deepEqual(profileSet.complexes![1].name, "base2");
    });
  });

  describe("when role_arn, aws_account_id and role_name exist", () => {
    it("throws an error", () => {
      const sectionItems: SectionItem[] = [
        {
          name: "aaaa",
          startLine: 1,
          params: {
            role_arn: "arn:aws:iam::123456789012:role/marketingadmin",
            aws_account_id: "123456789012",
            role_name: "marketingadmin",
          },
        },
      ];
      assert.throws(
        () => {
          configLoader.load(sectionItems);
        },
        {
          message:
            "The profile includes both `role_arn` and either `aws_account_id` or `role_name`.",
        },
      );
    });
  });

  describe("when a role_arn is invalid", () => {
    it("throws an error", () => {
      const sectionItems: SectionItem[] = [
        {
          name: "invalid-role-arn",
          startLine: 1,
          params: {
            role_arn: "arn:role/any",
          },
        },
      ];
      assert.throws(
        () => {
          configLoader.load(sectionItems);
        },
        {
          message: "The profile includes invalid `role_arn` parameter.",
        },
      );
    });
  });

  describe("when aws_account id isn't specified", () => {
    it("throws an error", () => {
      const sectionItems: SectionItem[] = [
        {
          name: "unknown-aws-account-id",
          startLine: 1,
          params: {
            role_name: "some_role",
            source_profile: "baseProfile",
          },
        },
      ];
      assert.throws(
        () => {
          configLoader.load(sectionItems);
        },
        {
          message: "The profile doesn't specify an AWS account ID.",
        },
      );
    });
  });

  describe("Single Configuration and Complex Configurations with Role chaining", () => {
    it("loads single and complex profiles", () => {
      const sectionItems: SectionItem[] = [
        {
          name: "root1",
          startLine: 1,
          params: {
            aws_account_id: "000000000001",
          },
        },
        {
          name: "parent1",
          startLine: 6,
          params: {
            aws_account_id: "000000000011",
            role_name: "parent-role1",
            source_profile: "root1",
          },
        },
        {
          name: "child1",
          startLine: 11,
          params: {
            role_arn: "arn:aws:iam::000000000111:role/child-role1",
            source_profile: "parent1",
          },
        },
        {
          name: "grandchild1",
          startLine: 16,
          params: {
            aws_account_id: "000000001111",
            role_name: "manager",
            source_profile: "child1",
          },
        },
        {
          name: "child2",
          startLine: 20,
          params: {
            aws_account_id: "000000000211",
            role_name: "child-role2",
            source_profile: "parent1",
          },
        },
        {
          name: "brother1to2",
          startLine: 25,
          params: {
            aws_account_id: "000000000211",
            role_name: "brother",
            source_profile: "child1",
          },
        },
        {
          name: "brother2to1",
          startLine: 30,
          params: {
            aws_account_id: "000000000111",
            role_name: "brother",
            source_profile: "child2",
          },
        },
        {
          name: "profile targetex",
          startLine: 35,
          params: {
            aws_account_id: "333300001112",
            role_name: "roleex",
          },
        },
      ];
      const profileSet = configLoader.load(sectionItems);
      assert.deepEqual(profileSet.singles![0], {
        name: "targetex",
        aws_account_id: "333300001112",
        role_name: "roleex",
      });
      assert.deepEqual(profileSet.complexes![0], {
        name: "root1",
        aws_account_id: "000000000001",
        role_name: undefined,
        targets: [
          {
            name: "parent1",
            aws_account_id: "000000000011",
            role_name: "parent-role1",
          },
        ],
      });
      assert.deepEqual(profileSet.complexes![1], {
        name: "parent1",
        aws_account_id: "000000000011",
        role_name: "parent-role1",
        targets: [
          {
            name: "child1",
            aws_account_id: "000000000111",
            role_name: "child-role1",
          },
          {
            name: "child2",
            aws_account_id: "000000000211",
            role_name: "child-role2",
          },
        ],
      });
      assert.deepEqual(profileSet.complexes![2], {
        name: "child1",
        aws_account_id: "000000000111",
        role_name: "child-role1",
        targets: [
          {
            name: "grandchild1",
            aws_account_id: "000000001111",
            role_name: "manager",
          },
          {
            name: "brother1to2",
            aws_account_id: "000000000211",
            role_name: "brother",
          },
        ],
      });
      assert.deepEqual(profileSet.complexes![3], {
        name: "child2",
        aws_account_id: "000000000211",
        role_name: "child-role2",
        targets: [
          {
            name: "brother2to1",
            aws_account_id: "000000000111",
            role_name: "brother",
          },
        ],
      });
    });
  });
});

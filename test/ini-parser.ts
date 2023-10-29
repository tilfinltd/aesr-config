import { describe, it } from "node:test";
import assert from "node:assert";
import { IniParser } from "../src/ini-parser.js";

describe("IniParser", () => {
  const iniParser = new IniParser();

  describe("when the INI configuration is valid", () => {
    it("returns SectionItems", () => {
      const results = iniParser.parse(`\
[organization1]
aws_account_id = your-account-alias

[Org1-Account1-Role1 ]
role_arn = arn:aws:iam::123456789012:role/Role1
source_profile = organization1

[profile marketingadmin]
role_arn = arn:aws:iam::123456789012:role/marketingadmin
color = ffaaee; comment

[ Org1-Account1-Role2]
aws_account_id = 123456789013
role_name = Role2
source_profile = organization1
[baseaccount2]
aws_account_id = 000000000000

[profile Base2/Role1]
role_arn = arn:aws:iam::234567890123:role/Role1
source_profile = baseaccount2

[admin]
[AnotherRole]
role_name = SomeOtherRole#comment
aws_account_id = account-3-alias
`);
      assert.deepEqual(results[0], {
        name: "organization1",
        startLine: 1,
        params: { aws_account_id: "your-account-alias" },
      });
      assert.deepEqual(results[1], {
        name: "Org1-Account1-Role1",
        startLine: 4,
        params: {
          role_arn: "arn:aws:iam::123456789012:role/Role1",
          source_profile: "organization1",
        },
      });
      assert.deepEqual(results[2], {
        name: "profile marketingadmin",
        startLine: 8,
        params: {
          role_arn: "arn:aws:iam::123456789012:role/marketingadmin",
          color: "ffaaee",
        },
      });
      assert.deepEqual(results[3], {
        name: "Org1-Account1-Role2",
        startLine: 12,
        params: {
          aws_account_id: "123456789013",
          role_name: "Role2",
          source_profile: "organization1",
        },
      });
      assert.deepEqual(results[4], {
        name: "baseaccount2",
        startLine: 16,
        params: { aws_account_id: "000000000000" },
      });
      assert.deepEqual(results[5], {
        name: "profile Base2/Role1",
        startLine: 19,
        params: {
          role_arn: "arn:aws:iam::234567890123:role/Role1",
          source_profile: "baseaccount2",
        },
      });
      assert.deepEqual(results[6], {
        name: "admin",
        startLine: 23,
        params: {},
      });
      assert.deepEqual(results[7], {
        name: "AnotherRole",
        startLine: 24,
        params: {
          aws_account_id: "account-3-alias",
          role_name: "SomeOtherRole",
        },
      });
    });
  });

  describe("comments and spaces are everywhere", () => {
    it("trims all comments and spaces", () => {
      const iniParser = new IniParser();
      const results = iniParser.parse(`\
[profile a]# comment
; comment
key = role/roleA  #

  [B] # comment
role_arn = arn:aws:iam::123456789012:role/role-b;
  # comment
[profileC];comment
# comment
  aws_account_id  =  123456789012  ;comment
  ; comment
`);
      assert.deepEqual(results[0], {
        name: "profile a",
        startLine: 1,
        params: { key: "role/roleA" },
      });
      assert.deepEqual(results[1], {
        name: "B",
        startLine: 5,
        params: { role_arn: "arn:aws:iam::123456789012:role/role-b" },
      });
      assert.deepEqual(results[2], {
        name: "profileC",
        startLine: 8,
        params: {
          aws_account_id: "123456789012",
        },
      });
    });
  });

  describe("when a parameter is duplicated", () => {
    it('throws an error whose message is "parameter is duplicated"', () => {
      assert.throws(
        () => {
          const iniParser = new IniParser();
          iniParser.parse(`\
[section1]
key = val

[section2]
ABC = value1
ABC = value2`);
        },
        {
          message: "The `ABC` parameter is duplicated in the same profile.",
        },
      );
    });
  });

  describe("when a section is not declared", () => {
    it('throws an error whose message is "profile is not declared ~"', () => {
      assert.throws(
        () => {
          const iniParser = new IniParser();
          iniParser.parse(`\
key = value

[section]
key = value`);
        },
        {
          message: "Unexpected text",
        },
      );
    });
  });

  describe("when key property line is wrong", () => {
    it('throws an error whose message is "invalid key property definition"', () => {
      assert.throws(
        () => {
          const iniParser = new IniParser();
          iniParser.parse(`\
[a]
parameter definition does not contain equal
`);
        },
        {
          message: "Invalid parameter definition",
        },
      );
    });
  });
});

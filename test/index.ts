import { describe, it } from "node:test";
import assert from "node:assert";
import { ConfigParser } from "../src/index.js";

describe("ConfigParser.parseIni", () => {
  it("returns a ProfileSet", () => {
    const profileSet = ConfigParser.parseIni(`
      [profile foo]
      aws_account_id = 123456789012
      role_name = developer
      region = us-east-1
    `);
    assert.deepEqual(profileSet.singles, [
      {
        name: "foo",
        aws_account_id: "123456789012",
        role_name: "developer",
        region: "us-east-1",
      },
    ]);
    assert.deepEqual(profileSet.complexes, []);
  });
});

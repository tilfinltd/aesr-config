import { describe, it } from "node:test";
import assert from "node:assert";
import { ProfileSet } from "../src/profile-set.js";

describe("ProfileSet", () => {
  describe("Single and Complexes", () => {
    it("validates profileSet", () => {
      const rawProfileSet = {
        singles: [
          {
            name: "targetex",
            aws_account_id: "333300001112",
            role_name: "roleex",
          },
        ],
        complexes: [
          {
            name: "base1",
            aws_account_id: "111100003333",
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
                image: "https://example.com/image.png",
              },
            ],
          },
          {
            name: "base2",
            aws_account_id: "222200001111",
            target_role_name: "target-role",
            targets: [
              {
                name: "target2-1",
                aws_account_id: "222200001112",
                color: "00ccff",
              },
              {
                name: "target2-2",
                aws_account_id: "222200001112",
                role_name: "overwritten-role",
              },
            ],
          },
        ],
      };
      new ProfileSet(rawProfileSet);
    });
  });

  describe("when single doesn't have 'name'", () => {
    it("throws an error", () => {
      assert.throws(
        () => {
          new ProfileSet({
            singles: [
              {
                aws_account_id: "111100003333",
                role_name: "Role1",
              } as any,
            ],
          });
        },
        {
          code: "INVALID_PROFILE_NAME",
          message: "singles[0].name is required to be a valid string.",
        },
      );
    });
  });

  describe("when single doesn't have 'aws_account_id'", () => {
    it("throws an error", () => {
      assert.throws(
        () => {
          new ProfileSet({
            singles: [
              {
                name: "single",
                role_name: "Role1",
              } as any,
            ],
          });
        },
        {
          code: "INVALID_AWS_ACCOUNT_ID",
          message:
            "singles[0].aws_account_id is required to be a valid string.",
        },
      );
    });
  });

  describe("when single doesn't have 'role_name'", () => {
    it("throws an error", () => {
      assert.throws(
        () => {
          new ProfileSet({
            singles: [
              {
                name: "single",
                aws_account_id: "alias",
              } as any,
            ],
          });
        },
        {
          code: "INVALID_ROLE_NAME",
          message: "singles[0].role_name is required to be a valid string.",
        },
      );
    });
  });

  describe("when complexProfile doesn't have 'name'", () => {
    it("throws an error", () => {
      assert.throws(
        () => {
          new ProfileSet({
            complexes: [
              {
                aws_account_id: "111100003333",
                targets: [],
              } as any,
            ],
          });
        },
        {
          code: "INVALID_PROFILE_NAME",
          message: "complexes[0].name is required to be a valid string.",
        },
      );
    });
  });

  describe("when complexProfile doesn't have 'aws_account_id'", () => {
    it("throws an error", () => {
      assert.throws(
        () => {
          new ProfileSet({
            complexes: [
              {
                name: "complex",
                targets: [],
              } as any,
            ],
          });
        },
        {
          code: "INVALID_AWS_ACCOUNT_ID",
          message:
            "complexes[0].aws_account_id is required to be a valid string.",
        },
      );
    });
  });

  describe("when complexProfile has invalid 'aws_account_alias'", () => {
    it("throws an error", () => {
      assert.throws(
        () => {
          new ProfileSet({
            complexes: [
              {
                name: "complex",
                aws_account_id: "111100003333",
                aws_account_alias: false,
                targets: [],
              } as any,
            ],
          });
        },
        {
          code: "INVALID_AWS_ACCOUNT_ALIAS",
          message: "complexes[0].aws_account_alias must be a valid string.",
        },
      );
    });
  });

  describe("when singles isn't an array", () => {
    it("throws an error", () => {
      assert.throws(
        () => {
          new ProfileSet({
            singles: {} as any,
          });
        },
        {
          code: "INVALID_SINGLES_TYPE",
          message: "singles must be an array.",
        },
      );
    });
  });

  describe("when complexes isn't an array", () => {
    it("throws an error", () => {
      assert.throws(
        () => {
          new ProfileSet({
            complexes: {} as any,
          });
        },
        {
          code: "INVALID_COMPLEXES_TYPE",
          message: "complexes must be an array.",
        },
      );
    });
  });

  describe("when complexes.targets isn't defined", () => {
    it("throws an error", () => {
      assert.throws(
        () => {
          new ProfileSet({
            complexes: [
              {
                name: "base1",
                aws_account_id: "111100003333",
              },
            ],
          } as any);
        },
        {
          code: "INVALID_TARGETS_TYPE",
          message: "complexes[0].targets must be an array.",
        },
      );
    });
  });

  describe("when complexes.targets isn't an array", () => {
    it("throws an error", () => {
      assert.throws(
        () => {
          new ProfileSet({
            complexes: [
              {
                name: "base1",
                aws_account_id: "111100003333",
                targets: {},
              },
            ],
          } as any);
        },
        {
          code: "INVALID_TARGETS_TYPE",
          message: "complexes[0].targets must be an array.",
        },
      );
    });
  });

  describe("when complexes.targets item doen't have 'name'", () => {
    it("throws an error", () => {
      assert.throws(
        () => {
          new ProfileSet({
            complexes: [
              {
                name: "base1",
                aws_account_id: "111100003333",
                targets: [
                  {
                    aws_account_id: "111122223334",
                    role_name: "role1",
                  },
                ],
              },
            ],
          } as any);
        },
        {
          code: "INVALID_PROFILE_NAME",
          message:
            "complexes[0].targets[0].name is required to be a valid string.",
        },
      );
    });
  });

  describe("when complexProfile has 'target_role_name' and target has invalid 'role_name'", () => {
    it("throws an error that role_name is optional string", () => {
      assert.throws(
        () => {
          new ProfileSet({
            complexes: [
              {
                name: "complex",
                aws_account_id: "111100003333",
                target_role_name: "Role1",
                targets: [
                  {
                    name: "target1",
                    aws_account_id: "111100004444",
                    role_name: 123,
                  },
                ],
              } as any,
            ],
          });
        },
        {
          code: "INVALID_ROLE_NAME",
          message: "complexes[0].targets[0].role_name must be a valid string.",
        },
      );
    });
  });

  describe("when complexProfile doesn't have 'target_role_name' and target doesn't have 'role_name'", () => {
    it("throws an error that role_name is required string", () => {
      assert.throws(
        () => {
          new ProfileSet({
            complexes: [
              {
                name: "complex",
                aws_account_id: "111100003333",
                targets: [{ name: "target1", aws_account_id: "111100004444" }],
              } as any,
            ],
          });
        },
        {
          code: "INVALID_ROLE_NAME",
          message:
            "complexes[0].targets[0].role_name is required to be a valid string.",
        },
      );
    });
  });
});

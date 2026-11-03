import { describe, expect, it } from "vitest";

import { fullName, passwordRequirements, signUpSchema } from "./authValidation";

const valid = {
  firstName: "Juan",
  lastName: "Dela Cruz",
  email: "juan@example.com",
  password: "hunter22",
  confirmPassword: "hunter22",
};

describe("passwordRequirements", () => {
  it("reports the empty-password requirements as unmet", () => {
    const unmet = passwordRequirements("")
      .filter((requirement) => !requirement.met)
      .map((requirement) => requirement.id);
    expect(unmet).toEqual(["length", "letter", "number"]);
  });

  it("requires 8 characters, a letter and a number", () => {
    const met = (password: string) =>
      passwordRequirements(password)
        .filter((requirement) => requirement.met)
        .map((requirement) => requirement.id);

    expect(met("abc123")).toEqual(["max", "letter", "number"]);
    expect(met("abcdefgh")).toEqual(["length", "max", "letter"]);
    expect(met("12345678")).toEqual(["length", "max", "number"]);
    expect(met("abcd1234")).toEqual(["length", "max", "letter", "number"]);
  });

  it("flags passwords over the 72 character cap", () => {
    const tooLong = passwordRequirements("a1".repeat(40));
    expect(tooLong.find((requirement) => requirement.id === "max")?.met).toBe(
      false,
    );
  });

  it("accepts non-ASCII letters", () => {
    const letter = passwordRequirements("пароль123").find(
      (requirement) => requirement.id === "letter",
    );
    expect(letter?.met).toBe(true);
  });
});

describe("signUpSchema", () => {
  it("accepts a valid sign-up and trims the name fields", () => {
    const parsed = signUpSchema.parse({
      ...valid,
      firstName: "  Juan ",
      lastName: " Dela Cruz  ",
      email: "  JUAN@example.com ",
    });
    expect(parsed).toMatchObject({
      firstName: "Juan",
      lastName: "Dela Cruz",
      email: "juan@example.com",
    });
  });

  it("requires first and last name", () => {
    const first = signUpSchema.safeParse({ ...valid, firstName: "  " });
    const last = signUpSchema.safeParse({ ...valid, lastName: "" });
    expect(first.success).toBe(false);
    expect(last.success).toBe(false);
    expect(first.error?.flatten().fieldErrors.firstName?.[0]).toBe(
      "Enter your first name",
    );
    expect(last.error?.flatten().fieldErrors.lastName?.[0]).toBe(
      "Enter your last name",
    );
  });

  it("rejects passwords that miss a requirement", () => {
    for (const password of ["abc12", "abcdefgh", "12345678"]) {
      const result = signUpSchema.safeParse({
        ...valid,
        password,
        confirmPassword: password,
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects a password longer than 72 characters", () => {
    const password = `a1${"x".repeat(71)}`;
    const result = signUpSchema.safeParse({
      ...valid,
      password,
      confirmPassword: password,
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched confirmation", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      confirmPassword: "hunter23",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.confirmPassword?.[0]).toBe(
      "Passwords don't match",
    );
  });

  it("requires confirmation", () => {
    const result = signUpSchema.safeParse({ ...valid, confirmPassword: "" });
    expect(result.success).toBe(false);
  });
});

describe("fullName", () => {
  it("joins the parts it has", () => {
    expect(fullName("Juan", "Dela Cruz")).toBe("Juan Dela Cruz");
    expect(fullName("Juan", null)).toBe("Juan");
    expect(fullName(null, "Dela Cruz")).toBe("Dela Cruz");
    expect(fullName("  ", "")).toBeNull();
    expect(fullName(null, undefined)).toBeNull();
  });
});

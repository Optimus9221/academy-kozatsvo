import assert from "node:assert/strict";
import { describe, it, before } from "node:test";

process.env.JWT_SECRET = "test-secret-for-totp-unit-tests-32chars";

describe("totp helpers", () => {
  let totp: typeof import("../src/lib/totp");

  before(async () => {
    totp = await import("../src/lib/totp");
  });

  it("encrypts and decrypts secrets", () => {
    const secret = totp.createTotpSecret();
    const sealed = totp.encryptTotpSecret(secret);
    assert.notEqual(sealed, secret);
    assert.equal(totp.decryptTotpSecret(sealed), secret);
  });

  it("verifies generated authenticator codes", () => {
    const secret = totp.createTotpSecret();
    const code = totp.generateTotpCode(secret);
    assert.match(code, /^\d{6}$/);
    assert.equal(totp.verifyTotpCode(secret, code), true);
    assert.equal(totp.verifyTotpCode(secret, "000000"), false);
  });

  it("builds otpauth URI", () => {
    const secret = totp.createTotpSecret();
    const uri = totp.buildTotpUri("admin@academy.ua", secret);
    assert.match(uri, /^otpauth:\/\/totp\//);
    assert.match(uri, /secret=/);
  });
});

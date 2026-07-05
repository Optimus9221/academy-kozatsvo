import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextResponse } from "next/server";
import { isAuthError } from "../src/lib/api-auth";
import { canAccessAdminPath } from "../src/lib/permissions";

describe("isAuthError", () => {
  it("returns true for Response", () => {
    const response = NextResponse.json({ error: "test" }, { status: 401 });
    assert.equal(isAuthError(response), true);
  });

  it("returns false for session user object", () => {
    const session = {
      id: "user-1",
      name: "Admin",
      email: "admin@example.com",
      role: "ADMIN" as const,
    };
    assert.equal(isAuthError(session), false);
  });
});

describe("canAccessAdminPath", () => {
  it("allows ADMIN everywhere", () => {
    assert.equal(canAccessAdminPath("ADMIN", ""), true);
    assert.equal(canAccessAdminPath("ADMIN", "settings"), true);
    assert.equal(canAccessAdminPath("ADMIN", "users"), true);
  });

  it("restricts MODERATOR to applications and account", () => {
    assert.equal(canAccessAdminPath("MODERATOR", "applications"), true);
    assert.equal(canAccessAdminPath("MODERATOR", "applications/abc"), true);
    assert.equal(canAccessAdminPath("MODERATOR", "account"), true);
    assert.equal(canAccessAdminPath("MODERATOR", ""), false);
    assert.equal(canAccessAdminPath("MODERATOR", "news"), false);
    assert.equal(canAccessAdminPath("MODERATOR", "gallery"), false);
  });

  it("blocks EDITOR from settings, users, and audit", () => {
    assert.equal(canAccessAdminPath("EDITOR", "news"), true);
    assert.equal(canAccessAdminPath("EDITOR", "applications"), true);
    assert.equal(canAccessAdminPath("EDITOR", "settings"), false);
    assert.equal(canAccessAdminPath("EDITOR", "users"), false);
    assert.equal(canAccessAdminPath("EDITOR", "audit"), false);
    assert.equal(canAccessAdminPath("EDITOR", "audit/logs"), false);
  });
});

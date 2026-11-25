import { resolveAvatarSaveUiFromResponse } from "@/lib/avatar/avatarSaveUiContract";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Avatar Studio false-success ban", () => {
  it("HTTP 503 never yields saved status", () => {
    const result = resolveAvatarSaveUiFromResponse({
      httpOk: false,
      status: 503,
      payload: { ok: false, durable: false, error: "Avatar profile/loadout was not durably saved" },
    });
    expect(result.status).toBe("error");
    expect(result.savedAt).toBeNull();
    expect(result.error).toMatch(/not durably saved|503|failed/i);
  });

  it("ok:false never yields saved status", () => {
    const result = resolveAvatarSaveUiFromResponse({
      httpOk: true,
      status: 200,
      payload: { ok: false, durable: false, error: "no" },
    });
    expect(result.status).toBe("error");
    expect(result.savedAt).toBeNull();
  });

  it("null, empty, or missing ok:true/durable:true never yields saved status (strict positive durable check)", () => {
    expect(resolveAvatarSaveUiFromResponse({ httpOk: true, status: 200, payload: null }).status).toBe("error");
    expect(resolveAvatarSaveUiFromResponse({ httpOk: true, status: 200, payload: {} }).status).toBe("error");
    expect(resolveAvatarSaveUiFromResponse({ httpOk: true, status: 200, payload: { ok: true } }).status).toBe("error");
    expect(resolveAvatarSaveUiFromResponse({ httpOk: true, status: 200, payload: { durable: true } }).status).toBe("error");
  });

  it("durable success yields saved with timestamp", () => {
    const result = resolveAvatarSaveUiFromResponse({
      httpOk: true,
      status: 200,
      payload: {
        ok: true,
        durable: true,
        AvatarProfile: { updatedAt: "2026-11-23T00:00:00.000Z" },
      },
    });
    expect(result.status).toBe("saved");
    expect(result.savedAt).toBe("2026-11-23T00:00:00.000Z");
    expect(result.error).toBeNull();
  });

  it("AvatarStudioExperience does not setSavedAt on failed response", () => {
    const source = readFileSync(
      resolve(__dirname, "../components/avatar/AvatarStudioExperience.tsx"),
      "utf8",
    );
    expect(source).toContain('setSaveStatus("error")');
    expect(source).toContain("Never set savedAt / Synced on failure");
    expect(source).not.toMatch(/setSavedAt\(sync\.syncedAt\)/);
  });

  it("TMIAvatarSystem does not setSaved(true) in catch", () => {
    const source = readFileSync(
      resolve(__dirname, "../components/avatar/TMIAvatarSystem.tsx"),
      "utf8",
    );
    const catchIdx = source.indexOf("} catch (err) {");
    expect(catchIdx).toBeGreaterThan(-1);
    const catchSlice = source.slice(catchIdx, catchIdx + 280);
    expect(catchSlice).toContain("setSaved(false)");
    expect(catchSlice).not.toContain("setSaved(true)");
  });

  it("AvatarSaveRail exposes error status without Synced label on failure", () => {
    const source = readFileSync(
      resolve(__dirname, "../components/avatar/AvatarSaveRail.tsx"),
      "utf8",
    );
    expect(source).toContain('data-save-status={status}');
    expect(source).toContain("avatar-save-status-error");
    expect(source).not.toContain("Synced:");
  });

  it("AvatarStudioExperience tracks editRevisionRef so edits during an in-flight save prevent stale SAVED status", () => {
    const source = readFileSync(
      resolve(__dirname, "../components/avatar/AvatarStudioExperience.tsx"),
      "utf8",
    );
    expect(source).toContain("editRevisionRef");
    expect(source).toContain("requestEditRevision");
    expect(source).toContain("if (editRevisionRef.current !== requestEditRevision)");
  });
});

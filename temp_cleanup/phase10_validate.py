import json
import os
import sys

HEALTH_FILES = [
    "data/health/module-status.json",
    "data/health/failure-types.json",
    "data/health/severity-levels.json",
    "data/health/self-heal-actions.json",
    "data/health/verification-checks.json",
    "data/health/rollback-rules.json",
    "data/health/design-drift-signals.json",
    "data/health/escalation-paths.json",
    "data/health/approval-rules.json",
    "data/health/fix-memory.json",
]

BOT_FILES = [
    "data/bots/system-health-bot.json",
    "data/bots/route-integrity-bot.json",
    "data/bots/scene-repair-bot.json",
    "data/bots/layout-recovery-bot.json",
    "data/bots/asset-fallback-bot.json",
    "data/bots/widget-recovery-bot.json",
    "data/bots/queue-recovery-bot.json",
    "data/bots/sponsor-safety-bot.json",
    "data/bots/performance-recovery-bot.json",
    "data/bots/fix-authorization-bot.json",
    "data/bots/change-audit-bot.json",
    "data/bots/verification-bot.json",
    "data/bots/rollback-bot.json",
]

BOT_REQUIRED_KEYS = [
    "purpose",
    "allowedActions",
    "blockedActions",
    "escalationTarget",
    "approvalRequired",
    "rollbackSupported",
    "relatedChains",
    "relatedRegistries",
]

HEALTH_REQUIRED_ROOT_KEYS = {
    "data/health/module-status.json": "modules",
    "data/health/failure-types.json": "failureTypes",
    "data/health/severity-levels.json": "severityLevels",
    "data/health/self-heal-actions.json": "actions",
    "data/health/verification-checks.json": "checks",
    "data/health/rollback-rules.json": "rollbackRules",
    "data/health/design-drift-signals.json": "driftSignals",
    "data/health/escalation-paths.json": "escalationPaths",
    "data/health/approval-rules.json": "approvalRules",
    "data/health/fix-memory.json": "fixMemory",
}


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def fail(msg):
    print(f"FAIL {msg}")


def ok(path):
    print(f"PASS {path}")


def validate_health(path, data):
    expected_key = HEALTH_REQUIRED_ROOT_KEYS[path]
    if expected_key not in data:
        fail(f"{path} — missing root key: {expected_key}")
        return False
    return True


def validate_bot(path, data):
    valid = True
    for key in BOT_REQUIRED_KEYS:
        if key not in data:
            fail(f"{path} — missing key: {key}")
            valid = False

    if valid:
        if not isinstance(data.get("relatedRegistries", []), list):
            fail(f"{path} — relatedRegistries must be a list")
            valid = False
        if not isinstance(data.get("relatedChains", []), list):
            fail(f"{path} — relatedChains must be a list")
            valid = False
    return valid


def main():
    had_error = False
    loaded = {}

    for path in HEALTH_FILES + BOT_FILES:
        if not os.path.exists(path):
            fail(f"{path} — file does not exist")
            had_error = True
            continue
        try:
            loaded[path] = load_json(path)
            ok(path)
        except Exception as e:
            fail(f"{path} — invalid JSON: {e}")
            had_error = True

    for path in HEALTH_FILES:
        if path in loaded:
            if not validate_health(path, loaded[path]):
                had_error = True

    bot_names = set()
    for path in BOT_FILES:
        bot_names.add(os.path.basename(path).replace(".json", ""))

    for path in BOT_FILES:
        if path not in loaded:
            continue
        data = loaded[path]
        if not validate_bot(path, data):
            had_error = True
            continue

        for ref in data.get("relatedRegistries", []):
            if not isinstance(ref, str):
                fail(f"{path} — relatedRegistries contains non-string value")
                had_error = True
                continue
            if not os.path.exists(ref):
                fail(f"{path} — related registry path not found: {ref}")
                had_error = True

        target = data.get("escalationTarget")
        if isinstance(target, str) and target.endswith("-bot"):
            if target not in bot_names:
                fail(f"{path} — escalationTarget bot not found: {target}")
                had_error = True

    if had_error:
        sys.exit(1)
    print("PHASE10_VALIDATION_PASS")
    sys.exit(0)


if __name__ == "__main__":
    main()

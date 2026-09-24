import { describe, expect, it } from "vitest";
import {
  assembleTerraformConfig,
  buildMaintenanceWindowAttributes,
  buildProviderAttributes,
  buildRequiredProvider,
  buildScenarioAttributes,
  buildSlaTargetAttributes,
  buildWebhookAttributes,
  mergeTerraformConfig,
} from "../config.js";
import { PATHLY_DEFAULT_VERSION, PATHLY_PROVIDER_SOURCE } from "../types.js";

describe("buildRequiredProvider", () => {
  it("uses defaults", () => {
    expect(buildRequiredProvider()).toEqual({
      source: PATHLY_PROVIDER_SOURCE,
      version: PATHLY_DEFAULT_VERSION,
    });
  });

  it("accepts a custom constraint", () => {
    expect(buildRequiredProvider("~> 0.1.4")).toEqual({
      source: PATHLY_PROVIDER_SOURCE,
      version: "~> 0.1.4",
    });
  });
});

describe("buildProviderAttributes", () => {
  it("returns empty object by default (env auth)", () => {
    expect(buildProviderAttributes()).toEqual({});
    expect(buildProviderAttributes({})).toEqual({});
  });

  it("includes optional api fields when set", () => {
    expect(
      buildProviderAttributes({ apiToken: "sp_x", apiUrl: "https://api.example" }),
    ).toEqual({ api_token: "sp_x", api_url: "https://api.example" });
  });
});

describe("buildScenarioAttributes", () => {
  it("builds a minimal HTTP scenario", () => {
    expect(
      buildScenarioAttributes({
        name: "Home",
        url: "https://shop.example.com/",
        intervalSec: 300,
      }),
    ).toEqual({
      name: "Home",
      url: "https://shop.example.com/",
      interval_sec: 300,
    });
  });

  it("maps all optional fields and steps", () => {
    const attrs = buildScenarioAttributes({
      name: "Checkout",
      type: "browser",
      intervalSec: 60,
      severity: "critical",
      folder: "Shop",
      tags: ["prod"],
      runbook: "https://wiki.example.com/r",
      viewport: "desktop",
      locale: "fr-FR",
      scenarioTimezone: "Europe/Paris",
      clickDelayMs: 500,
      expectText: "Cart",
      expectedStatus: 200,
      maxLatencyMs: 1500,
      steps: [{ op: "goto", url: "https://shop.example.com/login" }],
    });
    expect(attrs.type).toBe("browser");
    expect(attrs.interval_sec).toBe(60);
    expect(attrs.max_latency_ms).toBe(1500);
    expect(attrs.scenario_timezone).toBe("Europe/Paris");
    expect(attrs.click_delay_ms).toBe(500);
    expect(attrs.steps).toHaveLength(1);
  });

  it("rejects missing name", () => {
    expect(() =>
      buildScenarioAttributes({ name: "", intervalSec: 60 }),
    ).toThrow(/name is required/);
  });

  it("rejects missing intervalSec", () => {
    expect(() =>
      buildScenarioAttributes({
        name: "x",
        intervalSec: undefined as unknown as number,
      }),
    ).toThrow(/intervalSec is required/);
    expect(() =>
      buildScenarioAttributes({
        name: "x",
        intervalSec: null as unknown as number,
      }),
    ).toThrow(/intervalSec is required/);
  });
});

describe("buildWebhookAttributes", () => {
  it("builds with url and events", () => {
    expect(
      buildWebhookAttributes({
        url: "https://hooks.example.com/pathly",
        events: ["run.failed"],
      }),
    ).toEqual({
      url: "https://hooks.example.com/pathly",
      events: ["run.failed"],
    });
  });

  it("rejects empty url", () => {
    expect(() => buildWebhookAttributes({ url: "" })).toThrow(/url is required/);
  });

  it("rejects non-https", () => {
    expect(() => buildWebhookAttributes({ url: "http://evil" })).toThrow(/https/);
  });
});

describe("buildMaintenanceWindowAttributes", () => {
  it("builds weekly window", () => {
    expect(
      buildMaintenanceWindowAttributes({
        weekday: 7,
        startMinute: 180,
        durationMin: 120,
        reason: "backup",
      }),
    ).toEqual({
      weekday: 7,
      start_minute: 180,
      duration_min: 120,
      reason: "backup",
    });
  });

  it("builds one-off window with scenario", () => {
    expect(
      buildMaintenanceWindowAttributes({
        scenarioId: "${pathly_scenario.checkout.id}",
        startsAt: "2026-10-04T22:00:00Z",
        endsAt: "2026-10-05T02:00:00Z",
      }),
    ).toMatchObject({
      scenario_id: "${pathly_scenario.checkout.id}",
      starts_at: "2026-10-04T22:00:00Z",
      ends_at: "2026-10-05T02:00:00Z",
    });
  });

  it("rejects mixed weekly and one-off", () => {
    expect(() =>
      buildMaintenanceWindowAttributes({
        weekday: 1,
        startMinute: 0,
        durationMin: 60,
        startsAt: "2026-01-01T00:00:00Z",
        endsAt: "2026-01-01T01:00:00Z",
      }),
    ).toThrow(/mutually exclusive/);
  });

  it("rejects empty config", () => {
    expect(() => buildMaintenanceWindowAttributes({})).toThrow(/needs either/);
  });

  it("rejects incomplete one-off", () => {
    expect(() =>
      buildMaintenanceWindowAttributes({ startsAt: "2026-01-01T00:00:00Z" }),
    ).toThrow(/both startsAt and endsAt/);
    expect(() =>
      buildMaintenanceWindowAttributes({ endsAt: "2026-01-01T01:00:00Z" }),
    ).toThrow(/both startsAt and endsAt/);
  });

  it("rejects incomplete weekly", () => {
    expect(() =>
      buildMaintenanceWindowAttributes({ weekday: 1, startMinute: 0 }),
    ).toThrow(/weekday, startMinute and durationMin/);
  });
});

describe("buildSlaTargetAttributes", () => {
  it("builds a valid target", () => {
    expect(
      buildSlaTargetAttributes({
        scenarioId: "sc_1",
        name: "Checkout — 99.9 %",
        objectivePct: 99.9,
        windowDays: 30,
        excludeMaintenance: true,
        warnAtBudgetRatio: 0.8,
        enabled: true,
      }),
    ).toEqual({
      scenario_id: "sc_1",
      name: "Checkout — 99.9 %",
      objective_pct: 99.9,
      window_days: 30,
      exclude_maintenance: true,
      warn_at_budget_ratio: 0.8,
      enabled: true,
    });
  });

  it("rejects missing objectivePct", () => {
    expect(() =>
      buildSlaTargetAttributes({
        objectivePct: undefined as unknown as number,
        windowDays: 30,
      }),
    ).toThrow(/objectivePct is required/);
    expect(() =>
      buildSlaTargetAttributes({
        objectivePct: null as unknown as number,
        windowDays: 30,
      }),
    ).toThrow(/objectivePct is required/);
  });

  it("rejects missing windowDays", () => {
    expect(() =>
      buildSlaTargetAttributes({
        objectivePct: 99,
        windowDays: undefined as unknown as number,
      }),
    ).toThrow(/windowDays is required/);
    expect(() =>
      buildSlaTargetAttributes({
        objectivePct: 99,
        windowDays: null as unknown as number,
      }),
    ).toThrow(/windowDays is required/);
  });

  it("rejects objectivePct out of range", () => {
    expect(() =>
      buildSlaTargetAttributes({ objectivePct: 40, windowDays: 30 }),
    ).toThrow(/between 50 and 100/);
    expect(() =>
      buildSlaTargetAttributes({ objectivePct: 101, windowDays: 30 }),
    ).toThrow(/between 50 and 100/);
  });

  it("rejects windowDays out of range", () => {
    expect(() =>
      buildSlaTargetAttributes({ objectivePct: 99, windowDays: 0 }),
    ).toThrow(/between 1 and 365/);
    expect(() =>
      buildSlaTargetAttributes({ objectivePct: 99, windowDays: 400 }),
    ).toThrow(/between 1 and 365/);
  });
});

describe("assembleTerraformConfig / mergeTerraformConfig", () => {
  it("assembles provider-only config", () => {
    const cfg = assembleTerraformConfig({ provider: {} });
    expect(cfg.terraform?.required_providers?.pathly.source).toBe(PATHLY_PROVIDER_SOURCE);
    expect(cfg.provider?.pathly).toEqual([{}]);
    expect(cfg.resource).toEqual({});
  });

  it("ignores empty resource maps", () => {
    const cfg = assembleTerraformConfig({
      scenarios: {},
      webhooks: {},
      maintenanceWindows: {},
      slaTargets: {},
    });
    expect(cfg.resource).toEqual({});
  });

  it("assembles all resource types", () => {
    const cfg = assembleTerraformConfig({
      provider: { versionConstraint: "~> 0.1.4" },
      scenarios: {
        home: { name: "Home", url: "https://a/", intervalSec: 300 },
      },
      webhooks: {
        alerts: { url: "https://hooks.example.com/x" },
      },
      maintenanceWindows: {
        backup: { weekday: 7, startMinute: 180, durationMin: 120 },
      },
      slaTargets: {
        obj: { objectivePct: 99.9, windowDays: 30, scenarioId: "sc" },
      },
    });
    expect(cfg.terraform?.required_providers?.pathly.version).toBe("~> 0.1.4");
    expect(cfg.resource?.pathly_scenario?.home).toBeDefined();
    expect(cfg.resource?.pathly_webhook?.alerts).toBeDefined();
    expect(cfg.resource?.pathly_maintenance_window?.backup).toBeDefined();
    expect(cfg.resource?.pathly_sla_target?.obj).toBeDefined();
  });

  it("merges two configs", () => {
    const a = assembleTerraformConfig({
      scenarios: { a: { name: "A", intervalSec: 60, url: "https://a/" } },
    });
    const b = assembleTerraformConfig({
      webhooks: { w: { url: "https://hooks.example.com/w" } },
    });
    const m = mergeTerraformConfig(a, b);
    expect(m.resource?.pathly_scenario?.a).toBeDefined();
    expect(m.resource?.pathly_webhook?.w).toBeDefined();
    expect(m.provider?.pathly?.length).toBe(2);
  });

  it("merges empty fragments via nullish provider fallback", () => {
    const m = mergeTerraformConfig({}, {});
    expect(m.provider?.pathly).toEqual([]);
    expect(m.terraform?.required_providers).toEqual({});
    expect(m.resource?.pathly_scenario).toEqual({});
  });
});

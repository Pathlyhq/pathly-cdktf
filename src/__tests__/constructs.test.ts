import { describe, expect, it } from "vitest";
import {
  Client,
  MaintenanceWindow,
  PathlyApp,
  PathlyProvider,
  Scenario,
  SlaTarget,
  Webhook,
} from "../constructs.js";
import {
  PATHLY_DEFAULT_VERSION,
  PATHLY_PROVIDER_SOURCE,
} from "../types.js";
import * as pkg from "../index.js";

describe("PathlyProvider", () => {
  it("exposes source and default version", () => {
    const p = new PathlyProvider();
    expect(p.source).toBe(PATHLY_PROVIDER_SOURCE);
    expect(p.versionConstraint).toBe(PATHLY_DEFAULT_VERSION);
    expect(p.toTerraformAttributes()).toEqual({});
    const cfg = p.toTerraformConfig();
    expect(cfg.terraform?.required_providers?.pathly.source).toBe(PATHLY_PROVIDER_SOURCE);
  });

  it("honours versionConstraint and construct id", () => {
    const p = new PathlyProvider("custom", { versionConstraint: "~> 0.1.3" });
    expect(p.constructId).toBe("custom");
    expect(p.versionConstraint).toBe("~> 0.1.3");
  });
});

describe("Scenario / Webhook / MaintenanceWindow / SlaTarget", () => {
  it("Scenario emits resource JSON and idToken", () => {
    const s = new Scenario("checkout", {
      name: "Checkout",
      url: "https://shop.example.com/cart",
      intervalSec: 60,
      severity: "critical",
    });
    expect(s.resourceType).toBe("pathly_scenario");
    expect(s.idToken).toBe("${pathly_scenario.checkout.id}");
    expect(s.toTerraformConfig().resource?.pathly_scenario?.checkout?.name).toBe(
      "Checkout",
    );
  });

  it("Webhook emits secretToken and toTerraformConfig", () => {
    const w = new Webhook("alerts", {
      url: "https://hooks.example.com/pathly",
      events: ["run.failed", "run.recovered"],
    });
    expect(w.idToken).toContain("pathly_webhook.alerts");
    expect(w.secretToken).toBe("${pathly_webhook.alerts.secret}");
    expect(w.toTerraformAttributes().url).toBe("https://hooks.example.com/pathly");
    expect(w.toTerraformConfig().resource?.pathly_webhook?.alerts?.url).toBe(
      "https://hooks.example.com/pathly",
    );
  });

  it("MaintenanceWindow weekly and toTerraformConfig", () => {
    const m = new MaintenanceWindow("backup", {
      weekday: 7,
      startMinute: 180,
      durationMin: 120,
      reason: "Weekly backup",
    });
    expect(m.resourceType).toBe("pathly_maintenance_window");
    expect(m.idToken).toBe("${pathly_maintenance_window.backup.id}");
    expect(m.toTerraformAttributes().weekday).toBe(7);
    expect(
      m.toTerraformConfig().resource?.pathly_maintenance_window?.backup?.weekday,
    ).toBe(7);
  });

  it("SlaTarget uses scenario token and toTerraformConfig", () => {
    const s = new Scenario("checkout", {
      name: "Checkout",
      url: "https://shop.example.com/cart",
      intervalSec: 60,
    });
    const t = new SlaTarget("obj", {
      scenarioId: s.idToken,
      name: "Checkout — 99.9 %",
      objectivePct: 99.9,
      windowDays: 30,
      excludeMaintenance: true,
      warnAtBudgetRatio: 0.8,
    });
    expect(t.resourceType).toBe("pathly_sla_target");
    expect(t.idToken).toContain("pathly_sla_target.obj");
    expect(t.toTerraformAttributes().scenario_id).toBe(s.idToken);
    expect(t.toTerraformConfig().resource?.pathly_sla_target?.obj?.objective_pct).toBe(
      99.9,
    );
  });
});

describe("PathlyApp / Client", () => {
  it("synths a full stack and toJSON", () => {
    const app = new PathlyApp()
      .withProvider({})
      .withProvider({ versionConstraint: "~> 0.1" }, "pathly");

    const checkout = app.addScenario("checkout", {
      name: "Checkout",
      url: "https://shop.example.com/cart",
      intervalSec: 60,
      severity: "critical",
    });
    app.addWebhook("alerts", { url: "https://hooks.example.com/pathly" });
    app.addMaintenanceWindow("backup", {
      weekday: 7,
      startMinute: 180,
      durationMin: 120,
    });
    app.addSlaTarget("objective", {
      scenarioId: checkout.idToken,
      objectivePct: 99.9,
      windowDays: 30,
    });

    const synth = app.synth();
    expect(synth.resource?.pathly_scenario?.checkout).toBeDefined();
    expect(synth.resource?.pathly_webhook?.alerts).toBeDefined();
    expect(synth.resource?.pathly_maintenance_window?.backup).toBeDefined();
    expect(synth.resource?.pathly_sla_target?.objective).toBeDefined();

    const json = JSON.parse(app.toJSON());
    expect(json.terraform.required_providers.pathly.source).toBe(PATHLY_PROVIDER_SOURCE);
  });

  it("synths provider-only when no resources", () => {
    const app = new Client();
    const synth = app.synth();
    expect(synth.resource).toEqual({});
  });

  it("Client is an alias of PathlyApp", () => {
    expect(Client).toBe(PathlyApp);
  });
});

describe("package exports", () => {
  it("re-exports builders and constructs", () => {
    expect(pkg.PATHLY_PROVIDER_SOURCE).toBe("pathlyhq/pathly");
    expect(typeof pkg.buildScenarioAttributes).toBe("function");
    expect(typeof pkg.assembleTerraformConfig).toBe("function");
    expect(typeof pkg.mergeTerraformConfig).toBe("function");
    expect(pkg.PathlyApp).toBe(PathlyApp);
    expect(pkg.Scenario).toBe(Scenario);
    expect(pkg.Webhook).toBe(Webhook);
    expect(pkg.MaintenanceWindow).toBe(MaintenanceWindow);
    expect(pkg.SlaTarget).toBe(SlaTarget);
    expect(pkg.PathlyProvider).toBe(PathlyProvider);
    expect(pkg.Client).toBe(Client);
  });
});

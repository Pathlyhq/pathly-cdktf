/**
 * Example: synthesize Pathly Terraform JSON with @pathlyhq/cdktf.
 *
 * Auth (required before apply):
 *   export PATHLY_API_TOKEN="sp_…"
 *
 * Run from package root after `npm run build`:
 *   npx tsx examples/typescript/main.ts
 *
 * When online, you can also wire cdktf.json → `cdktf get` for generated
 * provider bindings and keep using the same attribute shapes.
 */

import {
  PathlyApp,
  type PathlyTerraformConfig,
} from "../../src/index.js";

function main(): PathlyTerraformConfig {
  const app = new PathlyApp().withProvider({});

  const checkout = app.addScenario("checkout", {
    name: "Checkout funnel",
    url: "https://shop.example.com/cart",
    intervalSec: 60,
    expectText: "Your cart",
    maxLatencyMs: 1500,
    severity: "critical",
    folder: "Shop",
    tags: ["prod", "payment"],
    runbook: "https://wiki.example.com/ops/checkout-unavailable",
  });

  app.addScenario("home", {
    name: "Home page",
    url: "https://shop.example.com/",
    intervalSec: 300,
    expectText: "Our products",
    severity: "major",
    folder: "Shop",
    tags: ["prod"],
  });

  app.addSlaTarget("checkout_sla", {
    scenarioId: checkout.idToken,
    name: "Checkout funnel — 99.9 %",
    objectivePct: 99.9,
    windowDays: 30,
    excludeMaintenance: true,
    warnAtBudgetRatio: 0.8,
  });

  app.addMaintenanceWindow("backup", {
    weekday: 7,
    startMinute: 180,
    durationMin: 120,
    reason: "Weekly backup",
  });

  app.addWebhook("alerts", {
    url: "https://hooks.example.com/pathly",
    events: ["run.failed", "run.recovered"],
  });

  return app.synth();
}

const config = main();
console.log(JSON.stringify(config, null, 2));

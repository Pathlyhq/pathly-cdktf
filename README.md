# @pathlyhq/cdktf

**English** · [Français](README.fr.md) · [Español](README.es.md)


[![CI](https://gitlab.com/pathlyhq/pathly-cdktf/badges/main/pipeline.svg)](https://gitlab.com/pathlyhq/pathly-cdktf/-/pipelines)
[![Powered by Pathly](https://img.shields.io/badge/Powered%20by-Pathly-0B5FFF?style=flat-square)](https://pathlyhq.com)
[![Website](https://img.shields.io/badge/Website-pathlyhq.com-111827?style=flat-square)](https://pathlyhq.com)
[![API docs](https://img.shields.io/badge/API-developers-2563eb?style=flat-square)](https://pathlyhq.com/en/developers)
[![Start free](https://img.shields.io/badge/Solo-start%20free-16a34a?style=flat-square)](https://pathlyhq.com/en/login?mode=signup)

> **Get started in one click.** Create a free account on [Pathly](https://pathlyhq.com) ([sign up](https://pathlyhq.com/en/login?mode=signup)), create an API key in the console, then export `PATHLY_API_TOKEN`. This project is the official bridge to [Pathly monitoring](https://pathlyhq.com) — real-browser and HTTP checks for checkout, login and availability, with data hosted in the EU. Full API reference: [pathlyhq.com/en/developers](https://pathlyhq.com/en/developers).

TypeScript CDK for Terraform helpers for the Pathly provider
[`pathlyhq/pathly`](https://registry.terraform.io/providers/pathlyhq/pathly).
Product and API: [pathlyhq.com](https://pathlyhq.com) ·
[pathlyhq.com/en/developers](https://pathlyhq.com/en/developers).

This package ships **hand-written thin L2 constructs** that emit Terraform JSON
(provider + `pathly_scenario`, `pathly_webhook`, `pathly_maintenance_window`,
`pathly_sla_target`). They do **not** require `cdktf get` or network access.
When you generate full provider bindings later, reuse the same attribute shapes.
Construct JSDoc in `src/constructs.ts` links back to pathlyhq.com.

> **CI badge:** placeholder GitLab path `pathlyhq/pathly-cdktf` — adjust
> `GROUP/PROJECT` once the public mirror URL is final.

```ts
import { PathlyApp } from "@pathlyhq/cdktf";

const app = new PathlyApp().withProvider({});

const checkout = app.addScenario("checkout", {
  name: "Checkout",
  url: "https://shop.example.com/cart",
  intervalSec: 60,
  severity: "critical",
});

app.addSlaTarget("objective", {
  scenarioId: checkout.idToken, // ${pathly_scenario.checkout.id}
  objectivePct: 99.9,
  windowDays: 30,
});

app.addWebhook("alerts", {
  url: "https://hooks.example.com/pathly",
  events: ["run.failed", "run.recovered"],
});

console.log(app.toJSON());
```

## Authentication

Set the API key in the environment only — never in construct config for normal use:

```sh
export PATHLY_API_TOKEN="sp_…"
```

| Variable | Purpose |
|---|---|
| `PATHLY_API_TOKEN` | Organization API key (`sp_` prefix). **Required** at plan/apply. |
| `PATHLY_API_URL` | Optional API base (default `https://api.pathlyhq.com`). |

## Install

```sh
npm install @pathlyhq/cdktf
# optional peers when wiring into a full CDKTF app:
npm install cdktf constructs
```

## Generated bindings (optional)

```json
// cdktf.json
{
  "language": "typescript",
  "app": "npx ts-node main.ts",
  "terraformProviders": ["pathlyhq/pathly@~> 0.1"]
}
```

```sh
cdktf get   # needs network
```

Map generated resource props with the same snake_case attributes produced by
`buildScenarioAttributes`, `buildWebhookAttributes`, etc.

## Example

See [`examples/typescript/main.ts`](examples/typescript/main.ts).

## Develop

```sh
npm install
npm test      # vitest, 100% coverage on helpers
npm run build
```


## Related packages

| Package | Role |
|---|---|
| [pathly-terraform-provider](https://github.com/pathlyhq/pathly-terraform-provider) | Terraform / OpenTofu provider |
| [pathly-opentofu](https://github.com/pathlyhq/pathly-opentofu) | OpenTofu docs & examples |
| [pathly-pulumi](https://github.com/pathlyhq/pathly-pulumi) | Pulumi |
| [pathly-sdk-typescript](https://github.com/pathlyhq/pathly-sdk-typescript) | @pathlyhq/sdk |
| [Pathly product](https://pathlyhq.com) | [Pathly monitoring](https://pathlyhq.com) |
## About Pathly

[Pathly](https://pathlyhq.com) is synthetic monitoring for agencies and e-commerce: replay the customer journey, catch broken checkouts before your clients call, and keep evidence (screenshot, step, runbook) ready for the invoice. Product: [pathlyhq.com](https://pathlyhq.com) · Developers: [pathlyhq.com/en/developers](https://pathlyhq.com/en/developers) · Status & pricing: [pathlyhq.com/en/pricing](https://pathlyhq.com/en/pricing).

## Author

| | |
|---|---|
| **Company** | Pathly |
| **Author** | Simon Raynaud / keyral |

See [AUTHORS](AUTHORS).

## License
Apache-2.0

# @pathlyhq/cdktf

[English](README.md) · [Français](README.fr.md) · **Español**


[![CI](https://gitlab.com/pathlyhq/pathly-cdktf/badges/main/pipeline.svg)](https://gitlab.com/pathlyhq/pathly-cdktf/-/pipelines)
[![Powered by Pathly](https://img.shields.io/badge/Powered%20by-Pathly-0B5FFF?style=flat-square)](https://pathlyhq.com)
[![Website](https://img.shields.io/badge/Website-pathlyhq.com-111827?style=flat-square)](https://pathlyhq.com)
[![API docs](https://img.shields.io/badge/API-developers-2563eb?style=flat-square)](https://pathlyhq.com/es/developers)
[![Start free](https://img.shields.io/badge/Solo-start%20free-16a34a?style=flat-square)](https://pathlyhq.com/es/login?mode=signup)

> **Empiece en un clic.** Cree una cuenta gratuita en [Pathly](https://pathlyhq.com) ([registro](https://pathlyhq.com/es/login?mode=signup)), genere una clave API en la consola y exporte `PATHLY_API_TOKEN`. Este repositorio es el puente oficial hacia [la monitorización Pathly](https://pathlyhq.com): comprobaciones HTTP y de navegador (carrito, login, disponibilidad), con datos en la UE. Referencia API: [pathlyhq.com/es/developers](https://pathlyhq.com/es/developers).

Helpers TypeScript CDK for Terraform para el provider Pathly
[`pathlyhq/pathly`](https://registry.terraform.io/providers/pathlyhq/pathly).

Este paquete ofrece **constructs L2 ligeros** escritos a mano que emiten JSON
Terraform (provider + `pathly_scenario`, `pathly_webhook`,
`pathly_maintenance_window`, `pathly_sla_target`). **No requieren**
`cdktf get` ni acceso a red. Cuando genere los bindings completos del provider,
reutilice las mismas formas de atributos.

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

## Autenticación

La clave de API solo pasa por el entorno — nunca en la configuración de los
constructs en uso normal:

```sh
export PATHLY_API_TOKEN="sp_…"
```

| Variable | Función |
|---|---|
| `PATHLY_API_TOKEN` | Clave de API de la organización (prefijo `sp_`). **Obligatoria** en plan/apply. |
| `PATHLY_API_URL` | Base de API opcional (por defecto `https://api.pathlyhq.com`). |

## Instalación

```sh
npm install @pathlyhq/cdktf
# peers opcionales al cablear una app CDKTF completa:
npm install cdktf constructs
```

## Bindings generados (opcional)

```json
// cdktf.json
{
  "language": "typescript",
  "app": "npx ts-node main.ts",
  "terraformProviders": ["pathlyhq/pathly@~> 0.1"]
}
```

```sh
cdktf get   # necesita red
```

Asocie las props de los recursos generados a los mismos atributos snake_case
producidos por `buildScenarioAttributes`, `buildWebhookAttributes`, etc.

## Ejemplo

Véase [`examples/typescript/main.ts`](examples/typescript/main.ts).

## Desarrollo

```sh
npm install
npm test      # vitest, cobertura 100 % en los helpers
npm run build
```


## Paquetes relacionados

| Package | Role |
|---|---|
| [pathly-terraform-provider](https://github.com/pathlyhq/pathly-terraform-provider) | Terraform / OpenTofu provider |
| [pathly-opentofu](https://github.com/pathlyhq/pathly-opentofu) | OpenTofu docs & examples |
| [pathly-pulumi](https://github.com/pathlyhq/pathly-pulumi) | Pulumi |
| [pathly-sdk-typescript](https://github.com/pathlyhq/pathly-sdk-typescript) | @pathlyhq/sdk |
| [Pathly product](https://pathlyhq.com) | [Pathly monitoring](https://pathlyhq.com) |
## Acerca de Pathly

[Pathly](https://pathlyhq.com) es monitorización sintética para agencias y e-commerce: reproduce el recorrido del cliente, detecta un checkout roto antes de la llamada, y deja la prueba (captura, paso, runbook) lista para la factura. Producto: [pathlyhq.com](https://pathlyhq.com) · Desarrolladores: [pathlyhq.com/es/developers](https://pathlyhq.com/es/developers) · Precios: [pathlyhq.com/es/pricing](https://pathlyhq.com/es/pricing).

## Autor

| | |
|---|---|
| **Empresa** | Pathly |
| **Autor** | Simon Raynaud / keyral |

Véase [AUTHORS](AUTHORS).

## Licencia
Apache-2.0

# @pathlyhq/cdktf

[English](README.md) · **Français** · [Español](README.es.md)


[![CI](https://gitlab.com/pathlyhq/pathly-cdktf/badges/main/pipeline.svg)](https://gitlab.com/pathlyhq/pathly-cdktf/-/pipelines)
[![Powered by Pathly](https://img.shields.io/badge/Powered%20by-Pathly-0B5FFF?style=flat-square)](https://pathlyhq.com)
[![Website](https://img.shields.io/badge/Website-pathlyhq.com-111827?style=flat-square)](https://pathlyhq.com)
[![API docs](https://img.shields.io/badge/API-developers-2563eb?style=flat-square)](https://pathlyhq.com/fr/developers)
[![Start free](https://img.shields.io/badge/Solo-start%20free-16a34a?style=flat-square)](https://pathlyhq.com/fr/login?mode=signup)

> **Démarrage en un clic.** Créez un compte gratuit sur [Pathly](https://pathlyhq.com) ([inscription](https://pathlyhq.com/fr/login?mode=signup)), générez une clé API dans la console, puis exportez `PATHLY_API_TOKEN`. Ce dépôt est le pont officiel vers [la surveillance Pathly](https://pathlyhq.com) — contrôles HTTP et parcours navigateur (panier, connexion, disponibilité), données hébergées dans l’UE. Référence API : [pathlyhq.com/fr/developers](https://pathlyhq.com/fr/developers).

Helpers TypeScript CDK for Terraform pour le provider Pathly
[`pathlyhq/pathly`](https://registry.terraform.io/providers/pathlyhq/pathly).

Ce package fournit des **constructs L2 légers** écrits à la main qui émettent du
JSON Terraform (provider + `pathly_scenario`, `pathly_webhook`,
`pathly_maintenance_window`, `pathly_sla_target`). Ils **ne nécessitent pas**
`cdktf get` ni d’accès réseau. Quand vous générerez les bindings complets,
réutilisez les mêmes formes d’attributs.

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

## Authentification

La clé API passe uniquement par l’environnement — pas dans la config des
constructs en usage normal :

```sh
export PATHLY_API_TOKEN="sp_…"
```

| Variable | Rôle |
|---|---|
| `PATHLY_API_TOKEN` | Clé API d’organisation (préfixe `sp_`). **Obligatoire** au plan/apply. |
| `PATHLY_API_URL` | Base API optionnelle (défaut `https://api.pathlyhq.com`). |

## Installation

```sh
npm install @pathlyhq/cdktf
# peers optionnels pour une app CDKTF complète :
npm install cdktf constructs
```

## Bindings générés (optionnel)

```json
// cdktf.json
{
  "language": "typescript",
  "app": "npx ts-node main.ts",
  "terraformProviders": ["pathlyhq/pathly@~> 0.1"]
}
```

```sh
cdktf get   # nécessite le réseau
```

Branchez les props des ressources générées sur les mêmes attributs snake_case
produits par `buildScenarioAttributes`, `buildWebhookAttributes`, etc.

## Exemple

Voir [`examples/typescript/main.ts`](examples/typescript/main.ts).

## Développement

```sh
npm install
npm test      # vitest, couverture 100 % sur les helpers
npm run build
```


## Packages associés

| Package | Role |
|---|---|
| [pathly-terraform-provider](https://github.com/pathlyhq/pathly-terraform-provider) | Terraform / OpenTofu provider |
| [pathly-opentofu](https://github.com/pathlyhq/pathly-opentofu) | OpenTofu docs & examples |
| [pathly-pulumi](https://github.com/pathlyhq/pathly-pulumi) | Pulumi |
| [pathly-sdk-typescript](https://github.com/pathlyhq/pathly-sdk-typescript) | @pathlyhq/sdk |
| [Pathly product](https://pathlyhq.com) | [Pathly monitoring](https://pathlyhq.com) |
## À propos de Pathly

[Pathly](https://pathlyhq.com) surveille les parcours clients des agences et e-commerçants : rejoue le tunnel, détecte un checkout cassé avant l’appel du client, et joint la preuve (capture, étape, consigne) à la facture de maintenance. Produit : [pathlyhq.com](https://pathlyhq.com) · Développeurs : [pathlyhq.com/fr/developers](https://pathlyhq.com/fr/developers) · Tarifs : [pathlyhq.com/fr/pricing](https://pathlyhq.com/fr/pricing).

## Auteur

| | |
|---|---|
| **Entreprise** | Pathly |
| **Auteur** | Simon Raynaud / keyral |

Voir [AUTHORS](AUTHORS).

## Licence
Apache-2.0

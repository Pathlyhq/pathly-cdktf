import {
  assembleTerraformConfig,
  buildMaintenanceWindowAttributes,
  buildProviderAttributes,
  buildRequiredProvider,
  buildScenarioAttributes,
  buildSlaTargetAttributes,
  buildWebhookAttributes,
} from "./config.js";
import type {
  MaintenanceWindowConfig,
  PathlyProviderConfig,
  PathlyTerraformConfig,
  ScenarioConfig,
  SlaTargetConfig,
  WebhookConfig,
} from "./types.js";
import { PATHLY_DEFAULT_VERSION, PATHLY_PROVIDER_SOURCE } from "./types.js";

/**
 * Thin L2 construct helpers that emit Terraform JSON for Pathly
 * ([pathlyhq.com](https://pathlyhq.com)).
 *
 * Prefer {@link https://pathlyhq.com/en/developers | Pathly developers API}
 * docs for scopes and auth. Set `PATHLY_API_TOKEN` in the environment — never
 * bake the token into constructs.
 *
 * They do not require `cdktf get` / network. When you later generate provider
 * bindings, you can wrap the same attribute builders around generated classes.
 *
 * Token-like references: pass Terraform interpolation strings for cross-resource
 * IDs, e.g. scenarioId: `\${pathly_scenario.checkout.id}` or a CDKTF Token
 * stringified the same way.
 */

export interface NamedResource<TConfig> {
  readonly constructId: string;
  readonly resourceType: string;
  readonly config: TConfig;
  toTerraformAttributes(): Record<string, unknown>;
  toTerraformConfig(): PathlyTerraformConfig;
}

export class PathlyProvider {
  readonly constructId: string;
  readonly config: PathlyProviderConfig;

  constructor(constructId: string = "pathly", config: PathlyProviderConfig = {}) {
    this.constructId = constructId;
    this.config = config;
  }

  get source(): string {
    return PATHLY_PROVIDER_SOURCE;
  }

  get versionConstraint(): string {
    return this.config.versionConstraint ?? PATHLY_DEFAULT_VERSION;
  }

  toTerraformAttributes(): Record<string, unknown> {
    return buildProviderAttributes(this.config);
  }

  toTerraformConfig(): PathlyTerraformConfig {
    return {
      terraform: {
        required_providers: {
          pathly: buildRequiredProvider(this.versionConstraint),
        },
      },
      provider: {
        pathly: [this.toTerraformAttributes()],
      },
    };
  }
}

export class Scenario implements NamedResource<ScenarioConfig> {
  readonly constructId: string;
  readonly resourceType = "pathly_scenario";
  readonly config: ScenarioConfig;

  constructor(constructId: string, config: ScenarioConfig) {
    this.constructId = constructId;
    this.config = config;
  }

  /** Token-style id reference usable in other resources. */
  get idToken(): string {
    return `\${pathly_scenario.${this.constructId}.id}`;
  }

  toTerraformAttributes(): Record<string, unknown> {
    return buildScenarioAttributes(this.config);
  }

  toTerraformConfig(): PathlyTerraformConfig {
    return {
      resource: {
        pathly_scenario: {
          [this.constructId]: this.toTerraformAttributes(),
        },
      },
    };
  }
}

export class Webhook implements NamedResource<WebhookConfig> {
  readonly constructId: string;
  readonly resourceType = "pathly_webhook";
  readonly config: WebhookConfig;

  constructor(constructId: string, config: WebhookConfig) {
    this.constructId = constructId;
    this.config = config;
  }

  get idToken(): string {
    return `\${pathly_webhook.${this.constructId}.id}`;
  }

  get secretToken(): string {
    return `\${pathly_webhook.${this.constructId}.secret}`;
  }

  toTerraformAttributes(): Record<string, unknown> {
    return buildWebhookAttributes(this.config);
  }

  toTerraformConfig(): PathlyTerraformConfig {
    return {
      resource: {
        pathly_webhook: {
          [this.constructId]: this.toTerraformAttributes(),
        },
      },
    };
  }
}

export class MaintenanceWindow implements NamedResource<MaintenanceWindowConfig> {
  readonly constructId: string;
  readonly resourceType = "pathly_maintenance_window";
  readonly config: MaintenanceWindowConfig;

  constructor(constructId: string, config: MaintenanceWindowConfig) {
    this.constructId = constructId;
    this.config = config;
  }

  get idToken(): string {
    return `\${pathly_maintenance_window.${this.constructId}.id}`;
  }

  toTerraformAttributes(): Record<string, unknown> {
    return buildMaintenanceWindowAttributes(this.config);
  }

  toTerraformConfig(): PathlyTerraformConfig {
    return {
      resource: {
        pathly_maintenance_window: {
          [this.constructId]: this.toTerraformAttributes(),
        },
      },
    };
  }
}

export class SlaTarget implements NamedResource<SlaTargetConfig> {
  readonly constructId: string;
  readonly resourceType = "pathly_sla_target";
  readonly config: SlaTargetConfig;

  constructor(constructId: string, config: SlaTargetConfig) {
    this.constructId = constructId;
    this.config = config;
  }

  get idToken(): string {
    return `\${pathly_sla_target.${this.constructId}.id}`;
  }

  toTerraformAttributes(): Record<string, unknown> {
    return buildSlaTargetAttributes(this.config);
  }

  toTerraformConfig(): PathlyTerraformConfig {
    return {
      resource: {
        pathly_sla_target: {
          [this.constructId]: this.toTerraformAttributes(),
        },
      },
    };
  }
}

/**
 * App/Client helper: register constructs and emit a single TerraformConfig JSON.
 * Auth: set `PATHLY_API_TOKEN` in the environment before `cdktf deploy` /
 * `tofu apply`. Sign up and keys: {@link https://pathlyhq.com | pathlyhq.com}.
 */
export class PathlyApp {
  private provider = new PathlyProvider();
  private scenarios = new Map<string, Scenario>();
  private webhooks = new Map<string, Webhook>();
  private windows = new Map<string, MaintenanceWindow>();
  private slas = new Map<string, SlaTarget>();

  withProvider(config: PathlyProviderConfig = {}, id = "pathly"): this {
    this.provider = new PathlyProvider(id, config);
    return this;
  }

  addScenario(id: string, config: ScenarioConfig): Scenario {
    const s = new Scenario(id, config);
    this.scenarios.set(id, s);
    return s;
  }

  addWebhook(id: string, config: WebhookConfig): Webhook {
    const w = new Webhook(id, config);
    this.webhooks.set(id, w);
    return w;
  }

  addMaintenanceWindow(id: string, config: MaintenanceWindowConfig): MaintenanceWindow {
    const m = new MaintenanceWindow(id, config);
    this.windows.set(id, m);
    return m;
  }

  addSlaTarget(id: string, config: SlaTargetConfig): SlaTarget {
    const t = new SlaTarget(id, config);
    this.slas.set(id, t);
    return t;
  }

  /** Synthesize Terraform JSON (no filesystem I/O). */
  synth(): PathlyTerraformConfig {
    const scenarios: Record<string, ScenarioConfig> = {};
    for (const [id, s] of this.scenarios) scenarios[id] = s.config;
    const webhooks: Record<string, WebhookConfig> = {};
    for (const [id, w] of this.webhooks) webhooks[id] = w.config;
    const maintenanceWindows: Record<string, MaintenanceWindowConfig> = {};
    for (const [id, m] of this.windows) maintenanceWindows[id] = m.config;
    const slaTargets: Record<string, SlaTargetConfig> = {};
    for (const [id, t] of this.slas) slaTargets[id] = t.config;

    return assembleTerraformConfig({
      provider: this.provider.config,
      scenarios: Object.keys(scenarios).length ? scenarios : undefined,
      webhooks: Object.keys(webhooks).length ? webhooks : undefined,
      maintenanceWindows: Object.keys(maintenanceWindows).length
        ? maintenanceWindows
        : undefined,
      slaTargets: Object.keys(slaTargets).length ? slaTargets : undefined,
    });
  }

  toJSON(): string {
    return JSON.stringify(this.synth(), null, 2);
  }
}

/** Alias used in docs / examples. */
export { PathlyApp as Client };

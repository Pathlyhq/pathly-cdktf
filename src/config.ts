import type {
  MaintenanceWindowConfig,
  PathlyProviderConfig,
  PathlyTerraformConfig,
  ScenarioConfig,
  SlaTargetConfig,
  TerraformRequiredProvider,
  WebhookConfig,
} from "./types.js";
import { PATHLY_DEFAULT_VERSION, PATHLY_PROVIDER_SOURCE } from "./types.js";

function omitUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

/** required_providers entry for pathlyhq/pathly. */
export function buildRequiredProvider(
  versionConstraint: string = PATHLY_DEFAULT_VERSION,
): TerraformRequiredProvider {
  return {
    source: PATHLY_PROVIDER_SOURCE,
    version: versionConstraint,
  };
}

/**
 * Provider block attributes. Empty object is the recommended form:
 * token comes from PATHLY_API_TOKEN.
 */
export function buildProviderAttributes(
  config: PathlyProviderConfig = {},
): Record<string, unknown> {
  return omitUndefined({
    api_token: config.apiToken,
    api_url: config.apiUrl,
  });
}

/** Terraform JSON attributes for pathly_scenario. */
export function buildScenarioAttributes(config: ScenarioConfig): Record<string, unknown> {
  if (!config.name) {
    throw new Error("ScenarioConfig.name is required");
  }
  if (config.intervalSec === undefined || config.intervalSec === null) {
    throw new Error("ScenarioConfig.intervalSec is required");
  }
  return omitUndefined({
    name: config.name,
    url: config.url,
    interval_sec: config.intervalSec,
    type: config.type,
    expect_text: config.expectText,
    expected_status: config.expectedStatus,
    max_latency_ms: config.maxLatencyMs,
    severity: config.severity,
    folder: config.folder,
    tags: config.tags,
    runbook: config.runbook,
    viewport: config.viewport,
    locale: config.locale,
    scenario_timezone: config.scenarioTimezone,
    click_delay_ms: config.clickDelayMs,
    steps: config.steps,
  });
}

/** Terraform JSON attributes for pathly_webhook. */
export function buildWebhookAttributes(config: WebhookConfig): Record<string, unknown> {
  if (!config.url) {
    throw new Error("WebhookConfig.url is required");
  }
  if (!config.url.startsWith("https://")) {
    throw new Error("WebhookConfig.url must use https://");
  }
  return omitUndefined({
    url: config.url,
    events: config.events,
  });
}

/** Terraform JSON attributes for pathly_maintenance_window. */
export function buildMaintenanceWindowAttributes(
  config: MaintenanceWindowConfig,
): Record<string, unknown> {
  const weekly =
    config.weekday !== undefined ||
    config.startMinute !== undefined ||
    config.durationMin !== undefined;
  const oneOff = config.startsAt !== undefined || config.endsAt !== undefined;

  if (weekly && oneOff) {
    throw new Error(
      "MaintenanceWindowConfig: weekly (weekday/startMinute/durationMin) and one-off (startsAt/endsAt) are mutually exclusive",
    );
  }
  if (!weekly && !oneOff) {
    throw new Error(
      "MaintenanceWindowConfig needs either weekly fields or startsAt/endsAt",
    );
  }
  if (oneOff && (config.startsAt === undefined || config.endsAt === undefined)) {
    throw new Error("One-off MaintenanceWindowConfig needs both startsAt and endsAt");
  }
  if (weekly) {
    if (
      config.weekday === undefined ||
      config.startMinute === undefined ||
      config.durationMin === undefined
    ) {
      throw new Error(
        "Weekly MaintenanceWindowConfig needs weekday, startMinute and durationMin",
      );
    }
  }

  return omitUndefined({
    scenario_id: config.scenarioId,
    weekday: config.weekday,
    start_minute: config.startMinute,
    duration_min: config.durationMin,
    starts_at: config.startsAt,
    ends_at: config.endsAt,
    reason: config.reason,
  });
}

/** Terraform JSON attributes for pathly_sla_target. */
export function buildSlaTargetAttributes(config: SlaTargetConfig): Record<string, unknown> {
  if (config.objectivePct === undefined || config.objectivePct === null) {
    throw new Error("SlaTargetConfig.objectivePct is required");
  }
  if (config.windowDays === undefined || config.windowDays === null) {
    throw new Error("SlaTargetConfig.windowDays is required");
  }
  if (config.objectivePct < 50 || config.objectivePct > 100) {
    throw new Error("SlaTargetConfig.objectivePct must be between 50 and 100");
  }
  if (config.windowDays < 1 || config.windowDays > 365) {
    throw new Error("SlaTargetConfig.windowDays must be between 1 and 365");
  }

  return omitUndefined({
    scenario_id: config.scenarioId,
    name: config.name,
    objective_pct: config.objectivePct,
    window_days: config.windowDays,
    exclude_maintenance: config.excludeMaintenance,
    warn_at_budget_ratio: config.warnAtBudgetRatio,
    enabled: config.enabled,
  });
}

/**
 * Merge helper pieces into a Terraform JSON document.
 * Useful without running `cdktf get` (no network).
 */
export function assembleTerraformConfig(parts: {
  provider?: PathlyProviderConfig;
  scenarios?: Record<string, ScenarioConfig>;
  webhooks?: Record<string, WebhookConfig>;
  maintenanceWindows?: Record<string, MaintenanceWindowConfig>;
  slaTargets?: Record<string, SlaTargetConfig>;
}): PathlyTerraformConfig {
  const version = parts.provider?.versionConstraint ?? PATHLY_DEFAULT_VERSION;
  const cfg: PathlyTerraformConfig = {
    terraform: {
      required_providers: {
        pathly: buildRequiredProvider(version),
      },
    },
    provider: {
      pathly: [buildProviderAttributes(parts.provider ?? {})],
    },
    resource: {},
  };

  if (parts.scenarios && Object.keys(parts.scenarios).length > 0) {
    cfg.resource!.pathly_scenario = {};
    for (const [id, sc] of Object.entries(parts.scenarios)) {
      cfg.resource!.pathly_scenario[id] = buildScenarioAttributes(sc);
    }
  }
  if (parts.webhooks && Object.keys(parts.webhooks).length > 0) {
    cfg.resource!.pathly_webhook = {};
    for (const [id, wh] of Object.entries(parts.webhooks)) {
      cfg.resource!.pathly_webhook[id] = buildWebhookAttributes(wh);
    }
  }
  if (parts.maintenanceWindows && Object.keys(parts.maintenanceWindows).length > 0) {
    cfg.resource!.pathly_maintenance_window = {};
    for (const [id, mw] of Object.entries(parts.maintenanceWindows)) {
      cfg.resource!.pathly_maintenance_window[id] = buildMaintenanceWindowAttributes(mw);
    }
  }
  if (parts.slaTargets && Object.keys(parts.slaTargets).length > 0) {
    cfg.resource!.pathly_sla_target = {};
    for (const [id, sla] of Object.entries(parts.slaTargets)) {
      cfg.resource!.pathly_sla_target[id] = buildSlaTargetAttributes(sla);
    }
  }

  return cfg;
}

/** Deep-merge two Terraform JSON fragments (resources keyed by local name). */
export function mergeTerraformConfig(
  base: PathlyTerraformConfig,
  extra: PathlyTerraformConfig,
): PathlyTerraformConfig {
  return {
    terraform: {
      required_providers: {
        ...base.terraform?.required_providers,
        ...extra.terraform?.required_providers,
      },
    },
    provider: {
      pathly: [
        ...(base.provider?.pathly ?? []),
        ...(extra.provider?.pathly ?? []),
      ],
    },
    resource: {
      pathly_scenario: {
        ...base.resource?.pathly_scenario,
        ...extra.resource?.pathly_scenario,
      },
      pathly_webhook: {
        ...base.resource?.pathly_webhook,
        ...extra.resource?.pathly_webhook,
      },
      pathly_maintenance_window: {
        ...base.resource?.pathly_maintenance_window,
        ...extra.resource?.pathly_maintenance_window,
      },
      pathly_sla_target: {
        ...base.resource?.pathly_sla_target,
        ...extra.resource?.pathly_sla_target,
      },
    },
  };
}

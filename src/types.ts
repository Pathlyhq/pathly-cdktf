/**
 * Shared config types for Pathly CDKTF helpers.
 * Auth is environment-only: PATHLY_API_TOKEN (optional PATHLY_API_URL).
 */

/** CDKTF-style token placeholder (string | number reference). */
export type TokenLike = string | number | boolean | null | undefined;

export interface PathlyProviderConfig {
  /** Prefer PATHLY_API_TOKEN. Only set here for advanced cases (lands in state). */
  apiToken?: string;
  /** Prefer PATHLY_API_URL. Defaults to https://api.pathlyhq.com when omitted. */
  apiUrl?: string;
  /** Terraform / OpenTofu version constraint for required_providers. */
  versionConstraint?: string;
}

export interface ScenarioStep {
  op: string;
  url?: string;
  selector?: string;
  value?: string;
  text?: string;
  [key: string]: TokenLike;
}

export interface ScenarioConfig {
  name: string;
  url?: string;
  intervalSec: number;
  type?: "http" | "browser" | string;
  expectText?: string;
  expectedStatus?: number;
  maxLatencyMs?: number;
  severity?: "critical" | "major" | "minor" | string;
  folder?: string;
  tags?: string[];
  runbook?: string;
  viewport?: string;
  locale?: string;
  scenarioTimezone?: string;
  clickDelayMs?: number;
  steps?: ScenarioStep[];
}

export interface WebhookConfig {
  url: string;
  events?: string[];
}

export interface MaintenanceWindowConfig {
  scenarioId?: string;
  weekday?: number;
  startMinute?: number;
  durationMin?: number;
  startsAt?: string;
  endsAt?: string;
  reason?: string;
}

export interface SlaTargetConfig {
  objectivePct: number;
  windowDays: number;
  scenarioId?: string;
  name?: string;
  excludeMaintenance?: boolean;
  warnAtBudgetRatio?: number;
  enabled?: boolean;
}

export interface TerraformRequiredProvider {
  source: string;
  version: string;
}

/** Minimal Terraform JSON shape emitted by helpers (partial TerraformConfig). */
export interface PathlyTerraformConfig {
  terraform?: {
    required_providers?: Record<string, TerraformRequiredProvider>;
  };
  provider?: {
    pathly?: Array<Record<string, unknown>>;
  };
  resource?: {
    pathly_scenario?: Record<string, Record<string, unknown>>;
    pathly_webhook?: Record<string, Record<string, unknown>>;
    pathly_maintenance_window?: Record<string, Record<string, unknown>>;
    pathly_sla_target?: Record<string, Record<string, unknown>>;
  };
}

export const PATHLY_PROVIDER_SOURCE = "pathlyhq/pathly" as const;
export const PATHLY_DEFAULT_VERSION = "~> 0.1" as const;

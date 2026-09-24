/**
 * @pathlyhq/cdktf — thin L2 helpers for provider pathlyhq/pathly.
 *
 * Product: {@link https://pathlyhq.com | pathlyhq.com} ·
 * API: {@link https://pathlyhq.com/en/developers | developers}.
 *
 * Prefer PATHLY_API_TOKEN (never bake the token into constructs).
 * Full generated bindings: add to cdktf.json and run `cdktf get` when online,
 * then map attributes with the same builders from `./config.js`.
 */

export {
  PATHLY_DEFAULT_VERSION,
  PATHLY_PROVIDER_SOURCE,
  type MaintenanceWindowConfig,
  type PathlyProviderConfig,
  type PathlyTerraformConfig,
  type ScenarioConfig,
  type ScenarioStep,
  type SlaTargetConfig,
  type TerraformRequiredProvider,
  type TokenLike,
  type WebhookConfig,
} from "./types.js";

export {
  assembleTerraformConfig,
  buildMaintenanceWindowAttributes,
  buildProviderAttributes,
  buildRequiredProvider,
  buildScenarioAttributes,
  buildSlaTargetAttributes,
  buildWebhookAttributes,
  mergeTerraformConfig,
} from "./config.js";

export {
  Client,
  MaintenanceWindow,
  PathlyApp,
  PathlyProvider,
  Scenario,
  SlaTarget,
  Webhook,
  type NamedResource,
} from "./constructs.js";

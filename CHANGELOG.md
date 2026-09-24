# Changelog

## [0.1.0] — 2026-09-23

### Added

- `@pathlyhq/cdktf` thin L2 helpers: `PathlyProvider`, `Scenario`, `Webhook`,
  `MaintenanceWindow`, `SlaTarget`, plus `PathlyApp` / `Client`.
- Pure Terraform JSON builders (`build*Attributes`, `assembleTerraformConfig`).
- Auth documented via `PATHLY_API_TOKEN` only.
- Vitest unit tests with 100% coverage on construct helpers.
- TypeScript example under `examples/typescript/`.
- GitLab CI (install, test, build).
- Apache-2.0 license.

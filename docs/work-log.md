# EPF 7 - Work Log

This doc stores information of work done on ePBS builder. Development started in week 6 of EPF 7.

### Week 6

Tasks completed (with links): [`CLI-01`](https://github.com/krisoshea-eth/lodestar-eip-7732-builder-docs/blob/f5b241698ef387f58f0e22a8bc2920704050ece6/docs/implementation-plan.md#cli-01--add-packagesbuilder-and-the-lodestar-builder-command), [`SIGN-01`](https://github.com/krisoshea-eth/lodestar-eip-7732-builder-docs/blob/f5b241698ef387f58f0e22a8bc2920704050ece6/docs/implementation-plan.md#sign-01--add-one-local-builder-keystore-and-signer-boundary)

Features added:
 - Package scaffolding - basic dirs/files setup.
 - BuilderSigner - service for signing execution payload envelopes and bids with a secretkey loaded from keystore.
 - Keystore loading helper.
 - CLI options for `--beaconNodeUrl`, `--keystore`, `--keystorePassword` and new `--builderPubkey` (for verifying keystore pubkey).
 - Handlers + CLI / signing flow wiring with the main class.
 - Tests for keystore loading and envelope/bid signing.

Diff: https://github.com/ChainSafe/lodestar/compare/4001398810453c5c1b4abe8c06323a76d0ba592f...markolazic01:lodestar:30de4886dcc3d132b0e206e7f87c0551e4c77dff

### Week 7

Targeting: `API-01`

Changes made:
 - cleanup of previous weeks work
 - keystore loader rename
 - keypair parsing refactor - evades computing pk in multiple places throughout the flow
 - implement waitForGenesis
 - decided to duplicate waitForGenesis and applied 404 handling fix to validators version
- moved assertEqualParams (with NotEqualParamsError) to `@lodestar/config` so that builder can use it too (with tests and the following being moved as well)
- decided not to introduce 404 branch on `getGenesis()` in BN (it's a spec gap but not worth making elaborate changes)
- fixed CI failings
- moved the clock from @lodestar/validator to @lodestar/state-transition
- polar bear banner xD

Merged: [feat: builder initial setup #9758](https://github.com/ChainSafe/lodestar/pull/9758)

### Week 8

Targeting: `API-01` (continuation) `CLI-01` (filling what was missing)

Changes made:
- Extracts builder identity resolution to `identity.ts` and expands basic functionality into `resolveBuilderIdentity` and `getBuilderStatus`.
- Introduced `readiness.ts`, containing `waitForNodeReady` function which polls until the BN is synced and its EL is online + `logNodeVersion`.
- `BuilderStatusTracker` service for tracking builder status and balance.
- `--executionFeeRecipient` cli option
- Wiring for all features.

Opened a draft (Thursday):
- [feat(builder): beacon node readiness, builder identity resolution and execution fee recipient #9781](https://github.com/ChainSafe/lodestar/pull/9781)

Created [TEST-01] and [MET-01] tasks for tests and metrics to be in one place - they are drafty now but we can tighten them up later.

Reviewing: https://github.com/ChainSafe/lodestar/pull/9757

# EPF 7 - Weekly Work Log

This doc tracks weekly implementation, project-board, review, and coordination work for the Lodestar EIP-7732 Builder. It is deliberately lighter than the weekly write-ups and focuses on project movement after the proposal was accepted.

### Week 6

Kris:
 - Turned the accepted proposal into the implementation-plan draft: core outcome, definition of done, accepted decisions, milestone gates, Ready criteria, acceptance evidence, conditional packages, and upstream change-control rules.
 - Built the initial issue taxonomy for the Builder work, separating the first repeatable Builder loop from later PTC, payment, blob, reliability, integration, security, and handoff evidence.
 - Stood up the GitHub review surface for the plan and supporting docs, mirrored the proposal, plan, and living note, and opened the implementation-plan review with Nico and NC.
 - Kept tracking findings flowing into the Week 7 baseline audit instead of prematurely closing issues against a moving `unstable` target.

Marko:

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

Kris:
 - Worked through the implementation-plan review comment by comment, recorded dispositions, and folded accepted decisions into the plan and issue boundaries.
 - Tightened the issue contracts around the complete unsigned bid from the beacon node, Builder-owned fee recipient, production/publication timing split, head-change handling, API namespaces, validation ownership, and cache reuse.
 - Recorded Beacon API gaps directly in the implementation issues, especially the unsigned-bid namespace gap (#595) and bid-selection signal gap (#599), instead of treating them as permanent Lodestar-specific endpoints.
 - Kept the reviewed plan, issue boundaries, and Marko's first Builder package aligned so the v1.0 plan and upstream #9758 described the same implementation boundary.

Marko:

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

Kris:
 - Merged the implementation plan as v1.0, reconciled the GitHub/HackMD planning surfaces, refreshed the living technical note, and made GitHub canonical for the full plan.
 - Converted the plan into the Linear board and public GitHub Project mirror, expanding it into the full tracked backlog for the Lodestar team with ownership, dependencies, evidence fields, and reviewer-facing project views.
 - Reworked the backlog as implementation exposed the TEST-01 and MET-01 split, moving the tracked inventory from 44 to 46 issues across Linear and the GitHub mirror.
 - Preserved the proposer-equivocation scenario as a versioned Kurtosis test plan and kept the board aligned with current upstream work around #9781, #9757, v1.46.0-rc.0, and the moving Builder API boundary.

Marko:

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

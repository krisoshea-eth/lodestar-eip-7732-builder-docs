# EPF 7 - Weekly Work Log

This is the canonical chronological delivery log for the Lodestar EIP-7732 Builder. It tracks weekly implementation, project-board, review, and coordination movement from the accepted proposal onward. It is deliberately lighter than the fellows' full weekly write-ups. The implementation plan owns accepted scope and dependencies; the Living Technical Note owns current technical state, decisions, risks, and upstream watches.

### 2 September 2026 payload-attributes field implementation

- Added fork-only Lodestar draft [#80](https://github.com/krisoshea-eth/lodestar/pull/80) and [LOD-74](https://linear.app/kriso/issue/LOD-74/attr-impl-01-emit-post-gloas-forkchoice-hashes-in-payload-attributes) for the current beacon-APIs #638 `safe_block_hash` and `finalized_block_hash` contract.
- The draft updates the post-Gloas event type, populates both hashes from Lodestar fork choice, and verifies Gloas/Heze JSON plus producer behavior. It deliberately excludes trigger, FULL/EMPTY policy, deduplication, custody input, Builder consumption, and Engine topology.
- Validation passed: 15 focused tests, affected-package type checks, beacon-node dependency build, Biome, and `git diff --check`.
- Kept the implementation in Kris's fork as requested. No ChainSafe PR was created.
- Reconciled all 72 Linear issues and their GitHub project mirrors, including LOD-74 as In Progress under Gate B.

### 2 September 2026 architecture and lifecycle reconciliation

- Refreshed the comparison baseline against Lodestar `unstable` at `d00b8296c9`, while preserving the immutable BASELINE-01 implementation pin. Lodestar v1.47.0 at `450996b13a` is now the newest immutable release target; rc.0 remains historical qualification evidence.
- Corrected #9813 from an active watch to a closed, unmerged historical alternative; merged #9864 remains the epoch-boundary head-freshness baseline.
- Recorded Nico's confirmation that direct Engine access is the working direction and that his branch should be mined for smaller reviewable changes rather than merged wholesale. Kept production shared-versus-dedicated EL topology and exact BN input ownership open.
- Recorded ready #9958 and stacked draft #9973 as the payload-source and orchestration path. Recorded #9970 plus contribution PR #9 as the single active store path and #9974 plus contribution PR #10 as the policy path.
- Recorded #9975/#9976 as bid foundations, #9978/#9979 as one logical bid path, and #9980/#9981/#9982 as one logical selection/reveal path. These drafts expose review surfaces but do not complete the integrated lifecycle or prove maintainer acceptance.
- Added fork draft #77 and LOD-73 for a resolved-input `SlotBidder` that composes payload build, retention, coverability, assembly, and publication without choosing event, CLI, or Engine topology.
- Recorded the review strategy: foundations first; collapse dependency diffs after parent merges; consider grouping the bid and selection/reveal drafts around their first consumers; add final Builder/CLI wiring only after input and Engine configuration contracts are explicit.
- Added five Marko-owned attribution records without changing ownership of Kris's remaining work: LOD-68 for #9970 runtime store wiring, LOD-69 for #9974's initial bid policy, LOD-70 for the four event comparison PoCs, LOD-71 for landed head-event and bid-input foundations, and LOD-72 for blinded-block and envelope-publication foundations.
- Added Marko's adjacent Lodestar-z #472 Builder-state binding and EIP-8282 request-layout test hardening to LOD-71 without turning those completed foundations into new implementation tasks.
- Recorded merged Lodestar #9984 and #9986 as BN validation and shared spec-test changes. #9972 is approved and mergeable, with its spec-test job still failing. None overlaps the current Builder service drafts.
- Added merged SSE containment #9964, consensus #5594 plus Lodestar #9972 bid validation, and Buildoor #184 local/p2p preference evidence to the owning REL-01, BID-CORE-01/QA-01, and E2E-01 tracks.
- Recorded the merged consensus-specs #5585 source-version bump without misclassifying it as a released beta tag or changing Lodestar's alpha.14 pin.
- Routed Buildoor #186's geth-only deterministic testing source to E2E-01/INT-01, consensus-specs #5573/#5590 to later compliance and transport evidence, and execution-apis #870/#878 to conditional Heze work.
- Routed ethereum-package #1483's genesis-Builder key assignment and activation boundary to E2E-01/INT-01 rather than treating quiet Buildoor behavior as a Lodestar defect.
- Verified the current 71-item GitHub Project mirror after adding SLOT-BIDDER-01. The five Marko-owned items and the new Kris-owned integration item match Linear for assignee, workflow status, Linear status, gate, priority, and cycle where applicable.
- Renamed the architecture document to `direct-engine-working-plan.md` and replaced the live Gate-B and critical-path references to historical BN-02/BN-03/BN-04 with PAYLOAD-SOURCE-01, PAYLOAD-ORCH-01, STORE-01, and BID-CORE-01.
- Corrected the tracker inventory to 71 current Linear issues. The GitHub repository has 73 project issues because closed legacy `NICO-01` and the unlabelled administrative `PRESENTATION-01` remain outside the Linear implementation inventory.

### Week 12 checkpoint - 31 August 2026

Kris:

 - Started `ENV-02` as the primary implementation task and `BASELINE-01` as supporting verification. Recorded separate immutable pins for the upstream Lodestar baseline, the API-02 code under test, ethereum-package, Geth, key derivation tooling, and execution fixtures.
 - Added a reproducible Kurtosis fixture, Builder-sidecar runbook, and method/path-only recording proxy for API-02's real-BN event-to-block and connected/reconnecting `SIGTERM` evidence. Installed the checksum-verified Kurtosis 1.20.0 standalone CLI after Homebrew was blocked by the machine's Xcode version, started the local engine with analytics disabled, built the API-02 image, and passed the ethereum-package dry-run.
 - Completed three clean network launches on the first development machine. Recorded a real `block` SSE subscription followed by root-addressed `getBlockV2` retrieval and a matching post-Gloas observation. Verified connected and reconnecting `SIGTERM` shutdown and controlled duplicate delivery with one fetch and one observation for the duplicated root. Kept ENV-02 open for independent reproduction by a second contributor.
 - Audited Marko's August Builder PRs. Existing project issues already cover the merged Builder foundation, lifecycle, metrics, handler-test, identity-retry, and event-PoC work. Added `BN-PUB-01` only for the previously untracked local-bid validation and flood-publication PR; this tracking change does not accept the unresolved Builder architecture.
 - Audited all 65 open Lodestar PRs and all 110 PRs closed or merged from 11 August through 1 September against the live Linear board and Builder plans. No completed issue needed reopening and no new Builder module was required.
 - Routed mainnet-scale payment arithmetic (#9350), EL-invalid and PTC behavior (#9332/#9637), BN payload recovery (#9937/#9281/#9791/#9326), Heze validation (#9935/#9936), and reorg/parent-variant evidence (#9944/#9929/#9233/#9723) to their existing baseline, outcome, QA, recovery, E2E, conditional, and deferred issues. Recorded draft #9958 as PAYLOAD-SOURCE-01 and confirmed #9957 does not remove the Gloas blob bundle contract.

### Week 5

Kris:

 - Opened the proposal as [EPF7 PR #161](https://github.com/eth-protocol-fellows/cohort-seven/pull/161), revised it through review, and merged it on July 13.
 - Added the post-merge strong-success changes in [EPF7 PR #186](https://github.com/eth-protocol-fellows/cohort-seven/pull/186): incorporated Nico's additional goal, separated the compound outcomes, and linked the blocking work.
 - Recorded the Lodestar/buildoor benchmark suggestion for a Kurtosis network and sharpened the delivery split: Builder core, Heze/FOCIL as strong-success work, and Deathstar plus advanced bid policy as stretch work.
 - Advanced the monitored baseline from alpha.11/devnet-6 assumptions to alpha.12 and devnet-7 WIP, including the `tests-glamsterdam-devnet@v7.2.0` fixture reference, the then-open beacon-APIs #624 envelope direction, and the Prysm EIP-7688 flag check.
 - Resolved the Builder credential prefix, payload deadline, EIP-7688 baseline, and Heze bitlist questions, then moved the next milestone from proposal submission to architecture and the first reviewable implementation task.

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

Additional landed and review milestones:
 - Published the first `@lodestar/builder` npm package after the initial merge.
 - Merged [#9766](https://github.com/ChainSafe/lodestar/pull/9766), replacing the stale `tsgo` package scripts with `tsc` for the workspace TypeScript 7 migration.
 - Merged [#9725](https://github.com/ChainSafe/lodestar/pull/9725) and [#9726](https://github.com/ChainSafe/lodestar/pull/9726), establishing the shared `assertEqualParams` utility and the reviewed 404-aware genesis-wait behavior used by the Builder.
 - Kept the generated Builder CLI page out of the public sidebar through [#9770](https://github.com/ChainSafe/lodestar/pull/9770) until the command is functionally ready.
 - Preserved [#9757](https://github.com/ChainSafe/lodestar/pull/9757) and its local buildoor fixture as the proposer-equivocation/unbundling test to rerun with Lodestar Builder once its lifecycle works.

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

### Current checkpoint — 11 August 2026

Kris and Marko:

- Reconciled the reviewed implementation plan and Living Technical Note against the Week 6–8 write-ups, the partial August 10 monitor, direct Lodestar and devnet primary-source checks through August 11, current Discord context, Linear, and the GitHub issue mirror. Unavailable monitor cursors were not advanced and no runtime-health claim was inferred.
- Preserved Marko's closed `CLI-01` and `API-01` statuses while keeping `REVIEW-01` In Progress for the still-open [Lodestar #9781](https://github.com/ChainSafe/lodestar/pull/9781) review, later-Builder lifecycle implementation, responsibility documentation, and merge evidence. `TEST-01` remains the focused test matrix and `MET-01` owns metrics and metrics-server lifecycle work.
- [Lodestar #9781](https://github.com/ChainSafe/lodestar/pull/9781) is an open review-required draft at head `251347b7b5c5723a84ca6851e603604cdc75cd80`, with 33 commits and eight unresolved Nico review threads on August 11. The branch uses the API client's standard `.value()` response path and asynchronous API-error response mocks. The reviewed later-Builder direction is to keep an unknown configured key inert and retry with cancellation until it is deposited or activated, while preserving a returned non-active lifecycle status as a distinct operator-visible result. Implementation and regression evidence remain open.
- Audited the current #9781 tests. Successful index resolution, returned non-active status, version mismatch, status-lookup failure, and the five current `BuilderStatusTracker` cases are covered. Unknown-key polling and later activation, cancellation, readiness recovery, bounded error detail, genesis logging, and CLI cases remain in `TEST-01`.
- [Lodestar #9757](https://github.com/ChainSafe/lodestar/pull/9757) merged the BN-owned `consensus_and_equivocation` validation and Deathstar proposer-equivocation machinery. The stored buildoor fixture remains ready to rerun with Lodestar Builder once the honest lifecycle works.
- Advanced the immutable audit target from rc.0 to [Lodestar v1.46.0-rc.1](https://github.com/ChainSafe/lodestar/releases/tag/v1.46.0-rc.1) at `e2b315e`. Merged #9790/#9792 protect state close and QUIC resource cleanup. [#9793](https://github.com/ChainSafe/lodestar/pull/9793) closed without merge because its self-signal/force-exit approach did not generalize, especially for default container PID 1; the underlying stuck worker handle remains unidentified and forced termination remains a process-manager responsibility.
- Kept draft release [#9788](https://github.com/ChainSafe/lodestar/pull/9788) and circuit-breaker follow-up [#9780](https://github.com/ChainSafe/lodestar/pull/9780) as baseline watches. Neither changes the accepted core Builder architecture, and #9788 is not evidence that v1.46.0 stable has shipped.
- Audited every completed project issue. PLAN-01, BOARD-01, and SIGN-01 retain sufficient completion evidence; CLI-01/API-01 remain closed by project decision, with all unfinished work assigned to REVIEW-01, TEST-01, or MET-01. The tracked inventory is now 47 issues.
- Moved `API-02` into In Review for Kris in Cycle 2 after opening implementation PR #48 and docs PR #13. `ENV-01` remains its dependency for end-to-end evidence, and #9781 must be reconciled after it merges.
- Recorded [Prysm #17268](https://github.com/OffchainLabs/prysm/pull/17268) as merged and updated the successor execution-fixture reference to `tests-glamsterdam-devnet@v8.1.0`, without treating either as a public devnet-8 launch or a new Builder workstream.
- Recorded the four devnet-7 Tysm/Prysm host removals in `1ca063f` and the Dora image override in `df1dfc7` as configuration movement only, without inferring devnet health.

### Week 9

Kris:

- Began `API-02` from Lodestar `unstable` at `1dde9abaa66ca4d4f3500e8fb06106fa635a066d`, then merged the current `unstable` baseline at `713b21812905bb34e547ca85d5f630060179da67`. Audited the standard `block` SSE payload, Lodestar's post-import emission order, `getBlockV2` fork metadata and retrieval path, and the accepted-bid notification gap in beacon-APIs #599.
- Implemented a Builder `BlockObserver` that subscribes through the source BN REST client, retrieves post-Gloas signed blocks by root with bounded retry, deduplicates concurrent and sequential observations, preserves exact bid values, and hands observations to isolated registered callbacks without adding p2p, reveal, selection, metrics, or recovery behavior.
- Added 25 focused tests covering stream wiring, Gloas and Heze fork-correct output, sequential and concurrent duplicates, event-before-block 404 retry, retry exhaustion, error classification, cancellation, unsupported forks, metadata/body disagreement, bounded eviction, self-build sentinel handling, unexpected stream closure, callback isolation, and shared abort-signal use. The complete Builder package suite now contains 31 passing tests.
- Confirmed that standard `block` plus `getBlockV2` is sufficient for correctness. Posted the implementation evidence to [beacon-APIs #599](https://github.com/ethereum/beacon-APIs/issues/599#issuecomment-5257353985); an enriched event remains an efficiency and interoperability improvement rather than a prerequisite.
- Audited the runtime event boundary on Node 24.13.0. Lodestar uses the npm `eventsource` fallback; the Builder CLI currently pins one BN URL; shared-client multi-URL fallback would need explicit source affinity; and the Beacon API event contract provides no standard event ID or resumption mechanism. Routed connected/reconnecting shutdown evidence to `ENV-01`, bounded same-source reconciliation to `REL-01`, multi-BN provenance to LOD-37, and long-gap replay/reorg work to LOD-41.

### Current checkpoint - 14 August 2026

Kris and Marko:

- [Lodestar #9781](https://github.com/ChainSafe/lodestar/pull/9781) merged into `unstable` as `2a04194b900ef972c6f469d06017d5c972be5714` after Nico approved head `3fe4ef4980645144668f8f634884c72a69f83677` and the required checks passed. The unknown-key and pending-Builder wait paths, cancellation-aware polling, Builder identity checks, readiness reporting, fee-recipient wiring, and status tracking are now upstream.
- Merged the updated `unstable` baseline into API-02 at `1aae68a26fba53c2da1f361f2491042eae220f70`, preserving the #9781 initialization gates and the API-02 `BlockObserver`. The focused observer suite remains 25 tests and the integrated Builder package suite now contains 45 passing tests on Node 24.13.0.
- Kept `REVIEW-01` In Progress for post-merge bookkeeping rather than treating #9781 as open. Twelve review-thread markers remain unresolved in GitHub: five are outdated, two record accepted or already-applied behavior, one is tracked by [#9819](https://github.com/ChainSafe/lodestar/issues/9819), and four logging or abort-loop nits are followed up by open [#9827](https://github.com/ChainSafe/lodestar/pull/9827). No maintainer thread was silently resolved.
- Merged API-02 docs [#13](https://github.com/krisoshea-eth/lodestar-eip-7732-builder-docs/pull/13) and the SPEC-01 working draft [#14](https://github.com/krisoshea-eth/lodestar-eip-7732-builder-docs/pull/14). API-02 remains In Review until its fork PR is opened against `ChainSafe/lodestar:unstable`, upstream review completes, and `ENV-01` records the deterministic real-BN event-to-block smoke run.

### Week 11 checkpoint - 24 August 2026

Kris and Marko:

- Refreshed API-02 fork draft [#48](https://github.com/krisoshea-eth/lodestar/pull/48) from stale head `1aae68a26f` to current Lodestar `unstable` `bd761ec9ea` through incremental merge `c3a42e6a24`, without rebasing or force-pushing after review began.
- Reconciled the observer with merged upstream Builder work: shared API stubs [#9826](https://github.com/ChainSafe/lodestar/pull/9826), Marko's lifecycle follow-up [#9827](https://github.com/ChainSafe/lodestar/pull/9827), Gloas-aware startup [#9839](https://github.com/ChainSafe/lodestar/pull/9839), Marko's metrics [#9848](https://github.com/ChainSafe/lodestar/pull/9848), CLI tests [#9860](https://github.com/ChainSafe/lodestar/pull/9860), and transient Builder lookup handling [#9868](https://github.com/ChainSafe/lodestar/pull/9868). The resulting API-02 diff remains four Builder files.
- Re-audited `importBlock.ts` after #9769 and `chain.getBlockByRoot`. The `block` event remains post-import and the root lookup still serves from the seen-block input cache or database after fork-choice presence, so no Lodestar-specific 404 window is expected. Cross-client bounded retry remains required because the Beacon API does not specify this ordering.
- Validated API-02 on Node 24.13.0 and pnpm 11.0.0: 25 focused observer tests, 52 Builder package tests, package type-check, lint, build, build-import check, and `git diff --check` all pass.
- Recorded current tracker state without treating prerequisites as proof: `MET-01` is Done, `ENV-01` is marked Done but its evidence needs reconciliation, `TEST-01` and `REVIEW-01` remain open, and API-02 remains In Review until maintainer review plus its issue-specific real-BN event-to-block and shutdown smoke.
- Audited Marco's four open upstream event PoCs: [#9854](https://github.com/ChainSafe/lodestar/pull/9854), [#9875](https://github.com/ChainSafe/lodestar/pull/9875), [#9876](https://github.com/ChainSafe/lodestar/pull/9876), and [#9896](https://github.com/ChainSafe/lodestar/pull/9896). They compare additive `block` fields, two complete-bid event shapes, and `block_v2`. Nico's review of #9854 reopened the original preferred direction, so SPEC-01 returned to In Progress. Nico's draft [`nflaig/builder`](https://github.com/ChainSafe/lodestar/tree/nflaig/builder) branch at `99fd8fa9ad` remains end-to-end evidence, not the settled API contract.
- Refreshed the SPEC-01 Beacon APIs base from `ba859db` to `159622d`. Builder-specs [#165](https://github.com/ethereum/builder-specs/pull/165)/[#166](https://github.com/ethereum/builder-specs/pull/166), Beacon APIs [#630](https://github.com/ethereum/beacon-APIs/pull/630), and keymanager-APIs [#92](https://github.com/ethereum/keymanager-APIs/pull/92) merged on August 24. No open Beacon APIs PR implements #599; open #585 and #490 remain eventstream overlap watches.
- Recorded open Lodestar Builder API draft [#9832](https://github.com/ChainSafe/lodestar/pull/9832), native PTC sampling [#9903](https://github.com/ChainSafe/lodestar/pull/9903), and bounded envelope caching [#9904](https://github.com/ChainSafe/lodestar/pull/9904) as current watches. Nico's SSE resilience [#9872](https://github.com/ChainSafe/lodestar/pull/9872) merged during the final refresh and is now integrated by API-02; it drops one unserializable event without tearing down the stream and closes genuinely broken streams so EventSource can reconnect. Live status also corrected a monitor-table error: #9736 remains open, draft, and conflicting rather than merged.
- Updated REL-01 so bounded recovery covers connected-stream gaps as well as reconnect gaps. Because #9872 can intentionally drop one unserializable event while preserving the connection, a recovery design that only runs after reconnect would remain incomplete.
- Recorded merged [#9864](https://github.com/ChainSafe/lodestar/pull/9864) as the current epoch-boundary head-freshness baseline. NC later closed [#9813](https://github.com/ChainSafe/lodestar/pull/9813) without merge, so it is now historical evidence rather than a disposition watch. The Builder consequence belongs to `BID-01` head-change testing, not API-02.
- Recorded public Dora evidence for one finalized Lodestar-proposed external Builder payload at slot 79322, with `Revealed`, value 0.3246 ETH, and 99.26% PTC quorum. This is point-in-time protocol-flow evidence only and does not prove API-02 observation, shutdown, continuous health, recovery, Assertoor/Buildoor results, or deployed bytecode.
- Audited every completed project issue. PLAN-01, BOARD-01, SIGN-01, CLI-01, API-01, and MET-01 retain explicit closure or scope-transfer evidence. ENV-01 is the sole closure requiring follow-up because its task list and evidence fields remain empty; keep its status unchanged until the referenced Discord/manual-run evidence is reconciled.

### Architecture reconciliation checkpoint - 31 August 2026

Kris and Marko:

- Re-audited Nico's [`nflaig/builder`](https://github.com/ChainSafe/lodestar/tree/nflaig/builder) proof of concept at `99fd8fa9ad`. It implements a direct-Engine Builder across 10 commits and 42 changed files on an older base. Adopted it as a provisional planning baseline and recorded a small-PR extraction strategy rather than treating it as a merge-ready branch.
- Recorded the ownership change: the Builder provisionally owns `PayloadSource`, `PayloadStore`, bid policy/construction, and stateless reveal material; the source BN retains chain/proposer inputs, validation, publication, and authoritative outcomes.
- Recorded merged Gloas Builder API [#9832](https://github.com/ChainSafe/lodestar/pull/9832), bounded envelope cache [#9904](https://github.com/ChainSafe/lodestar/pull/9904), bid validation/flood publication [#9914](https://github.com/ChainSafe/lodestar/pull/9914), and js-libp2p per-call flood publication [#3610](https://github.com/libp2p/js-libp2p/pull/3610).
- Audited Marco's recent public work. The Builder-relevant set is merged #9848, #9860, #9868, #9914, merged beacon-APIs #637, open beacon-APIs #638, merged js-libp2p #3610, and the four open selection-event PoCs #9854/#9875/#9876/#9896. No additional untracked Builder implementation branch was found in his public Lodestar fork.
- Separated open beacon-APIs #638 from SPEC-01. #638 currently adds safe and finalized execution hashes to `payload_attributes`; it does not define the post-Gloas emission contract and does not decide #599's Builder-selection event.
- Kept API-02 and TEST-01 independent and reviewable. API-02 remains the standard `block` plus `getBlockV2` fallback under either Builder architecture or event choice.
- Kept ENV-02 open until a second contributor reproduces its clean-checkout runbook. First-machine evidence remains point-in-time API-02 and shutdown proof, not continuous-health or external-Builder selection proof.
- Deferred final architecture and event wording until Nico and NC answer the focused Discord questions. The provisional plan records every unresolved choice so implementation can proceed without presenting assumptions as consensus.
- Removed the remaining active BN-mediated lifecycle text from the plan and Living Technical Note, corrected the `PAYLOAD-01 -> STORE-01 -> BID-CORE-01 -> BID-01` dependency order, and kept the original BN-mediated task blocks clearly labelled as historical design evidence.

### Full branch and tracker reconciliation - 1 September 2026

Kris and Marko:

- Audited every production and test change across all 42 files in Nico's `nflaig/builder` proof of concept. The existing issue graph covers its ChainEvents, PayloadSource, PayloadStore, BidPolicy, SlotBidder, Ledger, Revealer, API, CLI, metrics, and test work; no duplicate component issue was added.
- Audited recent public Builder-relevant work by Marco, Nico, and NC across Lodestar, beacon-APIs, js-libp2p, and consensus-specs. Corrected #9947 as proposer-BN connection pre-warming for external Builder API servers, not Builder-to-EL Engine connection management.
- Recorded merged consensus-specs #5549 as a new direct-Engine input: post-Gloas `notify_forkchoice_updated` includes `custody_columns`. Routed the unresolved node-identity and value-source decision to BN-01, ATTR-01, PAYLOAD-01, ATTR-SPEC-01, and EL-ARCH-01 rather than silently expanding beacon-APIs #638.
- Recorded merged #9869, #9946, #9948, #9949, and #9950 plus the then-open #9954 and #9955 in the affected BN and payload issues. #9954 subsequently merged on 1 September; #9955 remains a draft watch. Confirmed Marco's #638 is already ATTR-SPEC-01 in review and #9914 plus js-libp2p #3610 are already BN-PUB-01 Done.
- Reconciled all 52 Linear issues and verified that the changed issue bodies propagated to the GitHub mirror. ENV-01 remains Done for manual setup; ENV-02 remains In Progress only until a second contributor independently reproduces its stored runbook. BASELINE-01 remains In Progress for its historical capability audit, and REVIEW-01 remains with Marko for explicit #9781 thread-marker reconciliation.
- Fast-forwarded the local API-02 checkout to upstream PR head `711c6c7a77` after its latest `unstable` merge. On Node 24.13.0, 26 focused observer tests plus the Builder lifecycle test pass, followed by Builder package type-check, package lint, and `git diff --check`.

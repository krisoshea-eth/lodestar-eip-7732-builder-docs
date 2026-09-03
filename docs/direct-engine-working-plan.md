# Direct-Engine Builder working plan

> **Status:** Confirmed working direction, reconciled through 3 September 2026. Nico confirmed direct Engine access as the preferred baseline for `packages/builder`, with the proof-of-concept branch used as implementation evidence rather than merged wholesale. Production EL topology and the exact source-BN input contract remain open design work.

## Purpose and evidence boundary

Nico's [`nflaig/builder`](https://github.com/ChainSafe/lodestar/tree/nflaig/builder) branch demonstrates an end-to-end Builder that owns payload construction through an Engine API connection. This differs materially from the original BN-mediated plan, where the source beacon node owned payload construction and stateful reveal material.

The branch is a proof of concept, not an upstream-ready patch. At [`99fd8fa9ad`](https://github.com/ChainSafe/lodestar/commit/99fd8fa9ad3a867fced3a5907a68edf3a519c1cd) it contains 10 commits and changes 42 files relative to its merge base. Every changed production and test file was audited. Current Lodestar `unstable` was [`76b167bf36`](https://github.com/ChainSafe/lodestar/commit/76b167bf36918ae5f811427850587734e556e319) when this reconciliation was refreshed.

The project is extracting small, typed, testable boundaries from the proof of concept. An open draft is evidence that a review boundary exists. It is not evidence that Lodestar maintainers have accepted the abstraction or final API.

## Proof-of-concept extraction matrix

Every production and test responsibility in the 42-file proof-of-concept diff is routed below. This is a responsibility map, not a claim that each prototype type or service should be copied upstream.

| Proof-of-concept area | Current owner | Disposition |
| --- | --- | --- |
| API block fields and event codecs | SPEC-01 and Lodestar event PoCs #9854/#9875/#9876/#9896 | Keep the wire choice separate from API-02 until cross-client review settles it |
| BN payload-attributes production and block import hooks | BN-01, ATTR-SPEC-01, ATTR-IMPL-01, ATTR-EMIT-01, and ATTR-CONSUME-01 under ATTR-01 | Fork draft #80 implements the current #638 hash fields in Lodestar. The remaining producer trigger/deduplication work and Builder consumer are separate review boundaries |
| BN bid validation and flood publication | Completed BN-PUB-01 through #9914 and #9998; #9972/#5594 provide the parent-hash guard | Reuse landed BN behavior. API submissions are validated and flood-published but are not inserted into the receiving BN's local pool |
| `chainEvents` | API-02, PREF-01, BN-01, ATTR-CONSUME-01, BID-RUNTIME-01, and REV-RUNTIME-01 | Block observation exists; preference and payload-attribute subscription wiring remains part of the integrated consumers |
| `payloadSource` | PAYLOAD-SOURCE-01 through #9958 | Extracted as an injected Engine boundary without topology or CLI ownership |
| `payloadStore` | STORE-01, Marko-owned [LOD-68](https://linear.app/kriso/issue/LOD-68/store-wiring-01-wire-and-prune-the-builder-payload-store), #9970, and hardening contribution #9 | Keep one upstream store path, preserve exact reveal material, and isolate retained state from caller mutation |
| `bidPolicy` | Marko-owned [LOD-69](https://linear.app/kriso/issue/LOD-69/bid-policy-base-01-add-the-initial-builder-bid-policy), #9974, and numeric hardening contribution #10 | Keep policy separate from ledger and message assembly |
| `ledger` | BID-LEDGER-01 through #9975 | Extracted as the one-shot bid, win, liability, and exact reveal-reservation boundary; successful publication is tracked separately |
| `proposerPreferencesTracker` | PREF-01 through #9976 | Extracted with copy-on-write/read ownership, while dependent-root sourcing remains a BN-01 integration decision |
| `slotBidder` | [LOD-73](https://linear.app/kriso/issue/LOD-73/slot-bidder-01-coordinate-one-resolved-direct-engine-bid), fork draft [#77](https://github.com/krisoshea-eth/lodestar/pull/77), and [BID-RUNTIME-01](https://linear.app/kriso/issue/LOD-77) | A resolved-input consumer composes orchestration, retention, coverability, assembly, and publication; BID-RUNTIME-01 owns event, CLI, and Engine construction |
| `revealer` | #9980, #9981, #9982, SELECT-01, REV-01, and [REV-RUNTIME-01](https://linear.app/kriso/issue/LOD-78) | Pure selection, parent-root-bound assembly, and retry-safe exact publication seams exist; REV-RUNTIME-01 owns store lookup, cutoff, retry count/backoff, settlement, eviction, and runtime wiring |
| Builder root, defaults, exports, metrics, and CLI wiring | BID-RUNTIME-01, REV-RUNTIME-01, QA-01, and HANDOFF-01 | Deliberately excluded from the service drafts and now assigned to the two bounded runtime-consumer issues |
| Proof-of-concept tests, API stub, clock helper, package metadata, and lockfile | Component PR tests plus E2E-01/QA-01 | Reuse behavioral cases where they remain valid; do not copy branch-wide scaffolding or lockfile churn wholesale |

## Confirmed working direction

| Component | Working owner | Responsibility |
| --- | --- | --- |
| Builder identity and signing | `packages/builder` | Local Builder key, active index, fork-aware bid and envelope signatures |
| Chain and proposer inputs | Source BN | Genesis/config, chain head, post-Gloas payload attributes, proposer preferences, block events |
| Payload construction | Builder through an injected payload source | Initially call a local Engine API; preserve the boundary so dedicated ELs or different building software can be supported later |
| Payload retention | Builder | Retain exact reveal material keyed by execution block hash until reveal or bounded expiry |
| Bid policy and coverability | Builder | Derive a bounded, coverable bid value and record pending obligations |
| Bid validation and publication | Source BN | Validate locally submitted bids and flood-publish accepted bids on the existing gossip topic without inserting API-only bids into its own local pool |
| Selection observation | Builder through source-BN REST/SSE | Use API-02 `block` plus `getBlockV2` as the compatibility and exact-verification path |
| Envelope publication | Source BN | Validate and publish the signed stateless envelope and preserve proposer-equivocation checks |
| Authoritative outcomes | BN and network | Imported block, payload status, PTC, payment, and fork-choice outcomes |

The initial implementation is p2p-Builder-first. The Builder does not join libp2p directly; it submits bids and envelopes through its source BN. Since merged #9998 keeps API-only bids out of that BN's local pool, selection evidence uses a second proposer BN that receives the bid over p2p. A Builder API server is a later addition. Bounded in-memory payload retention is acceptable for the first working loop; durable restart recovery remains follow-up work.

For an initial shared-EL proof of concept, the Builder must follow the BN's emitted payload attributes exactly so its `forkchoiceUpdated` request does not conflict with the BN view. A stock EL cannot start a build on an arbitrary parent without `forkchoiceUpdated`. Production deployment must therefore settle one of these models:

1. a dedicated Builder EL;
2. a shared EL with an enforceable single-view/single-input invariant; or
3. alternative building software behind the injected payload-source boundary.

## Current upstream and stacked delivery map

| Capability | Review artifact | State on 3 September | Review meaning |
| --- | --- | --- | --- |
| Source-BN block observation | [Lodestar #9931](https://github.com/ChainSafe/lodestar/pull/9931) | Ready, mergeable | Independent API-02 review |
| Gate-A lifecycle regressions | [Lodestar #9932](https://github.com/ChainSafe/lodestar/pull/9932) | Ready, mergeable | Independent TEST-01 review |
| `PayloadSource` and Engine adapter | [Lodestar #9958](https://github.com/ChainSafe/lodestar/pull/9958) | Ready, mergeable | First direct-Engine boundary; no CLI or runtime topology wiring |
| Payload-job orchestration | [Lodestar #9973](https://github.com/ChainSafe/lodestar/pull/9973) | Draft, stacked on #9958 | Bounded jobs, canonical duplicate identity, job-ID conflict rejection, cancellation, timeouts, and cleanup |
| Payload store | Marko-owned [LOD-68](https://linear.app/kriso/issue/LOD-68/store-wiring-01-wire-and-prune-the-builder-payload-store), [Lodestar #9970](https://github.com/ChainSafe/lodestar/pull/9970), [hardening contribution](https://github.com/markolazic01/lodestar/pull/9) | Draft plus contribution | Keep one upstream store PR; combine wiring/pruning with bounded invariants, defensive payload ownership, and tests |
| Bid policy | Marko-owned [LOD-69](https://linear.app/kriso/issue/LOD-69/bid-policy-base-01-add-the-initial-builder-bid-policy), [Lodestar #9974](https://github.com/ChainSafe/lodestar/pull/9974), [numeric hardening contribution](https://github.com/markolazic01/lodestar/pull/10) | Draft plus contribution | Keep policy and exact numeric-domain hardening together |
| Pending-bid ledger | [Lodestar #9975](https://github.com/ChainSafe/lodestar/pull/9975) | Ready, mergeable | Winning liabilities remain until explicit settlement; exact envelope reservation and successful publication are separate states |
| Proposer preferences | [Lodestar #9976](https://github.com/ChainSafe/lodestar/pull/9976) | Draft | Retained preferences are mutation-isolated; consumer contract and dependent-root ownership still need review |
| Bid assembly | [Lodestar #9978](https://github.com/ChainSafe/lodestar/pull/9978) | Draft, stacked on #9958 | Pure fork-aware assembly boundary; may be reviewed with bid publication |
| Bid publication | [Lodestar #9979](https://github.com/ChainSafe/lodestar/pull/9979) | Draft, stacked on #9975 | Fork-correct Gloas/Heze signing and one-shot source-BN submission; may be reviewed with bid assembly |
| Resolved-input slot bidder | [Fork draft #77](https://github.com/krisoshea-eth/lodestar/pull/77) | Draft, stacked on the combined integration branch | Two-file integration evidence only; keep fork-only until foundation interfaces and review grouping settle |
| Complete bid runtime | [BID-RUNTIME-01](https://linear.app/kriso/issue/LOD-77) | Backlog, unassigned | Construct accepted services and drive one retained, coverable, submitted bid from accepted source-BN input |
| Payload-attributes forkchoice hashes | [Fork draft #80](https://github.com/krisoshea-eth/lodestar/pull/80) / [LOD-74](https://linear.app/kriso/issue/LOD-74/attr-impl-01-emit-post-gloas-forkchoice-hashes-in-payload-attributes) | Draft, fork-only on `unstable` | Implements the current #638 field shape and producer values; [ATTR-EMIT-01](https://linear.app/kriso/issue/LOD-75/attr-emit-01-emit-deduplicated-post-gloas-payload-attributes) owns trigger, FULL/EMPTY, deduplication, and custody behavior; [ATTR-CONSUME-01](https://linear.app/kriso/issue/LOD-76/attr-consume-01-consume-fork-correlated-payload-attributes-in-builder) owns Builder consumption |
| Selection matching | [Lodestar #9980](https://github.com/ChainSafe/lodestar/pull/9980) | Draft, stacked on #9975 | Exact local-bid match; may be reviewed with reveal work |
| Envelope assembly | [Lodestar #9981](https://github.com/ChainSafe/lodestar/pull/9981) | Draft, stacked on #9958 | Stateless Gloas/Heze assembly bound to the retained parent Beacon root; may be reviewed with selection/reveal |
| Envelope publication | [Lodestar #9982](https://github.com/ChainSafe/lodestar/pull/9982) | Draft, stacked on #9975 | Exact envelope reservation, concurrent deduplication, successful-publication tracking, and exact retry seam; runtime policy remains later |
| Complete reveal runtime | [REV-RUNTIME-01](https://linear.app/kriso/issue/LOD-78) | Backlog, unassigned | Connect observation, exact selection, retained material, bounded publication, settlement, and eviction |

The drafts are not literal copies of Nico's services. They reuse the demonstrated responsibilities but narrow them into typed modules with different failure contracts and broader focused tests. Their current purpose is to expose coherent review surfaces and support a combined integration branch. They must not all be presented as independently accepted production abstractions.

### Contributor attribution and non-duplication

Linear now records Marko's Builder work as separate implementation or historical evidence issues so delivered work and remaining integration scopes are distinct:

- [LOD-68](https://linear.app/kriso/issue/LOD-68/store-wiring-01-wire-and-prune-the-builder-payload-store) owns #9970 runtime store wiring and slot pruning; STORE-CORE-01 retains Kris's bounded-store invariants and tests.
- [LOD-69](https://linear.app/kriso/issue/LOD-69/bid-policy-base-01-add-the-initial-builder-bid-policy) owns #9974's initial policy; BID-POLICY-HARDEN-01 retains Kris's numeric-domain hardening.
- [LOD-70](https://linear.app/kriso/issue/LOD-70/event-poc-01-prototype-builder-selection-event-alternatives) records the four completed comparison PoCs; SPEC-01 still owns the uncompleted cross-client contract decision.
- [LOD-71](https://linear.app/kriso/issue/LOD-71/bn-input-foundation-01-land-builder-facing-event-and-bid-input) records Marko's landed head-event, proposer-preference, gas-limit, and related Beacon API foundations, plus the adjacent [Lodestar-z Builder-state binding](https://github.com/ChainSafe/lodestar-z/pull/472) and [EIP-8282 request-layout test hardening](https://github.com/wemeetagain/EIPs/pull/2).
- [LOD-72](https://linear.app/kriso/issue/LOD-72/envelope-bn-foundation-01-harden-blinded-block-and-payload-envelope) records the landed blinded-block publication behavior and closed envelope alternatives.
- [LOD-79](https://linear.app/kriso/issue/LOD-79/bid-publish-api-01-remove-bid-pool-addition-in-api-path) records Marko's merged #9998 local-pool boundary and the resulting two-BN p2p selection topology.

These attribution issues do not create new implementation work. They make delivered ownership visible and keep the still-open work scoped to behavior not already landed elsewhere.

### How the stack is reviewed

Every ChainSafe PR targets `unstable`, because contributor dependency branches do not exist in the ChainSafe repository. Until a dependency merges, GitHub may show dependency files in the child PR. The intended review surface is the child PR's own commit and files, recorded in its description.

The delivery order is:

1. review independent foundations first: #9958, #9970 with its hardening contribution, #9974 with numeric hardening, #9975, and #9976;
2. keep #9973 stacked until #9958 settles;
3. after foundation feedback, decide whether #9978 and #9979 should remain separate or become one bid-path PR;
4. decide whether #9980, #9981, and #9982 should become one selection-and-reveal PR;
5. review fork draft #77 as evidence that the accepted services can form one resolved-input bid operation;
6. land the payload-attribute producer and consumer contracts, then use BID-RUNTIME-01 for Builder/CLI/Engine construction;
7. use REV-RUNTIME-01 to connect observation and exact selection to bounded reveal, settlement, and eviction.

When a parent merges, rebase or merge current `unstable`, rerun targeted validation, and verify that the child diff collapses to its intended files. Do not ask maintainers to review the whole stack at once.

## Landed capabilities that must be reused

| Capability | Evidence | Consequence |
| --- | --- | --- |
| Gloas Builder API flow | [Lodestar #9832](https://github.com/ChainSafe/lodestar/pull/9832) | Reuse proposer/BN-side preferences, requests, and direct signed-block forwarding |
| Bid validation and flood publication | [Lodestar #9914](https://github.com/ChainSafe/lodestar/pull/9914), [js-libp2p #3610](https://github.com/libp2p/js-libp2p/pull/3610) | Submit typed bids through the BN; do not add Builder libp2p |
| API-submitted bid pool boundary | [Lodestar #9998](https://github.com/ChainSafe/lodestar/pull/9998), [LOD-79](https://linear.app/kriso/issue/LOD-79/bid-publish-api-01-remove-bid-pool-addition-in-api-path) | The receiving BN validates and flood-publishes but does not select its own API-only bid; E2E needs a separate proposer BN receiving it over p2p |
| Bid parent-hash validation | [Lodestar #9972](https://github.com/ChainSafe/lodestar/pull/9972), [consensus-specs #5594](https://github.com/ethereum/consensus-specs/pull/5594) | Reuse the merged `block_hash != parent_block_hash` guard and its fixtures; do not duplicate it in `packages/builder` |
| Bounded BN envelope cache | [Lodestar #9904](https://github.com/ChainSafe/lodestar/pull/9904) | BN recovery/import evidence, not the direct-Engine Builder's primary store |
| Exiting-Builder filtering | [Lodestar #9954](https://github.com/ChainSafe/lodestar/pull/9954), [consensus-specs #5580](https://github.com/ethereum/consensus-specs/pull/5580) | Preserve parent-payload exit filtering in later bid tests |
| SSE event containment | [Lodestar #9872](https://github.com/ChainSafe/lodestar/pull/9872), [#9964](https://github.com/ChainSafe/lodestar/pull/9964) | A stream can remain connected after an individual event or consumer failure; REL-01 needs connected-gap reconciliation, not reconnect-only recovery |
| EMPTY payload range sync | [Lodestar #9937](https://github.com/ChainSafe/lodestar/pull/9937) | Include EMPTY and missed-slot recovery in E2E evidence |
| Heze dependent-root handling | [Lodestar #9935](https://github.com/ChainSafe/lodestar/pull/9935) | Preserve Heze fork and inclusion-list identity in payload and envelope tests |
| Builder preferences without an external URL | [Buildoor #184](https://github.com/ethpandaops/buildoor/pull/184) | E2E can exercise local/p2p Builder preference flows; p2p bids keep `execution_payment = 0` |

## Live upstream watches

| Track | Evidence | Project effect |
| --- | --- | --- |
| Impossible envelope sync targets | [Lodestar #9994](https://github.com/ChainSafe/lodestar/pull/9994) | Open guard for known genesis and pre-Gloas roots. Route its final disposition and unknown-root recovery cases to REL-01 and QA-01 |
| Bid-validation cost ordering | Merged [Lodestar #9984](https://github.com/ChainSafe/lodestar/pull/9984) | Reuse the BN-side ordering of cheap rejects and ignores before state and signature work; it does not add a Builder-side service |
| Spec-test expected-error enforcement | Merged [Lodestar #9986](https://github.com/ChainSafe/lodestar/pull/9986) | Track the resulting Gloas sweep-index vectors in QA-01; do not create a duplicate Builder PR for the shared test-harness fix |
| Candidate ranking and logs | [Lodestar #9966](https://github.com/ChainSafe/lodestar/pull/9966) | BN-side selection diagnostics only; no overlap with Builder payload construction |
| Late canonical-block import diagnostics | [Lodestar #9968](https://github.com/ChainSafe/lodestar/pull/9968) | Approved metric and log evidence for separating local BN import delay from Builder selection or reveal delay; route to QA-01 rather than creating another Builder service |
| Parent-slot source | [Lodestar #9955](https://github.com/ChainSafe/lodestar/pull/9955), [consensus-specs #5554](https://github.com/ethereum/consensus-specs/pull/5554) | BN-01 input semantics; no change to `PayloadSource` itself |
| Pre-Fulu blob cleanup | [Lodestar #9957](https://github.com/ChainSafe/lodestar/pull/9957) | Does not remove post-Gloas blobs returned by `getPayload`; #9958 remains valid |
| PTC and late-block behavior | [Lodestar #9903](https://github.com/ChainSafe/lodestar/pull/9903), [#9968](https://github.com/ChainSafe/lodestar/pull/9968), [#9969](https://github.com/ChainSafe/lodestar/pull/9969) | OUT-01, QA-01, and E2E-01 evidence; not new Builder service ownership |
| Payload-attributes hashes | [beacon-APIs #638](https://github.com/ethereum/beacon-APIs/pull/638), fork draft [#80](https://github.com/krisoshea-eth/lodestar/pull/80) | #80 implements the proposed safe/finalized fields and existing Lodestar producer path; neither artifact settles event timing, deduplication, or `custody_columns` |
| Builder-selection event | [beacon-APIs #599](https://github.com/ethereum/beacon-APIs/issues/599) | SPEC-01 compares extended `block`, lightweight `bid_included`, and `block_v2`; API-02 remains the fallback |
| Engine v4 custody input | [consensus-specs #5549](https://github.com/ethereum/consensus-specs/pull/5549), [execution-apis #608](https://github.com/ethereum/execution-apis/pull/608), [#856](https://github.com/ethereum/execution-apis/pull/856) | BN-01/EL-ARCH-01 must settle custody source and serialization before final runtime wiring |
| Orphaned-envelope serving | [consensus-specs #5060](https://github.com/ethereum/consensus-specs/pull/5060) | REL-01 watch; no cross-client contract is accepted yet |
| Deterministic testing build source | [Buildoor #186](https://github.com/ethpandaops/buildoor/pull/186) | Optional geth-only E2E payload-content fixture; do not make `testing_buildBlockV1` a production dependency or replace the standard Engine adapter |
| Genesis-registered Buildoor assignment | [ethereum-package #1483](https://github.com/ethpandaops/ethereum-package/pull/1483) | E2E/INT fixture watch; launched Buildoor keys must actually correspond to `state.builders`, and genesis Builders remain inactive until epoch 1 finalizes |
| Gloas compliance and ReqResp formats | [consensus-specs #5572](https://github.com/ethereum/consensus-specs/pull/5572), [#5573](https://github.com/ethereum/consensus-specs/pull/5573), and [#5590](https://github.com/ethereum/consensus-specs/pull/5590) | Reuse accepted randomized-equivocation and state-transition vectors in QA/OUT work; #5590 is exploratory and non-normative until its ownership issue settles |
| Heze inclusion-list response bounds | [execution-apis #870](https://github.com/ethereum/execution-apis/pull/870), [#878](https://github.com/ethereum/execution-apis/pull/878) | Conditional EXT-FOCIL-01 input only; no change to the current Gloas payload-source contract |

## Remaining implementation sequence

### 1. Inputs and Engine boundary

- Complete review of #9958.
- Define the exact safe/finalized hash and `custody_columns` inputs in BN-01.
- Settle production shared-versus-dedicated EL support, JWT ownership, readiness, and failure isolation in EL-ARCH-01.
- Review fork draft #80 as implementation evidence for the #638 field contract. Keep payload-attributes trigger and deduplication in ATTR-01/ATTR-SPEC-01.

### 2. Payload construction and retention

- Stabilize #9973 against the accepted `PayloadSource` contract.
- Complete one bounded store in #9970, including the accepted hardening from the contribution PR.
- Enforce retain-before-publish when the store, assembly, and publication services are integrated.

### 3. Bid path

- Settle #9974, #9975, and #9976.
- Review bid assembly and publication as one logical path, even if the drafts remain separate during development.
- Preserve exact-width arithmetic, deterministic bid identity, and one-shot publication.

### 4. Selection and reveal

- Keep API-02 as the compatible source-BN observation path.
- Match the selected signed bid to locally retained material.
- Construct the exact stateless Gloas or Heze envelope.
- Submit once through the source BN and record explicit failure outcomes.

### 5. Runtime integration and evidence

- Use fork draft [#77](https://github.com/krisoshea-eth/lodestar/pull/77) to review the resolved-input `SlotBidder` composition while keeping event, Builder/CLI, and Engine construction separate.
- Add payload-attribute consumption and Builder/CLI/Engine wiring after the service and input contracts settle.
- Prove the honest bid, selection, reveal, FULL/PTC, and payment loop locally.
- Add metrics, restart behavior, non-finality, hostile branches, and durability only in their bounded issues.

## Superseded original-plan assumptions

Do not implement these historical assumptions:

- the Builder never connects directly to an EL;
- the source BN constructs the complete unsigned bid;
- the source BN is the primary owner of reveal material;
- reveal normally retrieves an unsigned envelope from the same BN;
- local bid publication does not need the flood-publication path.

These constraints remain valid:

- the source BN is authoritative for chain inputs, validation, publication, and outcomes;
- exact-width values and fork-correct SSZ types must be preserved;
- no bid is published unless exact reveal material is retained and the bid is coverable;
- work, retries, storage, and shutdown are bounded;
- public API changes require upstream and cross-client agreement.

## Decisions still open

These questions no longer block pure service work, but they block final runtime wiring or specification completion:

1. Which production EL topology will Lodestar support first: dedicated Builder EL, constrained shared EL, or alternative building software?
2. What are the authoritative safe/finalized hash and `custody_columns` inputs?
3. What is the post-Gloas payload-attributes trigger and deduplication contract?
4. Will maintainers prefer the small bid/reveal drafts separately or grouped around their first runtime consumer?
5. Which Builder-selection event shape obtains cross-client agreement in beacon-APIs #599?

## Tracker interpretation

- Epic B is In Progress for the working direct-Engine lifecycle.
- Epic C is In Progress because bid, selection, and reveal child work is active.
- API-02, TEST-01, PAYLOAD-SOURCE-01, STORE-CORE-01, and the current pure-service reviews retain their evidence-based states.
- PAYLOAD-01, STORE-01, BID-CORE-01, BID-01, SELECT-01, and REV-01 remain open until their integrated outcomes are delivered. A pure helper PR narrows a parent issue but does not complete it.
- BN-PUB-01 remains Done because #9914 and js-libp2p #3610 landed; child LOD-79 records #9998's completed local-pool cleanup.
- BASELINE-01 remains Done at its immutable pin; moving `unstable` does not invalidate that audit.
- ENV-02 remains In Review until a second contributor reproduces its stored runbook.
- SPEC-01 remains In Progress and independent of #638.

Before starting or promoting each implementation slice, refresh `unstable`, `nflaig/builder`, and the listed open PRs. If maintainers reject a service boundary, fold it into the nearest consumer rather than defending decomposition for its own sake.

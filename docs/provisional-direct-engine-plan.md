# Provisional direct-Engine Builder plan

> **Status:** Direct Engine access confirmed as the working implementation baseline on 2 September 2026. The supported production topology is still open. This supersedes the BN-mediated ownership statements in the accepted implementation plan and Living Technical Note while shared versus dedicated EL operation is resolved.

## Purpose

Nico's [`nflaig/builder`](https://github.com/nflaig/lodestar/tree/builder) branch demonstrates an end-to-end Builder that owns payload construction through local execution clients. This differs materially from the accepted plan, where the source beacon node owns payload construction and stateful reveal material.

The branch is implementation evidence, not an upstream-ready patch. At [`99fd8fa9ad`](https://github.com/nflaig/lodestar/commit/99fd8fa9ad3a867fced3a5907a68edf3a519c1cd) it contains 10 commits and changes 42 files relative to its older base. Every changed production and test file was audited during this reconciliation. Current Lodestar `unstable` was [`9ba9a5ce85`](https://github.com/ChainSafe/lodestar/commit/9ba9a5ce851f8a3b3aa0cb0751ace8c2bf044dbe) when this baseline was refreshed on 2 September. The project should extract small reviewed changes from the proof of concept rather than merge or reproduce it as one unit.

## Provisional ownership boundary

| Component | Provisional owner | Responsibility |
| --- | --- | --- |
| Builder identity and signing | `packages/builder` | Local Builder key, active index, fork-aware bid and envelope signatures |
| Chain and proposer inputs | Source BN | Genesis/config, chain head, post-Gloas payload attributes, proposer preferences, block events |
| Payload construction | Builder plus one or more local ELs | Call Engine API, obtain payloads, blobs, requests, and payload value |
| Payload retention | Builder | Retain exact reveal material keyed by execution block hash until reveal or expiry |
| Bid policy and coverability | Builder | Choose a value, enforce local balance and pending-obligation rules, construct one complete bid |
| Bid validation and publication | Source BN | Validate locally submitted bids and flood-publish accepted bids on the existing gossip topic |
| Selection observation | Builder through source-BN REST/SSE | Use API-02 `block` plus `getBlockV2` as the compatibility and exact-verification path |
| Envelope publication | Source BN | Validate and publish the signed stateless envelope and preserve proposer-equivocation checks |
| Authoritative outcomes | BN and network | Imported block, payload status, PTC, payment, and fork-choice outcomes |

The Builder remains a standalone sidecar and does not join libp2p directly. Direct Engine access is limited to the build half of the lifecycle. Consensus validation and publication remain BN-owned.

## Evidence already landed upstream

| Capability | Current status | Project consequence |
| --- | --- | --- |
| Gloas Builder API flow, [Lodestar #9832](https://github.com/ChainSafe/lodestar/pull/9832) | Merged as `57572140f8` | Re-audit BN-01 against the landed proposer/BN-side flow rather than the abandoned #9594 draft |
| API-submitted bid validation and flood publication, [Lodestar #9914](https://github.com/ChainSafe/lodestar/pull/9914) | Merged as `9ecc10f386` | BN-PUB-01 is complete; BID-01 should reuse the typed publish route |
| Per-call flood publication, [js-libp2p #3610](https://github.com/libp2p/js-libp2p/pull/3610) | Merged | Local Builder bids can be flood-published without globally changing gossipsub behavior |
| Bounded envelope cache, [Lodestar #9904](https://github.com/ChainSafe/lodestar/pull/9904) | Merged as `7aa8c9c93a` | Remains BN-side recovery and import evidence, not the Builder's primary payload store in the direct-Engine design |
| API-02 block observer, [Lodestar #9931](https://github.com/ChainSafe/lodestar/pull/9931) | Open | Remains valid as the standard selection fallback and SELECT-01 input |
| TEST-01 regressions, [Lodestar #9932](https://github.com/ChainSafe/lodestar/pull/9932) | Open | Remains independent foundation coverage |
| PAYLOAD-SOURCE-01, [Lodestar #9958](https://github.com/ChainSafe/lodestar/pull/9958) | Draft | First reviewed extraction from the direct-Engine proof of concept; keep runtime wiring and EL ownership in later slices |
| PAYLOAD-ORCH-01, [fork #61](https://github.com/krisoshea-eth/lodestar/pull/61) | Fork draft | Architecture-neutral orchestration core stacked on #9958; keep final Builder and CLI wiring blocked on EL ownership and authoritative BN inputs |
| STORE-CORE-01, [fork #63](https://github.com/krisoshea-eth/lodestar/pull/63) | Fork draft | Bounded in-memory retention stacked on #9958; keep signed-bid identity, publish ordering, envelope construction, reveal integration, metrics, and persistence in later slices |

## Cross-repository work still open

| Track | Current evidence | Boundary |
| --- | --- | --- |
| Direct-Engine Builder | [`nflaig/lodestar#4`](https://github.com/nflaig/lodestar/pull/4), draft | Working implementation baseline; decompose into reviewed slices |
| Payload-attributes hashes | [beacon-APIs #638](https://github.com/ethereum/beacon-APIs/pull/638), open | Adds `safe_block_hash` and `finalized_block_hash`; it no longer specifies post-Gloas emission timing |
| Builder-selection event | [beacon-APIs #599](https://github.com/ethereum/beacon-APIs/issues/599), open | SPEC-01 independently decides `block` extension versus a dedicated event; API-02 remains the fallback |
| Event implementation alternatives | Lodestar #9854, #9875, #9876, and #9896, open drafts | Comparison proofs only; do not merge all four |
| Engine and bid semantics | Lodestar [#9947](https://github.com/ChainSafe/lodestar/pull/9947) and [#9954](https://github.com/ChainSafe/lodestar/pull/9954), merged; [#9955](https://github.com/ChainSafe/lodestar/pull/9955), draft | #9947 pre-warms proposer-BN connections to external Builder API servers, not Builder-to-EL Engine connections. #9954 and #9955 affect exiting-Builder filtering and parent-slot semantics |
| Direct-Engine forkchoice input | [consensus-specs #5549](https://github.com/ethereum/consensus-specs/pull/5549), merged | Post-Gloas `notify_forkchoice_updated` now carries `custody_columns`; the project must decide the Builder node identity and the authoritative source of that value before PAYLOAD-01 lands |
| Mainnet-scale payment arithmetic | [Lodestar #9350](https://github.com/ChainSafe/lodestar/pull/9350), open | BASELINE-01 and OUT-01 must retain exact `bigint` quorum and pending-payment evidence before mainnet-readiness claims |
| EL-invalid and PTC behavior | Lodestar [#9332](https://github.com/ChainSafe/lodestar/pull/9332) and [#9637](https://github.com/ChainSafe/lodestar/pull/9637), open | EL-ARCH-01, QA-01, E2E-01, and OUT-01 own the fail-closed and recovery evidence |
| BN payload recovery | [Lodestar #9937](https://github.com/ChainSafe/lodestar/pull/9937), merged; [#9281](https://github.com/ChainSafe/lodestar/pull/9281), [#9791](https://github.com/ChainSafe/lodestar/pull/9791), and [#9326](https://github.com/ChainSafe/lodestar/pull/9326), open | REL-01 and E2E-01 track EMPTY range sync, impossible targets, stale roots, and non-finality; no new Builder module is required |
| Blob cleanup | [Lodestar #9957](https://github.com/ChainSafe/lodestar/pull/9957), draft | Removes older pre-Fulu blob retrieval code, not Gloas `getPayload` blob bundles; PAYLOAD-SOURCE-01 remains valid |

## Engine ownership and source-input audit

Current Lodestar calls `notifyForkchoiceUpdate` from block import, execution-payload import, next-slot preparation, and block production. The BN derives safe and finalized execution hashes from its fork-choice view and derives custody columns from its own custody configuration. A standalone Builder without a p2p custody identity cannot silently claim the BN's custody set as its own.

Beacon APIs #638 adds `safe_block_hash` and `finalized_block_hash` to the `payload_attributes` schema and example only. It keeps event frequency implementation-dependent. Current Lodestar prepares the event in `prepareNextSlot` and may emit it for proposer preparation or when the payload-attributes flag is enabled. The PR does not settle post-Gloas trigger timing, FULL/EMPTY variants, deduplication, or the source of `custody_columns`.

Nico confirmed direct Engine access as the working direction because it avoids a new low-priority BN API surface and keeps the payload source replaceable by dedicated building software later. The remaining production decision is narrower. Sharing an EL requires Builder `forkchoiceUpdated` calls to follow the source BN's emitted payload attributes without moving the EL to a conflicting view. Dedicated Builder ELs avoid that conflict but require their own sync, readiness, JWT, custody, and failure-isolation contract. PAYLOAD-SOURCE-01, the unwired PAYLOAD-ORCH-01 core, and STORE-CORE-01 may progress independently; final runtime and CLI wiring still waits on the supported topology and authoritative input contract.

## Current contributor overlap

The public PR audit refreshed on 2 September found no separate open extraction of the direct-Engine payload source, payload store, or Builder-owned bid pipeline outside Nico's proof of concept and Kris's drafts.

- Marco owns open beacon-APIs #638. His Lodestar #9854, #9875, #9876, and #9896 remain event-shape comparison proofs. His bid-validation and flood-publication work is already merged through Lodestar #9914 and js-libp2p #3610. On 2 September he said he was curating payload storing and sourcing work, but no corresponding public branch or PR was visible yet; coordinate the source/store split before either contributor expands those drafts.
- Nico owns the proof-of-concept branch plus draft Lodestar #9955. His #9947 and #9954 have merged. #9947 concerns proposer-BN connections to external Builder API servers; #9954 and #9955 change exiting-Builder filtering and parent-slot semantics and must be refreshed before extracting affected code.
- NC has no public PR implementing the direct-Engine Builder slices. His open Gloas and FOCIL work remains relevant to fork compatibility but does not claim PayloadStore, BidPolicy, SlotBidder, or Revealer ownership.
- Kris owns draft Lodestar #9958 for the narrow PayloadSource contract and injected Engine adapter, fork draft #61 for unwired orchestration, and fork draft #63 for bounded store-core retention. The drafts deliberately exclude final runtime ownership, bid integration, selection, and reveal.

Private branches and direct-message commitments cannot be inferred from public GitHub. Confirm ownership with Marco before starting a code branch even when a slice appears publicly unclaimed.

## Revised implementation slices

The issue identifiers are retained so the audit history and GitHub mirror remain readable. Their working scopes change as follows.

### Slice 1: chain inputs and payload attributes

- Reconcile BN-01 with merged #9832 and identify the source-BN data the standalone Builder still needs.
- Standardize safe and finalized execution hashes through #638 or its reviewed successor.
- Define post-Gloas payload-attributes emission and deduplication separately from the field-schema PR.
- Decide whether `custody_columns` is derived from Builder or EL configuration or supplied as another typed source-BN input.
- Consume proposer preferences and payload attributes without joining libp2p.

### Slice 2: direct Engine payload source

- Replace BN-02's BN-owned payload job with a `PayloadSource` interface and an initial `EnginePayloadSource`.
- Add explicit Engine URL and JWT configuration with bounded request behavior.
- Resolve whether the Builder uses dedicated ELs or shares a BN EL before accepting a two-writer `forkchoiceUpdated` model.
- Define the Builder's Engine node identity and pass the post-Gloas `custody_columns` value required by consensus-specs #5549.
- Build one parent/head variant first. Add the parent-of-head or FULL/EMPTY alternative only when its correctness and resource bounds are clear.

### Slice 3: payload retention, policy, and bid construction

- Replace BN-04's source-BN stateful cache with a Builder-owned `PayloadStore` keyed by execution block hash.
- Retain the exact payload, blobs, commitments, proofs, and execution requests needed for a stateless envelope.
- Carry slot and parent beacon block root from the orchestration input into the stored record; they are not properties of `BuiltPayload` itself.
- Keep complete signed-bid identity and insert-before-publish enforcement in the bid integration slice rather than inventing them inside an isolated store.
- Update BN-03 and BID-01 so the Builder constructs, values, signs, and submits the bid itself.
- Reuse the BN validation and flood-publication path landed in #9914.
- Keep the first policy simple and coverable. Multi-EL selection and a durable ledger remain follow-ups.

### Slice 4: selection and reveal

- Keep API-02 unchanged in purpose: one source-BN `block` event leads to one bounded, fork-correct block evaluation.
- SELECT-01 matches the selected signed bid to a locally retained payload record.
- REV-01 builds and signs the exact stateless envelope from `PayloadStore`, then submits it through the source BN.
- Keep API-02, SPEC-01, and reveal policy separate. An enriched event may reduce negative-path block fetches but is not required for correctness.

### Slice 5: hardening and phase 2

- Add restart recovery only after the in-memory path works and its safety contract is explicit.
- Add multi-EL maximum-value selection, reveal redundancy, and durable ledger recovery as independently bounded issues.
- Retain non-finality, hostile multi-branch, and strategic withholding experiments behind their existing activation gates.

## Superseded assumptions

The following accepted-plan statements are provisional history rather than current implementation instructions:

- the Builder never connects directly to an EL;
- the source BN constructs the Builder's complete unsigned bid;
- the source BN is the primary owner of reveal material;
- reveal normally retrieves an unsigned envelope from the same BN;
- FULL and EMPTY payload preparation is only a late conditional extension;
- local bid publication does not need a dedicated flood-publication path.

The still-valid constraints are:

- the source BN remains authoritative for chain state, proposer inputs, validation, publication, and outcomes;
- the Builder uses source-BN REST/SSE rather than direct p2p subscriptions for chain observation;
- exact-width values and fork-correct SSZ types must be preserved;
- no bid is published unless the exact reveal material is retained and coverable;
- work, retries, storage, and shutdown are bounded;
- public API changes require upstream and cross-client agreement.

## Questions that block final wiring, not component work

Nico confirmed direct Engine access, p2p-first delivery, in-memory retention for the first loop, and decomposition of the proof of concept rather than upstreaming it as one PR. The remaining questions are:

1. Should Builder ELs normally be dedicated, or may the BN and Builder share an EL under a documented `forkchoiceUpdated` invariant?
2. Which safe/finalized hash and post-Gloas payload-attributes changes are prerequisites for final runtime wiring?
3. Should the first runtime slice include one payload variant or both parent/head variants?
4. Where should a direct-Engine Builder obtain the post-Gloas `custody_columns` value required by consensus-specs #5549?
5. How should Kris and Marco divide payload sourcing, orchestration, and storage work without duplicating active drafts?

Maintainer answers can change the affected slices without reopening API-02, TEST-01, ENV-02, or SPEC-01's independent event-contract process.

## Applied board reconciliation

- BN-PUB-01 (`LOD-53`) is Done with #9914 and js-libp2p #3610 evidence.
- API-02 and TEST-01 remain independent upstream review tracks.
- SPEC-01 remains open and separate from #638.
- Epic B and PAYLOAD-01/STORE-01/BID-CORE-01/BID-01/SELECT-01/REV-01 now describe the provisional direct-Engine ownership boundary.
- ATTR-SPEC-01 (`LOD-54`) tracks #638 through review.
- ATTR-01 (`LOD-55`) tracks the missing post-Gloas payload-attributes emission contract.
- EL-ARCH-01 (`LOD-56`) blocks PAYLOAD-ORCH-01 runtime wiring and the final production boundary. It does not block review of PAYLOAD-SOURCE-01's injected contract.
- Direct Engine access is the working implementation baseline. EL-ARCH-01 now decides only the supported shared versus dedicated EL topology and its safety contract.
- PAYLOAD-SOURCE-01 (`LOD-57`) is In Progress through draft Lodestar #9958. PAYLOAD-ORCH-01 (`LOD-58`) is In Progress through fork draft #61; its architecture-neutral core may be reviewed now, while final runtime wiring remains blocked on the source contract, EL ownership, and source-BN inputs.
- STORE-CORE-01 (`LOD-59`) is In Review through fork draft #63. The STORE-01 parent remains open for complete bid identity, insert-before-publish enforcement, envelope construction, reveal integration, metrics, and durability.
- BN-01, PAYLOAD-01, ATTR-01, ATTR-SPEC-01, and EL-ARCH-01 record the new `custody_columns` input question introduced by consensus-specs #5549.
- ENV-02 remains open until a second contributor reproduces its stored runbook.

Before each implementation slice starts, refresh `unstable`, the proof-of-concept branch, and the listed open PRs. Maintainer feedback may revise this split without invalidating the evidence that led to it.

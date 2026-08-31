# Provisional direct-Engine Builder plan

> **Status:** Working architecture baseline as of 31 August 2026. This is not a final maintainer decision. It supersedes the BN-mediated ownership statements in the accepted implementation plan and Living Technical Note only while the direct-Engine direction is evaluated.

## Purpose

Nico's [`nflaig/builder`](https://github.com/nflaig/lodestar/tree/builder) branch demonstrates an end-to-end Builder that owns payload construction through local execution clients. This differs materially from the accepted plan, where the source beacon node owns payload construction and stateful reveal material.

The branch is implementation evidence, not an upstream-ready patch. At [`99fd8fa9ad`](https://github.com/nflaig/lodestar/commit/99fd8fa9ad3a867fced3a5907a68edf3a519c1cd) it contains 10 commits and changes 42 files relative to its older base. Current Lodestar `unstable` was [`1e9a530f98`](https://github.com/ChainSafe/lodestar/commit/1e9a530f9897d50d2d6337cd4143c8dc53667c66) when this reconciliation was prepared. The project should extract small reviewed changes from the proof of concept rather than merge or reproduce it as one unit.

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

| Capability | Status on 31 August | Project consequence |
| --- | --- | --- |
| Gloas Builder API flow, [Lodestar #9832](https://github.com/ChainSafe/lodestar/pull/9832) | Merged as `57572140f8` | Re-audit BN-01 against the landed proposer/BN-side flow rather than the abandoned #9594 draft |
| API-submitted bid validation and flood publication, [Lodestar #9914](https://github.com/ChainSafe/lodestar/pull/9914) | Merged as `9ecc10f386` | BN-PUB-01 is complete; BID-01 should reuse the typed publish route |
| Per-call flood publication, [js-libp2p #3610](https://github.com/libp2p/js-libp2p/pull/3610) | Merged | Local Builder bids can be flood-published without globally changing gossipsub behavior |
| Bounded envelope cache, [Lodestar #9904](https://github.com/ChainSafe/lodestar/pull/9904) | Merged as `7aa8c9c93a` | Remains BN-side recovery and import evidence, not the Builder's primary payload store in the direct-Engine design |
| API-02 block observer, [Lodestar #9931](https://github.com/ChainSafe/lodestar/pull/9931) | Open | Remains valid as the standard selection fallback and SELECT-01 input |
| TEST-01 regressions, [Lodestar #9932](https://github.com/ChainSafe/lodestar/pull/9932) | Open | Remains independent foundation coverage |

## Cross-repository work still open

| Track | Current evidence | Boundary |
| --- | --- | --- |
| Direct-Engine Builder | [`nflaig/lodestar#4`](https://github.com/nflaig/lodestar/pull/4), draft | Working implementation baseline; decompose into reviewed slices |
| Payload-attributes hashes | [beacon-APIs #638](https://github.com/ethereum/beacon-APIs/pull/638), open | Adds `safe_block_hash` and `finalized_block_hash`; it no longer specifies post-Gloas emission timing |
| Builder-selection event | [beacon-APIs #599](https://github.com/ethereum/beacon-APIs/issues/599), open | SPEC-01 independently decides `block` extension versus a dedicated event; API-02 remains the fallback |
| Event implementation alternatives | Lodestar #9854, #9875, #9876, and #9896, open drafts | Comparison proofs only; do not merge all four |
| Engine and bid semantics | Lodestar #9947, #9954, and #9955, open | Watch for connection setup, exiting-Builder filtering, and parent-slot changes before extracting affected slices |

## Revised implementation slices

The issue identifiers are retained so the audit history and GitHub mirror remain readable. Their working scopes change as follows.

### Slice 1: chain inputs and payload attributes

- Reconcile BN-01 with merged #9832 and identify the source-BN data the standalone Builder still needs.
- Standardize safe and finalized execution hashes through #638 or its reviewed successor.
- Define post-Gloas payload-attributes emission and deduplication separately from the field-schema PR.
- Consume proposer preferences and payload attributes without joining libp2p.

### Slice 2: direct Engine payload source

- Replace BN-02's BN-owned payload job with a `PayloadSource` interface and an initial `EnginePayloadSource`.
- Add explicit Engine URL and JWT configuration with bounded request behavior.
- Resolve whether the Builder uses dedicated ELs or shares a BN EL before accepting a two-writer `forkchoiceUpdated` model.
- Build one parent/head variant first. Add the parent-of-head or FULL/EMPTY alternative only when its correctness and resource bounds are clear.

### Slice 3: payload retention, policy, and bid construction

- Replace BN-04's source-BN stateful cache with a Builder-owned `PayloadStore` keyed by execution block hash.
- Retain the exact payload, blobs, commitments, proofs, and execution requests needed for a stateless envelope.
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

## Questions that block final acceptance, not provisional planning

1. Is direct Engine access the intended production boundary or only the preferred proof-of-concept direction?
2. Should Builder ELs normally be dedicated, or may the BN and Builder safely share an EL while both call `forkchoiceUpdated`?
3. Which safe/finalized hash and post-Gloas payload-attributes changes are prerequisites for the first extraction?
4. Should the first upstream slice include one payload variant or both parent/head variants?
5. Is in-memory payload retention acceptable for the first reviewed loop, with restart durability deferred?
6. Which parts of `nflaig/builder` should be opened by Nico and which should Kris and Marko reimplement as smaller PRs?
7. Does the core project remain p2p-Builder-first, with Builder API server work kept separate?

Maintainer answers can change the affected slices without reopening API-02, TEST-01, ENV-02, or SPEC-01's independent event-contract process.

## Applied board reconciliation

- BN-PUB-01 (`LOD-53`) is Done with #9914 and js-libp2p #3610 evidence.
- API-02 and TEST-01 remain independent upstream review tracks.
- SPEC-01 remains open and separate from #638.
- Epic B and BN-02/BN-03/BN-04/BID-01/REV-01 now describe the provisional direct-Engine ownership boundary.
- ATTR-SPEC-01 (`LOD-54`) tracks #638 through review.
- ATTR-01 (`LOD-55`) tracks the missing post-Gloas payload-attributes emission contract.
- EL-ARCH-01 (`LOD-56`) blocks PayloadSource implementation until shared-versus-dedicated EL ownership is decided.
- ENV-02 remains open until a second contributor reproduces its stored runbook.

Before each implementation slice starts, refresh `unstable`, the proof-of-concept branch, and the listed open PRs. Maintainer feedback may revise this split without invalidating the evidence that led to it.

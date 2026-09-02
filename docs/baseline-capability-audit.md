# BASELINE-01 capability audit

**Completed:** 2 September 2026  
**Accepted implementation pin:** Lodestar `57572140f8b75ab72466a869bf7bdc0ad0db265e`  
**Current comparison head:** Lodestar `unstable` at `9ba9a5ce851f8a3b3aa0cb0751ace8c2bf044dbe`  
**Immutable release targets:** v1.46.0 at `3873dd5b032d0ad82581fc3416e9628b4f6f2642` and v1.47.0-rc.0 at `2aff495d9c3ecb1e7f15a431d3b0a4616f4bf103`  
**Protocol snapshot:** consensus-specs v1.7.0-alpha.14, Builder APIs through merged #165/#166/#167, Beacon APIs through merged #630, and Keymanager APIs through merged #92/#93

This audit records what is present, what is under review, and what remains missing. An open pull request, release candidate, fixture tag, or point-in-time runtime observation is evidence for that item only. It is not evidence that the complete Builder lifecycle works.

## Validation baseline

The clean pinned checkout used Node 24.13.0 and pnpm 11.0.0. The frozen install, monorepo build, repository type-check, Biome checks, Builder build, Builder type-check, Builder lint, and the then-current 27 Builder unit tests passed. The CLI build's nested Corepack invocation encountered a local cache-permission boundary; direct execution of the generated `writeGitData.js` succeeded. This was recorded as a local tool boundary, not a source failure.

Current feature branches must still record their own base SHA and rerun checks relevant to their diff. The accepted reproducibility pin is deliberately not advanced whenever `unstable` moves.

## Capability matrix

| Capability | Evidence on the audited baseline | Project status |
| --- | --- | --- |
| Builder package, CLI, local key loading, and signing | Lodestar #9758, #9766, and #9770 | Landed. `CLI-01` and `SIGN-01` remain Done |
| Source-BN genesis, config, readiness, identity, and shutdown foundation | Lodestar #9725, #9726, #9781, #9827, #9839, and #9868 | Landed. `API-01` remains Done; TEST-01 and REVIEW-01 retain only their separated evidence work |
| Builder metrics and CLI handler coverage | Lodestar #9848 and #9860 | Landed. `MET-01` remains Done |
| Proposer and BN-side Gloas Builder API flow | Builder APIs #165/#166/#167, Beacon APIs #630, Keymanager APIs #92/#93, and Lodestar #9832 | Landed proposer/BN foundation. `BN-01` still owns the standalone Builder's authoritative input contract |
| API-submitted bid validation and flood publication | Lodestar #9914 and js-libp2p #3610 | Landed. `BN-PUB-01` remains Done |
| Head-compatible bid validation and epoch-boundary behavior | Lodestar #9739, #9756, and #9864 | Landed. #9813 closed without merge and is historical evidence only; `BID-01` retains regression coverage |
| Exact-width Gloas payment, gas-limit, and preference fields | Lodestar #9749, #9750, and #9751 | Landed. Downstream Builder code must preserve `bigint` and fork-correct SSZ values |
| Selection observation through source-BN REST/SSE | Lodestar #9931 | In upstream review as `API-02`; block plus `getBlockV2` remains the compatibility fallback |
| Readiness and lifecycle regressions | Lodestar #9932 | In upstream review as TEST-01 |
| Reproducible local environment and API-02 runtime smoke | ENV-02 runbook and first-machine evidence | First-machine evidence complete; independent second-contributor reproduction remains open |
| Direct Engine payload-source boundary | Lodestar #9958 | Direct Engine is the confirmed working direction. Draft PAYLOAD-SOURCE-01 keeps production EL topology and CLI wiring out of this review slice |
| Bounded payload-job orchestration | Fork draft #61 | Architecture-neutral PAYLOAD-ORCH-01 core exists; final wiring remains blocked on EL ownership and source-BN inputs |
| Builder-owned payload retention | Nico's proof of concept and fork draft #63 | A bounded store core is in fork review. STORE-01 still must bind retained material to complete bid identity, publication ordering, and reveal integration |
| Builder-owned bid construction and coverability | Nico's `BidPolicy`, `Ledger`, and `SlotBidder` prototypes only | Missing upstream. `BID-CORE-01` and `BID-01` remain valid future slices |
| Exact selected-bid matching and stateless reveal | Nico's prototype only | Missing upstream. `SELECT-01` and `REV-01` remain valid future slices |
| Restart, replay, non-finality, and outcome evidence | Partial BN infrastructure and monitoring evidence | Not complete. `REL-01`, `QA-01`, `OUT-01`, `DATA-01`, and `E2E-01` remain valid later work |
| Cross-client Builder-selection event | Beacon APIs #599 and Lodestar #9854/#9875/#9876/#9896 | Unsettled. `SPEC-01` remains independent from API-02 correctness |

## Historical and moving upstream work

- #9594 closed without merge. The accepted Builder API path is the merged specification and Lodestar #9832, not the abandoned draft.
- #9813 closed without merge on 25 August. Merged #9864 is the epoch-boundary head-freshness baseline.
- #9790 and #9792 landed shutdown and resource corrections. #9793 closed without merge because its self-signal and forced-exit approach did not generalize. Builder restart and cache recovery remain explicit REL-01 and E2E evidence rather than inferred completion.
- #9736, #9761, #9854, #9875, #9876, #9896, and #9903 remain draft comparison or compliance work. They are tracked without duplicating their code.
- #9904 landed bounded BN-side envelope caching and reload recovery. It is not a substitute for a Builder-owned direct-Engine payload store.
- #9937 landed EMPTY payload range-sync support. Remaining impossible-target, stale-root, non-finality, and recovery cases stay in REL-01 and E2E-01.
- #9947 and #9954 merged. They cover proposer-BN external-Builder connection prewarming and exiting-Builder filtering, not the standalone Builder's Engine source or payload lifecycle.
- #9955, #9957, #9964, and #9966 are active watches for parent-slot inputs, older blob-path cleanup, event-stream resilience, and BN-side candidate ranking. None duplicates #9958 or fork draft #61.
- The 11 August to 1 September audit covered all 65 then-open Lodestar pull requests and all 110 pull requests closed or merged during that interval. No completed Builder issue required reopening and no untracked upstream implementation claimed STORE-01 or the later Builder-owned lifecycle.

## Result

The project pin, reproducibility record, capability matrix, and historical upstream audit are complete. The matrix confirms that no public ChainSafe implementation duplicates #9958 or fork drafts #61 and #63. Marco announced payload sourcing and storage curation on 2 September, so ownership must be coordinated before those drafts expand. It also confirms that the complete honest Builder lifecycle is not yet upstream: store integration, bid construction, exact selection matching, reveal, and outcome evidence remain real work.

Before any new implementation slice starts, refresh current `unstable`, Nico's proof-of-concept branch, and directly overlapping open pull requests. Do not advance issue status from a release tag, fixture, or prototype alone.

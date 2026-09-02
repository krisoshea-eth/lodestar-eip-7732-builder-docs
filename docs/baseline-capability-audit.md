# BASELINE-01 capability audit

**Completed:** 2 September 2026  
**Accepted implementation pin:** Lodestar `57572140f8b75ab72466a869bf7bdc0ad0db265e`  
**Current comparison head:** Lodestar `unstable` at `7d85330f928c015202341da63624f6b00c420c43`
**Immutable release targets:** v1.46.0 at `3873dd5b032d0ad82581fc3416e9628b4f6f2642` and v1.47.0 at `450996b13ab305b860acd131c87f799fdbfbabf0`
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
| Direct Engine payload-source boundary | Lodestar #9958 | Ready PAYLOAD-SOURCE-01 extraction. No runtime construction, CLI wiring, or production EL topology is accepted yet |
| Bounded payload-job orchestration | Lodestar #9973 | Architecture-neutral PAYLOAD-ORCH-01 draft exists; final wiring still depends on source-BN inputs and Engine configuration |
| Builder-owned payload retention | Lodestar #9970 and contribution PR #9 | One upstream store draft exists. STORE-01 remains open until accepted hardening, retain-before-publish ordering, envelope integration, metrics, and later durability are delivered |
| Builder-owned bid construction and coverability | Lodestar #9974/#9975/#9976/#9978/#9979 and contribution PR #10 | Pure policy, ledger, preference, assembly, and publication boundaries are now under review or in draft. `BID-CORE-01` and `BID-01` remain open until the integrated bid path works |
| Exact selected-bid matching and stateless reveal | Lodestar #9980/#9981/#9982 | Draft service boundaries exist. `SELECT-01` and `REV-01` remain open until selected local material is matched, assembled, and submitted through the runtime |
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
- #9964 merged on 2 September and contains individual SSE event/consumer failures without providing replay. REL-01 therefore retains connected-stream gap reconciliation as well as reconnect recovery.
- v1.47.0 was published at `450996b13a` and merged back to `unstable` through #9971. It is the newest immutable release target, but it predates the direct-Engine service PR series and is not evidence that the standalone Builder lifecycle is complete.
- #9955, #9957, and #9966 remain active watches for parent-slot inputs, older blob-path cleanup, and BN-side candidate ranking. None duplicates #9958 or #9973.
- Consensus #5594 and Lodestar #9972 now own rejection of bids whose block hash equals the parent hash. Track their disposition in BID-CORE-01 and QA-01 instead of duplicating the validation.
- Buildoor #184 merged Builder-preference handling without an external Builder URL and three local/p2p selection paths. Reuse that environment evidence in E2E-01, while noting that its no-URL regression is directly covered at unit level rather than by the full E2E assertion.
- consensus-specs #5585 merged a source-tree version bump to `v1.7.0-beta.0`, but no beta tag or GitHub release exists yet and Lodestar still pins `v1.7.0-alpha.14`. Keep alpha.14 as the immutable project snapshot until Lodestar deliberately updates its spec-test pin.
- Buildoor #186 proposes a deterministic geth-only testing build source through `testing_buildBlockV1`. It can strengthen later payload-content and transaction-order E2E evidence, but it is not a production Engine contract and does not replace #9958.
- Draft consensus-specs #5573 and #5590 propose Gloas state-transition compliance generation and an exploratory envelope ReqResp format. Route accepted outputs to QA-01/OUT-01/REL-01 rather than creating another Builder service.
- execution-apis #870 and #878 refine Heze inclusion-list size and non-empty response rules. They remain conditional EXT-FOCIL-01 inputs and do not change the current Gloas implementation sequence.
- The 11 August to 2 September audit covered the full then-open Lodestar PR list, recent closed/merged PRs, Nico's complete proof-of-concept diff, and directly relevant consensus/API/Buildoor work. No completed Builder issue required reopening. The newly opened service drafts now claim review boundaries, but they do not complete their parent lifecycle issues.

## Result

The immutable project pin, reproducibility record, capability matrix, and historical upstream audit are complete. Current drafts are not duplicated by another active ChainSafe implementation, but their service boundaries are not yet maintainer-accepted. The complete honest Builder lifecycle is still missing runtime integration and end-to-end proof: source inputs, payload construction, storage, bid construction/publication, exact selection matching, reveal, and protocol outcomes must operate together.

Before any new implementation slice starts, refresh current `unstable`, Nico's proof-of-concept branch, and directly overlapping open pull requests. Do not advance issue status from a release tag, fixture, or prototype alone.

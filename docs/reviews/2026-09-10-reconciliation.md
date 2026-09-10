# Builder reconciliation, 10 September 2026

## Scope

Refreshed all open Lodestar PRs, the recent updated/closed inventory, both contributor forks, and all 83 Linear issues and GitHub Project items. Inspected Builder-relevant upstream deltas and compared all 11 open upstream Kris PR heads plus four open fork PRs with the prior manual review. No open contribution PR remains in Marko's fork; #9 and #10 are already incorporated into his upstream store and policy branches.

This is a current-head compatibility and tracking sweep, not a new exhaustive review of every line in Lodestar. No CodeRabbit review was used. A green aggregate that contains only title or reconciliation jobs is not build/test evidence.

## Current implementation

- #9931, #9958, #9975 and #9976 are non-draft and mergeable. Normal maintainer review remains necessary.
- #9976 at `a7f841000c4159fb672e8d518231c300b6c5daf4` now subscribes to proposer preferences during Builder startup, prunes by slot and shares the Builder abort signal. It reuses `MapDef` and the BN pool's read-only retained-value convention, without custom copying. Dependent-root derivation is still BN-01 work.
- Fork #77 at `cda129bcf5b1fe37d9ce4d93d4de7f8bb6d4ceae` consumes the same preference contract and reuses `GWEI_TO_WEI`. Earlier 10 September validation passed 72 focused tests and 43 SlotBidder tests against Marko's simple store, with package checks. These are component tests, not a real complete Builder loop.
- #9973 and #9978 through #9982 remain dependent service drafts. Their parent code remains unmerged; grouping around runtime consumers still needs maintainer agreement. Fork #61 is the clean orchestration comparison, not another upstream candidate. Fork #63 is an unaccepted broader store proposal, not a replacement for #9970.
- Fork #77 remains integration evidence. Fork #80 remains the separate payload-attributes hash-field proposal while beacon-APIs #638 is open. Neither is promoted solely to create another upstream PR.

## Upstream impact

| Change                                           | Disposition                                                  | Builder consequence                                                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| #10010, Marko's two-BN environment               | Merged 9 September                                           | ENV-03 setup is Done. E2E/INT outcomes and independent ENV-02 reproduction remain separate                                                |
| #10045, Marko's identity polling                 | Open, non-draft                                              | Already owned in FIX-01. Preserve its ownership and update the GitHub mirror; do not reopen merged TEST-01                                |
| #10016, Marko's state-transition metrics         | Open, non-draft                                              | Already linked in QA-01. BN processing diagnostics are not Builder service metrics or a completed QA gate                                 |
| #10037, NC's earlier payload-attributes emission | Open                                                         | Reuse its ordering change in ATTR-EMIT-01. It does not settle FULL/EMPTY, deduplication or the complete input schema                      |
| #10027, finalized safe-hash fallback             | Merged 10 September                                          | Use the existing helper in BN-01/#80 rather than adding a second fallback                                                                 |
| #10035/#10036, finalized/head event triggers     | Merged                                                       | Better event triggers do not provide replay or close REL-01                                                                               |
| #10025, rejected-envelope pruning                | Closed unmerged                                              | twoeths plans a caller-level follow-up. Do not count the proposed behavior as delivered or start duplicate work                           |
| #10028/#10029/#10030 and #10022                  | Open watches                                                 | Recovery/archival work remains upstream, distinct from Builder-owned retention and restart recovery                                       |
| #9761, Gloas compliance                          | Merged 10 September                                          | Consume upstream compliance evidence; do not create a second Builder-only compliance harness                                              |
| #10042/#10051 and open #10053                    | SSZ bounds/request types merged; gossip-size derivation open | Track serialization compatibility. NewPayloadRequest does not replace the FCU/getPayload source contract or remove retained blob material |

## Board corrections

The original 83 issues all have GitHub Project mirrors. Corrected four pre-existing status mismatches and two missing assignments. GitHub now has explicit Canceled and Duplicate options in both status fields instead of presenting those outcomes as delivered work. FIX-01 and PRESENTATION-01 retain Marko's Linear ownership and In Progress state. ENV-03 is Done for the merged setup scope. Updated ATTR-EMIT-01 and REL-01 with the upstream overlap/disposition above.

No new issue is needed for #10016 because QA-01 already records it. Runtime-consumer issues remain unassigned pending coordination. No ownership agreement or complete runtime outcome is inferred from a component PR.

## Validation and remaining work

The separate simulation-hardening PR [#10054](https://github.com/ChainSafe/lodestar/pull/10054) is now ready for review. It preserves unexpected-error failures and verifies the exact target root after publication. Its exact head is `4395622a35744509bc026d181f6b0be960da0bdf`. An isolated pinned-dependency build completed TypeScript compilation through the CLI; the local Corepack launcher failed on the trailing metadata command, which was run directly without source changes. Ten focused tests, ordinary CLI type-check and changed-file Biome passed in that isolated checkout.

The full Docker multifork simulation passed locally from 13:27 to 13:33 UTC on 10 September, exit 0. It used the repository-pinned Geth v1.16.7 and Lighthouse unstable-d235f2c images. The missing-parent publication path completed exact-root sync; the focused regressions cover the successful-publication race. This Electra simulation is not a Gloas Builder bid/reveal E2E test. See the [run evidence](../evidence/2026-09-10-multifork.md). Test containers and the simulation network were removed by normal cleanup; existing Kurtosis resources were untouched.

Hosted checks for #9931, #9958 and #9975 include successful build, unit, type, lint and simulation jobs. At inspection, the amended #9976 head and #10054 had only metadata checks. Their reported local validation is not a claim of full hosted CI coverage.

Priorities remain validation of existing PRs, the agreed policy-versus-caller validation boundary, authoritative source-BN inputs, and the existing bid/reveal integration work. Keep SPEC-01 separate. ENV-02 outreach remains paused, and another run by Kris does not satisfy its independent-reproduction criterion.

No routine unstable merge, force push, mentor review request, Discord message or Beacon APIs post was made. Only the two approved replies to Nico on #9976 were posted.

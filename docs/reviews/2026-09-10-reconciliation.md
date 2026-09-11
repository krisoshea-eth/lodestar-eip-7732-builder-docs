# Builder reconciliation, 10 September 2026

## Scope

Refreshed all open Lodestar PRs, the recent updated/closed inventory, both contributor forks, and all 83 existing Linear issues and GitHub Project items. The afternoon follow-up adds two supporting contribution trackers, bringing the inventory to 85. Inspected Builder-relevant upstream deltas and compared all 11 open upstream Kris PR heads plus four open fork PRs with the prior manual review. No open contribution PR remains in Marko's fork; #9 and #10 are already incorporated into his upstream store and policy branches. The upstream compatibility reference is `b6386729a9bae860368ef4a2ac6b288d3fd246aa`; existing PR branches were not refreshed to it.

This is a current-head compatibility and tracking sweep, not a new exhaustive review of every line in Lodestar. No CodeRabbit review was used. A green aggregate that contains only title or reconciliation jobs is not build/test evidence.

## Current implementation

- #9931, #9958, #9975 and #9976 are non-draft and mergeable. Normal maintainer review remains necessary.
- #9976 at `a7f841000c4159fb672e8d518231c300b6c5daf4` now subscribes to proposer preferences during Builder startup, prunes by slot and shares the Builder abort signal. It reuses `MapDef` without custom copying. Correction on 11 September: the merged tracker retains received objects directly and does not promise a read-only caller contract. Dependent-root derivation is still BN-01 work.
- Fork #77 at `c6c3c89f0360535b0f4c428fcc8b75b3b7e8e2d7` consumes the same preference contract and reuses `GWEI_TO_WEI`. Its composed tests now pass the derived block hash explicitly and inspect retention through `get()` rather than relying on the older store's `add()` return value. At this head, 72 focused tests and package checks passed; all 47 SlotBidder/pipeline tests passed with both the fork store and Marko's actual #9970 store. These are component tests, not a real complete Builder loop.
- #9973 and #9978 through #9982 remain dependent service drafts. Their parent code remains unmerged; grouping around runtime consumers still needs maintainer agreement. Fork #61 is the clean orchestration comparison, not another upstream candidate. Fork #63 is an unaccepted broader store proposal, not a replacement for #9970.
- Fork #77 remains integration evidence. Fork #80 remains the separate payload-attributes hash-field proposal while beacon-APIs #638 is open. Neither is promoted solely to create another upstream PR.

## Upstream impact

| Change                                           | Disposition                                                  | Builder consequence                                                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| #10010, Marko's two-BN environment               | Merged 9 September                                           | ENV-03 setup is Done. E2E/INT outcomes and independent ENV-02 reproduction remain separate                                                |
| #10045, Marko's identity polling                 | Merged 10 September                                          | FIX-01 is Done, still assigned to Marko; do not reopen merged TEST-01                                                                     |
| #10016, Marko's state-transition metrics         | Open, non-draft                                              | Current scope is individual `processBlock` steps, not the earlier clone/slot/signature proposal. Track in LOD-84; QA remains open         |
| #10037, NC's earlier payload-attributes emission | Merged 10 September                                          | Reuse its ordering change in ATTR-EMIT-01. It does not settle FULL/EMPTY, deduplication or the complete input schema                      |
| #10056, Nico's payload-attributes reuse          | Open draft                                                   | Optional reuse for local EL preparation. Nico is assessing its small performance benefit; not a prerequisite for #80 or the Builder       |
| #10027, finalized safe-hash fallback             | Merged 10 September                                          | Use the existing helper in BN-01/#80 rather than adding a second fallback                                                                 |
| #10035/#10036, finalized/head event triggers     | Merged                                                       | Better event triggers do not provide replay or close REL-01                                                                               |
| #10025, rejected-envelope pruning                | Closed unmerged                                              | twoeths plans a caller-level follow-up. Do not count the proposed behavior as delivered or start duplicate work                           |
| #10028/#10029/#10030 and #10022                  | Open watches                                                 | Recovery/archival work remains upstream, distinct from Builder-owned retention and restart recovery                                       |
| #9761, Gloas compliance                          | Merged 10 September                                          | Consume upstream compliance evidence; do not create a second Builder-only compliance harness                                              |
| #10055, payload-attestation batch signatures     | Merged 10 September                                          | Addresses the earlier #9761 verification gap; do not repeat that review comment                                                           |
| #10042/#10051 and open #10053                    | SSZ bounds/request types merged; gossip-size derivation open | Track serialization compatibility. NewPayloadRequest does not replace the FCU/getPayload source contract or remove retained blob material |
| eth2-val-tools #32, Marko's empty-directory fix  | Open, non-draft                                              | Key-generation support tracked in LOD-85, not another Builder lifecycle component or independent ENV-02 reproduction                      |

## Board corrections

The original 83 issues all have GitHub Project mirrors. The earlier pass corrected four pre-existing status mismatches and two missing assignments. The afternoon comparison found no further mismatches across status, Linear status, assignee or issue open/closed state. GitHub has explicit Canceled and Duplicate options in both status fields. FIX-01 is now Done after #10045 merged; PRESENTATION-01 remains In Progress. Both retain Marko's ownership. ENV-03 is Done for the merged setup scope. Updated BN-01, ATTR-IMPL-01, ATTR-EMIT-01, QA-01, E2E-01 and SlotBidder evidence with the current upstream scope and disposition.

Added two supporting trackers assigned to Marko and In Review: [LOD-84](https://linear.app/kriso/issue/LOD-84) / [GitHub #90](https://github.com/krisoshea-eth/lodestar/issues/90) for [#10016](https://github.com/ChainSafe/lodestar/pull/10016), previously visible only inside QA-01; and [LOD-85](https://linear.app/kriso/issue/LOD-85) / [GitHub #91](https://github.com/krisoshea-eth/lodestar/issues/91) for [eth2-val-tools #32](https://github.com/protolambda/eth2-val-tools/pull/32). These record existing contributions, not new competing assignments. Runtime-consumer issues remain unassigned pending coordination. No ownership agreement or complete runtime outcome is inferred from a component PR.

## Validation and remaining work

The separate simulation-hardening PR [#10054](https://github.com/ChainSafe/lodestar/pull/10054) is now ready for review. It preserves unexpected-error failures and verifies the exact target root after publication. Its exact head is `4395622a35744509bc026d181f6b0be960da0bdf`. An isolated pinned-dependency build completed TypeScript compilation through the CLI; the local Corepack launcher failed on the trailing metadata command, which was run directly without source changes. Ten focused tests, ordinary CLI type-check and changed-file Biome passed in that isolated checkout.

The full Docker multifork simulation passed locally from 13:27 to 13:33 UTC on 10 September, exit 0. It used the repository-pinned Geth v1.16.7 and Lighthouse unstable-d235f2c images. The missing-parent publication path completed exact-root sync; the focused regressions cover the successful-publication race. This Electra simulation is not a Gloas Builder bid/reveal E2E test. See the [run evidence](../evidence/2026-09-10-multifork.md). Test containers and the simulation network were removed by normal cleanup; existing Kurtosis resources were untouched.

Hosted checks for #9931, #9958 and #9975 include successful build, unit, type, lint and simulation jobs. For the amended #9976 head and #10054, the workflow-runs API reports `action_required` on the Tests and Sim tests runs; only metadata checks completed. A maintainer must approve the relevant runs. Do not use an empty commit or branch refresh to manufacture a new trigger. Their reported local validation is not full hosted CI coverage.

#10054 remains a useful correction to the simulation running today. It neither implements nor claims Gloas/Heze sync support. E2E-01 now explicitly requires the Gloas fixture to distinguish exact beacon-root import from envelope arrival and FULL/data-availability evidence, with a separate expected EMPTY/missing-envelope negative case. This refines the existing E2E task rather than creating a duplicate harness PR. Shared-EL experiments must also account for stale attributes and competing asynchronous FCU calls; earlier SSE emission alone does not serialize the BN and Builder.

Priorities remain validation of existing PRs, the agreed policy-versus-caller validation boundary, authoritative source-BN inputs, and the existing bid/reveal integration work. Keep SPEC-01 separate. ENV-02 outreach remains paused, and another run by Kris does not satisfy its independent-reproduction criterion.

No routine unstable merge, force push, mentor review request, Discord message or Beacon APIs post was made. Only the two approved replies to Nico on #9976 were posted.

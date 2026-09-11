# Builder reconciliation, 11 September 2026

This audit refreshed Kris's PRs in ChainSafe/lodestar and both contributor forks, Marko's recent Builder work, relevant new upstream changes, and the project trackers. It is a change-focused review, not a claim that every unchanged experimental line is correct.

## Merged work and remaining PRs

API-02 [#9931](https://github.com/ChainSafe/lodestar/pull/9931), TEST-01 [#9932](https://github.com/ChainSafe/lodestar/pull/9932), ledger [#9975](https://github.com/ChainSafe/lodestar/pull/9975) and preference subscription [#9976](https://github.com/ChainSafe/lodestar/pull/9976) are merged.

Marko's store [#9970](https://github.com/ChainSafe/lodestar/pull/9970), policy [#9974](https://github.com/ChainSafe/lodestar/pull/9974), identity polling [#10045](https://github.com/ChainSafe/lodestar/pull/10045), environment setup [#10010](https://github.com/ChainSafe/lodestar/pull/10010) and envelope metrics [#10016](https://github.com/ChainSafe/lodestar/pull/10016) are merged. Kris's fork contributions [#9](https://github.com/markolazic01/lodestar/pull/9) and [#10](https://github.com/markolazic01/lodestar/pull/10) are incorporated. Neither needs an incorporation reminder.

| PR                                                            | Current head                               | Disposition                                                   |
| ------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| [#9958](https://github.com/ChainSafe/lodestar/pull/9958)      | `2d2ff420f32f3ef4bdd3b99f2ec6599b74346db9` | Ready; new review points assessed, no source change           |
| [#10054](https://github.com/ChainSafe/lodestar/pull/10054)    | `cbdbf682cda6bbef7a168e0c55cf7e37d615e1e4` | Ready; simplified after Nazar's review                        |
| [#9973](https://github.com/ChainSafe/lodestar/pull/9973)      | `2eaabda8e487497792a028877fe9b5d0ef609e47` | Draft; source dependency still open                           |
| [#9978](https://github.com/ChainSafe/lodestar/pull/9978)      | `a7f5146fe2fa996f6d8d3bbc0b20017ba67bb0a1` | Draft; source dependency still open                           |
| [#9981](https://github.com/ChainSafe/lodestar/pull/9981)      | `1e99557c0ba48553c5c9f23d07840b40626a2cc5` | Draft; source dependency still open                           |
| [#9979](https://github.com/ChainSafe/lodestar/pull/9979)      | `cabd5a04e81527c4c7045e2671903b1dbcae11e4` | Ready after critical re-review; ledger dependency merged      |
| [#9980](https://github.com/ChainSafe/lodestar/pull/9980)      | `d802fcb2c157e2765670e6ad8ae9eee669abb88c` | Ready after critical re-review; ledger dependency merged      |
| [#9982](https://github.com/ChainSafe/lodestar/pull/9982)      | `1073bd413d165eda25c77a8b80dad8964b1b0ad7` | Ready after critical re-review; ledger dependency merged      |
| [Fork #77](https://github.com/krisoshea-eth/lodestar/pull/77) | `b65c7ff325176b6de00c791ffbba5c250f406be2` | Resolved-input integration draft, not running Builder wiring  |
| [Fork #80](https://github.com/krisoshea-eth/lodestar/pull/80) | `30cff332351de94ebf9f8e81b6e96640b1c125d2` | Input proposal draft; coordinate #638 and newer producer work |

Fork #61 is the clean comparison already represented by #9973. Fork #63 remains a broader, unaccepted store proposal. It must not be treated as required hardening of the accepted initial #9970 scope.

The initial pass left draft states unchanged. The subsequent critical re-review below supersedes that disposition for #9979/#9980/#9982. Their three-dot diffs retain historical parent files after the squash merge; those files match the merged ledger. Do not routinely merge unstable or force-push to refresh these branches.

## Subsequent critical review and readiness

Review suggestions were checked against the current implementation, tests and existing patterns. Full comment threads were reread across the open upstream/fork PRs and the recently merged foundation and contribution PRs. No further source correction was justified by this pass.

- Keep #9958's fork-correlated request type. The suggested flat type admits a Heze request with Gloas attributes. Keep its source-ID check while no runtime router guarantees that engine-local payload handles reach their originating Engine. Common Engine/PayloadId definitions remain the separate LOD-92 follow-up.
- Keep #10054's simplified simulation patch. Root-addressed lookup plus `assertOk()` verifies presence through the real BN route. Removing the returned-root comparison is valid; removing the large mock test-utility suite is a repository-scope choice, not a rule against testing helpers. Nine temporary local probes passed against the current helper; the probe file was not added to the PR.
- Mark #9979/#9980/#9982 ready for review. Their own changes compile independently of the unmerged source/assembly PRs. Possible grouping preferences are not an additional readiness gate. Runtime integration remains incomplete.

At the unchanged heads in the table above, #9979 passed 36 focused publisher/signer/ledger tests, #9980 passed 40 selector/ledger tests, and #9982 passed 28 envelope/ledger tests. All three passed ordinary Builder type-check, package Biome, build/import and diff checks. The installed tools were invoked directly after the local Corepack launcher failed. Ledger suites overlap; these are not 104 unique tests.

The three PR descriptions now identify the component review files and exact validation heads. LOD-63/65/67 and their GitHub Project status fields are In Review, with assignees unchanged. #9973/#9978/#9981 remain draft on open #9958. Fork #61 already has its upstream counterpart; #63 remains an unaccepted broader store proposal; #77 and #80 remain integration/input drafts.

No new code commits, branch refreshes, force pushes, mentor replies, Discord messages, Beacon API posts or ENV-02 outreach were made during this critical re-review. Prepared replies remain unposted pending approval. The earlier full simulation result below retains its original time; this later pass did not rerun Docker or establish full Builder lifecycle success.

## Code and review decisions

### Simulation correction

Nazar asked to remove the test-of-test-utility suite and the redundant returned-root comparison. #10054 now changes only the existing simulation helper. The root-addressed `getBlockHeader` lookup must succeed, but a second equality check on the returned root is unnecessary. The current handler resolves the requested root and returns 404 when absent. Unexpected publication errors and failed block lookup remain test failures.

The removed ten-test suite is historical evidence, not a current test result.

### Payload-source typing

The flat `BuildRequest` suggestion was tried in an isolated checkout. It permits a Heze request with Gloas attributes; the existing negative type regression becomes unused and type-check fails. The original fork-correlated form was restored and passes. No speculative simplification was pushed.

The source-ID guard remains while no runtime router guarantees source ownership of engine-local payload IDs. Shared `PayloadId` and Engine interfaces are a separate reuse task, LOD-92, not a reason to import beacon-node into Builder.

### Ledger-dependent conflicts

The runtime ledger implementation and tests matched merged #9975. The divergence was Nico's final class documentation. One-line incremental commits preserve that wording in #9979/#9980/#9982 and resolve their actual conflicts, without merging unstable. PR descriptions now distinguish the merged foundation from the still-visible historical parent diff.

## Extracted follow-ups

Each issue is linked to its originating review rather than reopening the merged component.

| Linear                                          | GitHub mirror                                              | Work                                                                      |
| ----------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| [LOD-87](https://linear.app/kriso/issue/LOD-87) | [#93](https://github.com/krisoshea-eth/lodestar/issues/93) | One Builder-owned multi-topic event stream                                |
| [LOD-88](https://linear.app/kriso/issue/LOD-88) | [#94](https://github.com/krisoshea-eth/lodestar/issues/94) | Decide preference bootstrap through a snapshot or retained database state |
| [LOD-89](https://linear.app/kriso/issue/LOD-89) | [#95](https://github.com/krisoshea-eth/lodestar/issues/95) | Rename the Builder store field to payloadStore                            |
| [LOD-91](https://linear.app/kriso/issue/LOD-91) | [#97](https://github.com/krisoshea-eth/lodestar/issues/97) | Validate envelope metrics on real nodes and add the corresponding panel   |
| [LOD-92](https://linear.app/kriso/issue/LOD-92) | [#98](https://github.com/krisoshea-eth/lodestar/issues/98) | Reuse neutral Engine/PayloadId types                                      |

Marko had already created [LOD-86](https://linear.app/kriso/issue/LOD-86), mirrored as [#92](https://github.com/krisoshea-eth/lodestar/issues/92), outside the Builder project. It is now included and remains the canonical **two-slot**, not two-epoch, retention review. LOD-90/#96 was marked duplicate of it; no duplicate active work remains.

LOD-84 is Done for merged #10016. LOD-91 owns its remaining real-node validation. LOD-85 remains In Review for open [eth2-val-tools #32](https://github.com/protolambda/eth2-val-tools/pull/32). Store capacity, copying and first-write behavior remain outside the agreed initial scope. LOD-64 still owns only the unresolved per-call validation boundary, not the completed arithmetic contribution.

All 92 team issues were matched to 92 GitHub Project items. Both status fields and assignees match after correction. LOD-76/77/78 and these new follow-ups remain unassigned; no contributor ownership agreement was inferred.

## New upstream context

Inspected upstream baseline: `acdde443d29e59fdbb28f1762b7e2ae6e91faec0`.

- Merged [#10055](https://github.com/ChainSafe/lodestar/pull/10055) addresses the previously reported PTC signature omission in #9761. Native-binding and spec-harness qualification remain tracked. The supplied report's unfixed-P0 wording is stale; do not duplicate the old review comment.
- Open [#10056](https://github.com/ChainSafe/lodestar/pull/10056) computes payload attributes once and uses the emitted input for the local EL. Preserve this producer behavior when integrating fork #80. It does not supply all external Builder inputs, deduplication or multi-writer FCU coordination.
- Draft [#10057](https://github.com/ChainSafe/lodestar/pull/10057) adds the proposer/BN supplied-bid flow. It does not implement the standalone Builder's SlotBidder or replace fork #77.
- Merged #10053 supplies SSZ-derived bounds; merged #10058 and #10060 improve diagnostics. Draft #10059 changes peer penalties and is an operational watch. Open #10061 updates lodestar-z and is not by itself evidence that all native follow-ups are complete.
- Nico's fork still has the existing Builder PoC rather than a new extraction series. NC's fork has no open PRs.

No new mentor review comment was sufficiently substantiated to propose from this change-focused pass. Existing discussions should not be duplicated. Large experimental branches were reviewed for Builder impact, not exhaustively line by line.

## Validation in this run

| Surface  | Fresh result                                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #10054   | Full local Docker multifork simulation passed, 16:55:53 to 17:02:06 UTC on 11 September; ordinary CLI type-check, changed-file lint and diff checks passed |
| #9958    | 13 focused tests and Builder type-check passed; flattening experiment reproduced loss of the fork correlation                                              |
| #9979    | 29 publisher/ledger tests and Builder type-check passed                                                                                                    |
| #9980    | 40 selector/ledger tests and Builder type-check passed                                                                                                     |
| #9982    | 28 envelope/ledger tests and Builder type-check passed                                                                                                     |
| Fork #77 | 43 SlotBidder tests, four composed pipeline tests and Builder type-check passed                                                                            |
| Fork #80 | Six payload-attributes producer tests passed                                                                                                               |
| SPEC-01  | Both unchanged patches still apply to the pinned master; example encodings, shapes, legacy preservation and bundle round-trips passed                      |

A second fork #77 run passed all 47 SlotBidder/pipeline tests with the test alias pointing to a store source verified byte-for-byte against the merged upstream implementation at the inspected baseline. This is component compatibility evidence, not live Builder wiring.

Ledger suites overlap across PRs; these are test executions, not a unique-test total. Earlier package builds and candidate lint results retain their original dates. This run does not claim new hosted CI success or full package validation for every unchanged draft.

The simulation used Geth v1.16.7 and Lighthouse unstable-d235f2c. Its containers and simulation network were cleaned up; existing Kurtosis resources were left alone. It is an Electra multifork block-sync run, **not the complete Gloas Builder bid/selection/reveal lifecycle**. No fresh devnet health is established.

## SPEC-01 and next decisions

Beacon APIs master remains `ef98d512c03c8ca6b9d7cbdc45b9293ec2b24722`; #638 remains open at `ad322f49e9141e62fca63cedb14706498d9290fc`. #599 has no new public decision. The two candidate patches remain valid discussion artifacts, not consensus. Merged API-02 strengthens the fallback implementation evidence without deciding the event shape.

Nico's later neutral position and NC's lightweight-event preference remain recorded. Keep required self-build fields for an extended block event, successful-import/non-head semantics, and the absence of a demonstrated need for bid_root or a full signed bid. Candidate publication remains separate from payload-attributes #638.

Next work is source review, a clear bid/reveal review presentation, agreement on LOD-76/77/78 input and ownership boundaries, then actual Builder wiring and a complete local Gloas lifecycle run. Fresh Discord decisions, private branch work and runtime evidence may change that order. ENV-02 outreach remains paused.

No CodeRabbit, new PRs, routine unstable merges, force pushes, review comments, Discord messages or Beacon API posts were made in this run.

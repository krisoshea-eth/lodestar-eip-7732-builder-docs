# Builder review reconciliation, 13 September 2026

This checkpoint supersedes the earlier PR-status snapshots in the 12 September audit. Evidence was refreshed across Kris's and Marko's Lodestar PR inventories, including open/draft PRs and PRs merged since 21 August. The new upstream comparison is pinned to `82e7577c8bebe2c6cca1ec633d690f9bbdcab087`. This is a comment-driven and changed-code review, not another exhaustive review of every unchanged experimental branch.

## New review decisions and changes

- **#10063 merged** after Nico's approval. LOD-89 is Done; its GitHub issue #95 is closed and both project status fields are Done.
- **#9958**, now `ef86e663fc7b3ab7ef058013b600b53f1732bd6c`: clarified that custody columns describe the CL data-column custody set used for EL blobpool sampling. The Engine API explicitly permits null when the CL provides no custody services. No runtime/type change was warranted by Nico's wording question. Source-ID routing and fork correlation remain intact.
- **#9979**, now `3a7c3728dc679aca36039dc3d17484aa04099091`: replaced ambiguous terminology in the title, description and test name. The explicit policy remains at most one submission attempt per slot, parent execution hash and parent beacon root. A failed or ambiguous attempt retains its record. This is an implementation policy, not a protocol-wide ban on subsequent bids.
- **#10065**, unchanged `b9b9e26e8e373bca9d67be14be580126a93da7fe`: Nico approved and asked whether the race can occur when exiting just after startup. Yes: aborting during the asynchronous EventSource load used to miss listener registration and leave a later-created stream open. The code and seven focused regressions remain appropriate. A reply is prepared, not posted.
- **#10064**, now `bd358d3c31cca547f8b3a9f092aff9ef229e5a27`: the naming merge conflicted with its reorganised lifecycle fixtures. A naming-only incremental commit still conflicted under git merge-tree. The exact #10063 merge commit was therefore necessarily merged, resolving only the overlapping test fixtures while retaining the shared stream. This was not a routine branch refresh. No other upstream PR received a merge or force push.

## Validation in this pass

| Target                     | Fresh validation                                                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| #9958                      | 13 focused source tests, ordinary Builder type-check, changed-file Biome and diff checks                                                        |
| #9979                      | 36 publisher/signer/ledger tests, ordinary Builder type-check, changed-file Biome and diff checks                                               |
| #10064                     | 47 Builder/observer/preference/store tests after the final conflict resolution, ordinary Builder type-check, lint, build/import and diff checks |
| Fork #77                   | 77 tests across eight targeted files, including all 47 SlotBidder/pipeline tests, ordinary Builder type-check, lint and build/import            |
| Fork input-consumer branch | 79 tests across six consumer/SlotBidder/pipeline/lifecycle files, ordinary Builder type-check, lint and diff checks                             |
| #10065                     | Seven client/loopback-server cancellation and containment tests                                                                                 |

Counts overlap inherited suites and must not be added as unique coverage. No complete Gloas BN/EL lifecycle was run. New PR commits invalidate earlier hosted-check claims until their workflows run again.

The new audit, SPEC-01 working document and 12 September audit pass targeted Markdown formatting checks. The three long planning documents still fail Prettier on their legacy formatting, as they also do at the unchanged parent commit. Their tables were not reformatted wholesale; all edited files pass whitespace checks. This is not a claim that the entire docs repository passes formatting.

## Fork disposition

Fork #77 is now `f7d348d3bea22a4dd3521789cb372f6d13e5636a`; the existing fork-only input-consumer branch is `5018d2f933`. Both selectively carry the accepted naming and wording changes. The former remains resolved-input composition, while the latter adds a head-only Gloas consumer but not running Builder subscription/construction or reveal wiring.

No new upstream PR is warranted by those dependency corrections. #77 and #80 remain draft; #80 still depends on the proposed payload-attributes contract. #61 already has upstream #9973. #63's broader store guarantees remain unaccepted. Marko fork #9/#10 are merged and need no further incorporation reminder.

## Upstream compatibility

- **#10071** aligns validator-side Gloas remote-signing request wrappers and PTC naming with remote-signing-api #28 / Web3Signer #1192. Its new real-Web3Signer cases are skipped until the test image supports Gloas. It does not implement remote signing for the standalone Builder's local key. Tracked as a watch in LOD-39.
- **#10073** extracts produceGloasBlock, and **#10072** stacks the proposed VC-supplied-bid endpoint on it. Older overlapping #10057 is still open. These are proposer/BN changes, not our payload source or Builder input/reveal runtime. Tracked in BN-01.
- Four local probes against #10072 at `f5d3c089710133e4b3a5893192d1c575e9fc954c` reproduce its already-reported Heze codec issue: JSON drops inclusion-list bits, and Heze SSZ input fails the fixed Gloas layout. The probes use the exact route source with the installed workspace dependencies, not a clean full-package or end-to-end qualification. **No duplicate review comment is proposed.** LOD-31 records the compatibility watch.
- #10070's PTC gossip-arrival semantics and the recent transport/native changes remain the existing QA watches. No new correctness claim is made about their complete implementations.

## Review follow-ups

The merged-review checks confirmed existing homes for shared events (LOD-87), preference bootstrap (LOD-88), naming (LOD-89, now Done), retention (LOD-86), real-node metrics/dashboard work (LOD-91), shared Engine types (LOD-92), and remaining policy validation (LOD-64). Already-fixed validation, store, arithmetic and test changes were not recreated as new issues. Marko's older voluntary-exit draft comments were checked against the merged implementation; its validator-count precheck and duplicate-suppression findings no longer describe current code.

The current project inventory remains 92 tracked issues, including completed and duplicate history. All 92 issue titles, native/custom project statuses and assignees were compared with Linear and matched after correcting #95's stale custom status. Assignments were preserved. New upstream watches extend existing issues rather than creating duplicate work.

## SPEC-01

Beacon APIs master remains `ef98d512c03c8ca6b9d7cbdc45b9293ec2b24722`. Public #599 has no newer selection decision, and #638's head is unchanged. #627/#10072 concerns supplying a bid before production, not observing its inclusion after import. The working document records this distinction. Neither normative event patch changed, and nothing was published to Beacon APIs or Discord.

## Next

1. Approve the three prepared replies on #9958, #9979 and #10065.
2. Review the updated docs PR #31.
3. Continue the seven ready PRs through maintainer review and exact-head hosted checks: #9958, #9979, #9980, #9982, #10054, #10064 and #10065.
4. Keep #9973/#9978/#9981 draft while their PayloadSource parent remains open.
5. Continue LOD-76's input contract and LOD-77/78 running Builder/reveal integration, followed by a complete Gloas lifecycle test.

No CodeRabbit, mentor reply, Discord/Beacon API publication or ENV-02 outreach occurred. ENV-02 outreach remains paused.

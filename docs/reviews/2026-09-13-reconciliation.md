# Builder review reconciliation, 13 September 2026

This checkpoint supersedes the earlier PR-status snapshots in the 12 September audit. Evidence was refreshed across Kris's and Marko's Lodestar PR inventories, including open/draft PRs and PRs merged since 21 August. The new upstream comparison is pinned to `82e7577c8bebe2c6cca1ec633d690f9bbdcab087`. This is a comment-driven and changed-code review, not another exhaustive review of every unchanged experimental branch.

## Checkpoint investigation and reveal follow-up

The #9979 hosted E2E log shows Node A finalizing epochs 2, 4, 5 and 6 but never epoch 3. The exact-epoch waiter therefore never resolved and Node B was never started. A longer timeout would not fix that observed sequence; changing the predicate to accept a later checkpoint would lose the intended skipped-slot checkpoint assertion. Why the run did not finalize epoch 3 remains unestablished.

At exact PR head `91038c140a9b6257194d621da0d4e162d7e61d10`, the isolated unchanged test passed locally in 94.25 seconds, including Node B sync. Dependencies were installed from that head's lockfile and dependency packages rebuilt. The first attempt failed before collecting tests because the native loader could not resolve its optional package; the diagnostic rerun supplied the exact installed 1.1.0 dependency directory through NODE_PATH. It ran on macOS/Node 22.22.3, not hosted Linux/Node 24. This is useful local evidence, not a fresh hosted pass or proof of flakiness. The failed-job rerun was attempted once; GitHub returned HTTP 403 requiring repository administration. A maintainer must rerun it. No #9979 source or timeout change was made.

The existing fork-only runtime branch advanced to `523638b2f8d8b06d7168b204ecd15cf00a04c418`. It connects the existing observer, exact selector, retained-material assembler and envelope publisher through Builder startup. Optional reveal configuration supplies the decision and cutoff; the runtime bounds pending decisions/publication and suppresses late results. Selection records still exist when reveal is disabled or declined. All 198 targeted tests across nine files, Builder type-check, changed-file lint, build/import and diff checks passed. No new PR, routine branch refresh or real BN/EL lifecycle result is claimed. The [input contract](../builder-input-contract.md) records unfinished transport, recovery and reveal-policy work.

SPEC-01 master and #599 were rechecked and contain no new public decision. Both unchanged alternative patches pass fresh lint and bundling. Share the packet with Lodestar now; do not wait for every client to agree before opening an approved discussion draft. No Discord or Beacon APIs post was made.

## Earlier refresh and startup experiment

This section records the earlier startup checkpoint. The follow-up above controls later runtime and CI findings.

- API setup cancellation #10065 merged on 13 September at 10:00 UTC, merge commit `bb3ffba9e9441e50c533f8309708c1106a6effca`. Its reply is already posted. Broader REL-01 recovery is not complete.
- Kris has nine open upstream PRs and four open fork PRs. The six ready upstream PRs are #9958, #9979, #9980, #9982, #10054 and #10064. #9973/#9978/#9981 remain source-dependent drafts. Fork #61 already has its upstream counterpart; #63 remains the broader store proposal; #77/#80 remain integration/input drafts. Marko fork #9/#10 are merged.
- All current open PR discussion inventories were refreshed. No new unanswered reviewer comment was found after the previous replies. Existing unresolved threads await reviewers; no duplicate replies or thread resolutions were posted. Kris's subsequent edits to the custody and publication replies were preserved.
- #9980's hosted checks pass. #9979's E2E job failed in the Gloas skipped-slot checkpoint-sync test after 150 seconds, while its other substantive checks pass. The failing test starts beacon nodes and validators, not a standalone Builder. Its cause is not established, and it was not labelled flaky or bypassed. #9982 retains the old multifork simulation failure addressed by #10054. #10054's Tests/Sim checks pass, but Docs failed during dependency download and Nazar's re-review remains outstanding. #9958/#10064's latest-head summaries contain only title checks; earlier package checks do not count as fresh hosted results.
- The fork-only input branch advanced from `b8a9b57dd769b6188137892642466749fb4f3774` to `794158a33d4a3351d234cc1a71f8232fbab09493`. `Builder.init()` now constructs the bid services only when explicit `bidRuntime` options supply an injected PayloadSource, policy and input/timing settings. The accepted store, existing ledger, signer, publisher and shared event dispatcher are reused. Ledger pruning runs with slot cleanup. Publication checks slot, both parent identities, execution hash and fork against retained material.
- All 188 targeted tests across nine files passed, including 34 Builder lifecycle tests and seven API cancellation/loopback tests. Ordinary Builder/API type-checks, changed-file lint, builds/import checks and whitespace checks passed. The API test first hit the sandbox's localhost permission restriction, then passed in the permitted rerun. Payload construction and BN transport are mocked. No real BN/EL lifecycle or new hosted CI success is claimed.
- Only the startup commit and the accepted #10065 cancellation commit were added to the existing fork branch. No upstream PR was opened or refreshed and no draft state changed. CLI/Engine transport construction, final input contract, bootstrap/recovery, Heze bid-bit sourcing and selection/reveal wiring remain unfinished.

## New upstream and specification impact

[PR 10075](https://github.com/ChainSafe/lodestar/pull/10075) at `e551ff1ea337b43d5ad9669563246f889db47e43` refreshes cached head when queued attestations are processed. It matters to BN input freshness during empty slots, not a new Builder service. Its dropped per-slot counter reset is already reported in [the existing review](https://github.com/ChainSafe/lodestar/pull/10075#discussion_r3999618973). No duplicate comment is warranted.

[PR 10074](https://github.com/ChainSafe/lodestar/pull/10074) at `05a8d1f7e4bf7de382452768f5b746180e352536` makes two data-availability benchmarks report-only. This changes how performance evidence is interpreted, not production Builder behavior. A green run would not prove the previous thresholds were met. Existing BN-01 and QA-01 issues track both watches; no new component issue is needed. The other recently reviewed Builder-related heads remain compatibility watches. This was a changed-code review, not an exhaustive new audit of every open experimental PR.

Beacon APIs master and the payload-hash proposal remain unchanged. Both SPEC-01 alternatives passed fresh Redocly 1.19.0 lint, swagger-cli 4.0.4 bundling and whitespace checks. The current consensus-spec head `02abf5c173f550acdbe67225a6b682addea110e4` only adds generated-test caching since the prior research pin; it does not change event or reveal rules. The document now separates proposal readiness from cross-client agreement. It removes the overly strict requirement for every active client to respond before the proposal leaves draft. The packet is ready to share with Lodestar, then use an approved upstream draft to obtain cross-client feedback. No publication or implementation support is claimed.

Linear LOD-15/22/23/48/76/77 and their existing GitHub mirrors were reconciled. Repeated audit paragraphs and incorrectly routed Beacon APIs links were corrected. Both Project status fields were checked on those six mirrors. This was a targeted update, not a fresh audit of all 92 historical issues. Existing ownership and ENV-02 outreach restrictions are unchanged.

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

## Approved follow-through later on 13 September

This section supersedes the earlier current-head and unposted-reply statements above. The earlier checks remain historical evidence at their recorded heads.

- The three approved replies are posted on [#9958](https://github.com/ChainSafe/lodestar/pull/9958#discussion_r3997990814), [#9979](https://github.com/ChainSafe/lodestar/pull/9979#issuecomment-5649398558) and [#10065](https://github.com/ChainSafe/lodestar/pull/10065#issuecomment-5649398825).
- Copilot's new #9979 pruning finding reproduced after the three-epoch history window for pending, rejected and accepted publication. Keeping every reservation forever would unbound memory. The fix instead advances a monotonic oldest-slot cutoff and rejects expired slots before signing. The reply is [posted](https://github.com/ChainSafe/lodestar/pull/9979#discussion_r3997997949). This exposed an add/add conflict with the squash-merged ledger parent; a necessary merge of the exact `82e7577c8bebe2c6cca1ec633d690f9bbdcab087` base resolved the two ledger files. At final head `91038c140a9b6257194d621da0d4e162d7e61d10`, all 40 publisher/signer/ledger tests, ordinary type-check, changed-file Biome, build/import and diff checks passed. The PR is mergeable and its description now reflects the clean six-file review diff.
- Copilot's #10064 logging suggestion was checked against both previous subscribers. Both used error level, so the refactor now preserves it. This does not treat every reconnectable error as terminal. At `6c3318d9fa0ca8dbed3e55a9bc7a556d61ac4aa6`, all 47 targeted tests and package checks passed; the [reply](https://github.com/ChainSafe/lodestar/pull/10064#issuecomment-5649418120) is posted.
- Fork #77 carries the ledger correction at `7ed07c5403c68eb43f159d461aa5bcc8253fb764`. All 80 targeted tests, including 47 SlotBidder/pipeline tests, plus type-check, lint, build/import and diff checks passed. It remains a fork-only resolved-input draft.
- The existing fork-only input-consumer branch is pushed at `b8a9b57dd769b6188137892642466749fb4f3774`. An injected consumer now receives head/payload/preference events through the real Builder dispatcher. Tests cover all six arrival orders, duplicate suppression, missing preferences, slot cancellation and shutdown. The real consumer, SlotBidder, store, ledger, signer and publisher compose in a Builder test; payload construction and BN transport are mocked. All 134 targeted tests, ordinary type-check, changed-file Biome, build/import and diff checks passed. Automatic initialization, CLI/Engine configuration, Heze bid-bit derivation and reveal runtime remain incomplete. No new PR or ownership assignment was made.
- #10065 is approved with successful hosted test/simulation/docs checks, with the benchmark skipped. #9982's failed multifork job hits the old `unknownBlockParent` assertion at slot 38, the simulation path addressed by #10054. This is not evidence of an envelope-publication regression. #10054's Docs failure is a Node-header download `ECONNRESET`; the account cannot approve or rerun ChainSafe workflows requiring repository administration. Fresh full hosted checks on the newly pushed heads are not claimed.

## Next

1. Continue review of the two tested feedback corrections on #9979 and #10064. Their replies are posted.
2. Review the updated docs PR #31; it is not merged by this run.
3. Continue the six ready PRs through maintainer review and exact-head hosted checks: #9958, #9979, #9980, #9982, #10054 and #10064. #10065 is merged.
4. Keep #9973/#9978/#9981 draft while their PayloadSource parent remains open.
5. Continue LOD-76's input contract, CLI/Engine transport configuration and recovery. LOD-78 has opt-in bounded wiring but still needs reviewed head/timeliness policy, retries, payment settlement and eviction conditions. Then test the complete Gloas lifecycle.

No CodeRabbit, force push, Discord/Beacon API publication or ENV-02 outreach occurred. The approved mentor replies and two bot replies are posted. Necessary conflict merges are recorded above; there were no routine refreshes of the other PR branches. ENV-02 outreach remains paused.

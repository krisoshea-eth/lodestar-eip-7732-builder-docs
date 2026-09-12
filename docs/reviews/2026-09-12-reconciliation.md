# Builder reconciliation, 12 September 2026

The [13 September checkpoint](2026-09-13-reconciliation.md) supersedes this page's PR-status snapshots. #10063 has merged, and the latest source, publication, shared-stream and fork corrections are recorded there. The sections below retain their original evidence dates.

## Input experiment and deeper specification review

Experiment head: [`8ea1d27c1ea09898893147dbfd250a5c4f14c973`](https://github.com/krisoshea-eth/lodestar/commit/8ea1d27c1ea09898893147dbfd250a5c4f14c973). This branch is in Kris's fork only, without a new PR.

The later fork-only `krisoshea/input-consumer` branch begins LOD-76 from fork #77 at `d6bee9001b463d9c910c80f8298a30b9a131a149`. It adds a typed event consumer and incorporates the minimal finality-hash producer/type changes and producer tests from fork #80. Existing code PR heads, including fork #77 and #80, are unchanged by this experiment. There is no new upstream PR.

- The consumer correlates the exact beacon parent with `head_v2` and uses the advertised current/next epoch root for preference lookup. It does not query latest duties and assume branch equivalence.
- Builder execution proceeds and the proposer's bid-payment address remain distinct. The prior input note's requirement to preserve the producer's execution fee recipient was too restrictive and is corrected against the API description and Nico's PoC.
- Pending data and distinct attempts are bounded. Head/slot changes, shutdown and replacement cancel work. A new regression reproduced a duplicate caller receiving a late result after cancellation; sharing the guarded result promise fixes it.
- The real-clock tests cover the BN's 6667-basis-point preparation schedule. A 5000 cutoff is too early for that schedule; 9000 is tested as explicit experimental configuration, not a production default.
- 135 tests passed across eight focused Builder/producer files, including 30 new consumer tests and the actual SlotBidder/store/ledger/signer/publisher composition with mocked Engine and publication transport. Three API event-server tests passed separately outside the sandbox because localhost binding is restricted inside it. Total 138 focused test executions across nine files.
- Ordinary Builder, beacon-node, API and types checks passed. The 15-package dependency/build subset, changed-file Biome and Builder import check passed. The first broad dependency build lacked the newly selected package links; a frozen-lockfile subset install repaired the local environment without a lockfile/source workaround. No complete Gloas BN/EL test or hosted success is claimed.
- This is head-only Gloas input work, not completed LOD-76. Dispatcher subscription, startup/reconnect recovery, Heze bid-bit sourcing and LOD-77/78 runtime/reveal construction remain open. An abort cannot retract an FCU already delivered to the EL.

SPEC-01 was checked against actual Beacon APIs contribution/CI instructions and the changes and reviews in PRs 587, 590 and 621, including Lighthouse/Teku/Nico/NC feedback. The packet now distinguishes its supporting design note from the narrow normative YAML/examples/support-row submission. No EIP-style long-form template or universal event-versioning rule is imposed. Both unchanged candidate patches passed fresh lint and bundling again.

Beacon APIs master remains `ef98d512c03c8ca6b9d7cbdc45b9293ec2b24722`; consensus-specs was read at `c37e369dcaed827bd378b7bab623b6beedc0bed5`. Nico's new draft #10070 at `b6fda77e14e1dcc64db9dc14f8be265302be5c2f` preserves gossip arrival for repeated-proposal PTC timeliness. Track that in QA-01 and do not equate imported-block SSE receipt with first gossip arrival. This was a scoped impact review, not a new validated bug or full review of that draft.

No candidate publication, mentor comment, ENV-02 outreach, routine upstream merge or force push occurred. The eight ready PRs remain ready; no additional implementation draft is promoted by this work. GitHub's queued/incomplete hosted checks and the previously observed Docs-rerun permission limit remain separate from local validation.

## Later implementation follow-through

The earlier snapshot below is retained for audit history. Subsequent work updated two existing code branches and the SPEC-01 notes, without a routine upstream merge or force push.

- #10064 is now at `1c7d55b2aea0a7b1b589201d04d0457d7add3617`. Subscription-failure logs include `BUILDER_EVENT_SUBSCRIPTION_FAILED` while retaining the original error. The new assertion failed before the metadata change; 42 focused tests and ordinary Builder type-check, changed-file Biome, dependency builds and build/import checks pass. The bot received an in-thread reply. This is a diagnostic improvement, not a fix for stream recovery.
- Fork #77 is now at `d6bee9001b463d9c910c80f8298a30b9a131a149`. Its checked-in store follows the accepted simple store behavior, with an intentional type-only import from #9958's fork-correlated `BuiltPayload`. Merged Builder startup, observer, preference, polling and Gate A files were selectively reconciled. There is no restored capacity, defensive-copy or first-write guarantee, and fork #63 is unchanged.
- Fork #77 passed 167 tests across 12 focused files, including all 47 SlotBidder/pipeline tests against that checked-in store. Ordinary Builder type-check, changed-file Biome, dependency builds and build/import checks passed. This replaces the earlier need for a test-only store substitution; it does not supply input-consumer or runtime wiring.
- A repeated static merge-tree check still reports add/add conflicts in the intentionally adapted store, payload fixture and expanded policy/store tests. The ledger conflict is gone. This is not a clean upstream runtime diff yet.
- The approved #10054 Docs rerun was attempted. GitHub rejected it with HTTP 403, requiring repository admin rights. No workflow or simulation code was changed to bypass that permission.
- SPEC-01 now documents non-head reveal policy, omitted optimistic status, unsupported-topic fallback and rollout tests. Lighthouse/Teku serializer paths were rechecked. Both wire patches are unchanged; no cross-client decision or fresh runtime interoperability is claimed.
- The [input-contract checkpoint](../builder-input-contract.md) records concrete missing BN inputs and the additional Heze transaction/bid-bit distinction. LOD-76/77/78 remain incomplete; no new ownership agreement is inferred.

The eight ready upstream PRs remain ready. No dependent draft was promoted. No mentor comment, Discord/Beacon APIs publication or ENV-02 outreach was made in this follow-through. These component checks do not establish a complete Gloas BN/EL lifecycle.

## Earlier inventory snapshot

This refresh screened the 42 Lodestar PRs updated since 10 September and read full review/conversation threads on 43 selected upstream, contributor-fork and docs PRs. That includes all 11 of Kris's open upstream PRs, four open fork PRs, both merged contributions on Marko's fork, the four merged Builder foundations and Marko's relevant recent implementation/comparison PRs. New source changes received a Builder-focused compatibility review, not an exhaustive audit of unrelated code or every unchanged experimental branch.

Upstream was checked at `a0619b279aa57140768859767be392ff5a20f656`. No existing Lodestar branch was refreshed, rebased or force-pushed. No mentor review comment, Discord message or Beacon APIs proposal was posted. ENV-02 outreach remains paused.

## Current PR disposition

The merged foundations remain API-02 #9931, TEST-01 #9932, ledger #9975 and preferences #9976. Marko's store #9970 and policy #9974 contain Kris's merged contributions #9/#10. ENV-03 #10010, polling #10045 and processing metrics #10016 are also merged. These accepted scopes are Done; their follow-ups do not reopen them.

| PR                            | Head           | Current disposition                                                 |
| ----------------------------- | -------------- | ------------------------------------------------------------------- |
| #9958 PayloadSource           | `2d2ff420f32f` | Ready, full hosted checks passed                                    |
| #9973 orchestration           | `2eaabda8e487` | Draft, depends on open #9958                                        |
| #9978 bid assembly            | `a7f5146fe2fa` | Draft, depends on open #9958                                        |
| #9979 bid publication         | `cabd5a04e815` | Ready, full hosted tests not yet recorded                           |
| #9980 exact selection         | `d802fcb2c157` | Ready, full hosted tests not yet recorded                           |
| #9981 envelope assembly       | `1e99557c0ba4` | Draft, depends on open #9958                                        |
| #9982 envelope publication    | `a2fff56b20b2` | Ready, full hosted tests not yet recorded                           |
| #10054 sync simulation        | `cbdbf682cda6` | Ready, hosted Tests/Sim passed; Docs dependency installation failed |
| #10063 payloadStore naming    | `8d80e57d496f` | Ready, full hosted tests not yet recorded                           |
| #10064 shared Builder events  | `92a7c82527d7` | Ready, full hosted tests not yet recorded                           |
| #10065 API setup cancellation | `b9b9e26e8e37` | Ready, full hosted tests not yet recorded                           |

All 11 open upstream PRs allow maintainer edits and are currently mergeable. The eight ready PRs were already out of draft; this refresh promoted none. Ready means prepared for review, not approved for merge. PR #10054 still needs Nazar's re-review; its Docs failure is not fixed by the successful simulation.

Fork #61 is the clean comparison already represented by #9973. Fork #63 remains an unaccepted broader store proposal, not another upstream store implementation. Both contributions on Marko's fork are merged and need no incorporation reminder.

### Fork integration findings

Fork #77 remains at `8a3c51781fbad7ae2f7953066e1502e12ef9c228`, targeting the older combined branch. A local `git merge-tree` check against current upstream finds add/add conflicts in the ledger, store and policy/store tests. Its GitHub mergeability applies to its fork base, not upstream. It still contains the broader store implementation even though earlier pipeline tests passed with the accepted store substituted.

Before promotion, selectively reconcile the accepted simple store, ledger identity documentation and policy tests. Preserve merged observer/preference wiring and Gate A tests. Do not replace upstream with the fork tree or infer that source-level compatibility supplies the LOD-76/77/78 runtime consumers.

Fork #80 remains at `30cff332351de94ebf9f8e81b6e96640b1c125d2`. Its synthetic merge with current upstream is conflict-free and retains PR #10037's event-before-EL ordering. This does not accept the #638 schema or test the composed runtime. Preserve open #10056's producer reuse when integrating it later.

## Review comments and canonical follow-ups

All 92 tracked issue titles, native/custom statuses and assignees match between Linear and GitHub Projects. This includes completed and duplicate history, not 92 unfinished tasks. Existing assignments were preserved. No duplicate issue was needed.

| Review point                                              | Disposition                                                                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #9976 shared stream                                       | LOD-87, implemented in ready #10064                                                                                                                    |
| #9976 preferences already cached before startup/reconnect | LOD-88; compare snapshot retrieval and persistence before adding an endpoint                                                                           |
| #9976 payloadStore name                                   | LOD-89, ready #10063                                                                                                                                   |
| #9970 two-slot retention versus useful reveal deadline    | Existing LOD-86; the current default remains accepted                                                                                                  |
| #10016 running-node observations and dashboard            | LOD-91; Marko's local 0.05-second bucket observation is recorded, but representative measurements/panel remain                                         |
| #9958 shared Engine/PayloadId types                       | LOD-92; preserve fork correlation and avoid importing beacon-node into Builder                                                                         |
| #9974 numeric policy inputs                               | Constructor/precision changes are merged; only the per-call boundary remains in LOD-64                                                                 |
| #9931 lighter selection notifications                     | SPEC-01; the TODO and standard block-fetch fallback already landed                                                                                     |
| #10010 setup feedback                                     | Image rebuilding, Dockerfile.dev and YAML trimming landed. Automatic partial-key repair was not accepted; optional diagnostics must not overwrite keys |
| #10045 missed boundary/head progress                      | Retained as a QA scenario to measure before proposing more polling; not an accepted mandatory correction                                               |
| #9914 validation/pool/metric feedback                     | Cheap slot checks and validation timing exist; #9998 removed local API-bid pool insertion. Do not recreate these changes                               |

The existing replies on #9958/#10054/#9982 are present and still match their changes. Unresolved GitHub thread flags do not necessarily represent unfinished code. No new human feedback on these unchanged heads requires an immediate source edit.

The bot's remaining #10064 request for a stable subscription-failure log code is diagnostic follow-up, not a reproduced P1 functional failure. The current stream setup failure already logs an error; adding a stable code would aid filtering, not restore a dead stream. No code change or reply is recorded for that suggestion yet.

The GitHub Project summary and stale issue links/status wording were corrected. LOD-87 is In Review, not unassigned Backlog. API-02 is merged, not awaiting review.

## New upstream compatibility

- Merged #10062 switches ReqResp/spec-fixture decoding to snappy-wasm 0.5.2 and updates native snappy to 7.4.3. This concerns bounded decoding, malformed frames and fixture loading, not a new Builder API.
- Open #10068 tightens decoder-error assertions, preventing a checksum error from accidentally satisfying the malformed-decoder test.
- Draft #10069 requests Node-owned native compression/decompression output. Its allocation/performance claims are workload-specific; this audit does not establish a whole-client memory improvement.
- Merged #10061 and #10066 update lodestar-z to 1.1.0 and libp2p-quic to 2.1.4. Record exact dependencies for later native/PTC/network qualification; version changes alone do not establish correct deployment.
- Draft release #10067 is not evidence that a complete Gloas Builder will ship or that the current runtime works.
- #10056 remains the payload-attributes producer overlap for fork #80. #10057 is proposer/BN Builder API work, not a replacement for standalone Builder source or runtime services.

Nico's fork still has the existing Builder PoC #4 at `99fd8fa9ad3a867fced3a5907a68edf3a519c1cd`; NC's fork has no open PRs. No new finding from this refresh warrants a mentor comment. The older event PoCs remain comparison drafts and were not bumped.

## Validation in this refresh

- Exact #10068 head `de19061975bcf86808550270121ae6e2be545a4f`: 83 ReqResp decoding/frame tests passed.
- Exact #10069 head `6f3f306632695bbe7d7459ab9c33fd14564d67d2`: 85 ReqResp decoding/frame tests passed. These suites overlap and are not 168 independent scenarios.
- Dependencies were installed from the frozen lockfile in an isolated clone. Eight relevant dependency/package builds passed using Node 24.19.0; the ordinary ReqResp type-check also passed at #10069. The initial system Corepack launcher failed before tests; the bundled supported Node runtime avoided that launcher without changing global tools.
- Both SPEC-01 patches still pass `git apply --check` against unchanged Beacon APIs master `ef98d512c03c8ca6b9d7cbdc45b9293ec2b24722`.
- Fork merge-tree checks described above are static integration evidence, not executed combined builds.

No fresh complete Builder suite, Gloas BN/EL lifecycle, native allocation benchmark or public devnet recovery is claimed. Earlier exact-head Builder test evidence retains its original date. CodeRabbit was not used.

## Specification and next work

Docs #30 is merged. Beacon APIs #599 has no new public event decision; #638 remains open at `ad322f49e9141e62fca63cedb14706498d9290fc`. Keep extended block and lightweight bid_included as alternatives for cross-client feedback, with block_v2 as a possible comparison. The two patches remain unchanged and unpublished.

Next, finish the ready PR reviews/hosted checks, reconcile #77's inherited files when preparing the runtime slice, and implement the LOD-76 input contract followed by LOD-77/78 bid/reveal wiring. The exact dependent-root, coherent safe/finalized hashes and custody topology remain explicit inputs, not values to guess. SPEC-01 publication and independent ENV-02 reproduction remain separate.

# Builder reconciliation, 12 September 2026

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

# Builder input contract for the first runtime experiment

Research checkpoint, 12 September 2026. This is a proposal for [LOD-76](https://linear.app/kriso/issue/LOD-76), not an accepted Beacon API contract or completed runtime implementation. It is separate from [SPEC-01](beacon-api-block-event-extension.md), which concerns selection notifications.

The source references below were inspected at Lodestar [`a0619b279aa57140768859767be392ff5a20f656`](https://github.com/ChainSafe/lodestar/tree/a0619b279aa57140768859767be392ff5a20f656). Fork #77 now contains the accepted store behavior and merged Builder foundations, but still consumes a fully resolved `SlotBidInput`. Another wrapper around that input would not implement the event consumer.

## Input sources and remaining decisions

| Input                                        | Available source                                      | Consumer rule or unresolved work                                                                                                                                                                            |
| -------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fork and proposal slot                       | Versioned `payload_attributes` event                  | Validate the version against the configured fork at `proposalSlot`; reject unsupported or mismatched input before Engine calls.                                                                             |
| Beacon parent root and execution parent hash | The same event                                        | Preserve both independently. FULL and EMPTY histories can select different execution parents; do not derive one identity from the other.                                                                    |
| Payload attributes                           | The same event                                        | Preserve the producer's attributes, including fork-specific fields. Do not replace its fee recipient with the Builder bid's proposer payment address.                                                       |
| Safe and finalized execution hashes          | Proposed Beacon APIs #638 / fork #80 fields           | Absent from the current external event. For the experiment, pin that proposal explicitly. Do not fill missing hashes with zero or independently sampled latest values.                                      |
| Proposer preference dependent root           | BN duties/state shuffling logic                       | Duties V2 is not parameterized by the event parent. A latest-head response alone does not prove that a preference belongs to the event's branch. Resolve against that branch before selecting a preference. |
| Custody columns                              | `api.lodestar.getCustodyInfo()` for the source BN     | Reusable for an explicitly configured shared-EL PoC only. A dedicated Builder EL needs its own selected configuration. Missing input is not permission to substitute `null`.                                |
| Heze inclusion-list bid bits                 | Not supplied directly by the payload-attributes event | `inclusionListTransactions` and bid `inclusionListBits` are distinct inputs. Document and test their derivation; do not fill the bits with an empty default merely to complete the type.                    |

The existing state-transition `proposerShufflingDecisionRoot` computes the root from a state and proposal epoch, including post-Fulu lookahead. The fork-choice helper follows known ancestry. Reuse those semantics rather than substituting `parentBlockRoot` or the last preference received. Fetching a branch-anchored state would preserve that meaning but introduces a substantial data/latency cost; bounded header ancestry is another approach that needs epoch-boundary, skipped-slot and genesis tests. No new helper or endpoint is selected here.

## Proposed experimental boundary

Start with a pinned Gloas-only experiment, rejecting Heze explicitly until its additional input is supplied. This is a suggested first test slice, not a reduction of LOD-76's required Gloas/Heze coverage.

1. Use the Builder-owned dispatcher from #10064. Add `payload_attributes` to that subscription only for the configured experiment, preserving block/preference dispatch and failure isolation.
2. Consume #80's explicit hash-field proposal alongside the current producer ordering. Preserve merged #10037's emission before the BN's Engine call and account for #10056 when its producer changes are integrated.
3. Select the preference by proposal slot and the branch-correlated dependent root. If the preference or any required input is missing, report a no-build outcome. Preference bootstrap/recovery remains LOD-88.
4. Construct the existing fork-correlated `BuildRequest` and use the existing orchestrator/SlotBidder. Keep job identity and retrieval timing explicit; do not introduce another source, store or bidding service.
5. Bound pending work and suppress obsolete input before preparation. Abort during shutdown or replacement must prevent late retention/publication. Cancellation cannot undo an FCU already received by the EL.

Following the BN's emitted attributes does not, by itself, serialize a shared EL's FCU writers. Delayed delivery can still send an older view after the BN has advanced. A shared-EL run therefore remains an isolated PoC with this limitation recorded, not a production-safety claim. A dedicated EL avoids competing writers but does not remove the need for coherent parent, finality and custody inputs.

## Tests before upstream promotion

- Actual typed event dispatch into the consumer, not only manually constructed resolved inputs.
- Missing/invalid fork fields, unknown preference, mismatched dependent root, and absent finality/custody inputs produce no Engine preparation.
- FULL/EMPTY parents, epoch boundaries, skipped slots and reorg replacement preserve the correct branch and execution parent.
- Duplicate events share or suppress the intended job; changed meaningful input is not accidentally suppressed by a slot-only key.
- Shutdown, timeouts and replacement prevent late retention, signing and publication.
- Heze transaction/bid-bit correlation before enabling that fork.
- Builder/CLI construction under LOD-77 and selection/reveal wiring under LOD-78, followed by a pinned local BN/EL lifecycle run.

No ownership assignment, runtime implementation, shared-EL safety proof or completed lifecycle is claimed by this checkpoint.

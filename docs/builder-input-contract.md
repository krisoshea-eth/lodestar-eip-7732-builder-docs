# Builder input contract for the first runtime experiment

Research and implementation checkpoint, 12 September 2026. This is a fork-only experiment for [LOD-76](https://linear.app/kriso/issue/LOD-76), not an accepted Beacon API contract or completed runtime implementation. It is separate from [SPEC-01](beacon-api-block-event-extension.md), which concerns selection notifications.

The source references below were inspected at Lodestar [`a0619b279aa57140768859767be392ff5a20f656`](https://github.com/ChainSafe/lodestar/tree/a0619b279aa57140768859767be392ff5a20f656). The experimental `krisoshea/input-consumer` branch starts from fork #77 at `d6bee9001b463d9c910c80f8298a30b9a131a149`. Unlike the existing resolved-input pipeline, it accepts typed `head_v2`, `payload_attributes` and preference events. It is not yet connected to the running Builder dispatcher or CLI.

## Input sources and remaining decisions

| Input                                        | Available source                                      | Consumer rule or unresolved work                                                                                                                                                                      |
| -------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fork and proposal slot                       | Versioned `payload_attributes` event                  | Validate the version against the configured fork at `proposalSlot`; reject unsupported or mismatched input before Engine calls.                                                                       |
| Beacon parent root and execution parent hash | The same event                                        | Preserve both independently. FULL and EMPTY histories can select different execution parents; do not derive one identity from the other.                                                              |
| Payload attributes                           | The same event                                        | Preserve branch and fork-specific attributes. Set the execution fee recipient from Builder configuration, independently of the proposer's bid-payment address.                                        |
| Safe and finalized execution hashes          | Proposed Beacon APIs #638 / fork #80 fields           | Absent from the current external event. For the experiment, pin that proposal explicitly. Do not fill missing hashes with zero or independently sampled latest values.                                |
| Proposer preference dependent root           | Matching `head_v2` event for the head-only experiment | Require `head.block == attributes.parentBlockRoot`. Choose current/next epoch dependent root using the head block's epoch and proposal epoch, not the wall-clock epoch. Reject unsupported lookahead. |
| Custody columns                              | `api.lodestar.getCustodyInfo()` for the source BN     | Reusable for an explicitly configured shared-EL PoC only. A dedicated Builder EL needs its own selected configuration. Missing input is not permission to substitute `null`.                          |
| Heze inclusion-list bid bits                 | Not supplied directly by the payload-attributes event | `inclusionListTransactions` and bid `inclusionListBits` are distinct inputs. Document and test their derivation; do not fill the bits with an empty default merely to complete the type.              |

The existing [head_v2 contract](https://github.com/ethereum/beacon-APIs/pull/590) provides a narrower route than a new state query or endpoint. Its slot is the head block's slot, and its roots refer to that slot's current and next epoch. The experiment waits for a matching beacon parent and then looks up the exact `(proposalSlot, dependentRoot)` preference. It does not substitute `parentBlockRoot` or the last preference received. This handles head-parent builds within the advertised epoch range; arbitrary non-head parents and heads more than one epoch behind remain unsupported. A reorg back to a previously attempted input does not bypass the per-slot attempt limit.

The previous checkpoint incorrectly required preserving the BN's execution fee recipient. The [existing event description](https://github.com/ethereum/beacon-APIs/blob/ef98d512c03c8ca6b9d7cbdc45b9293ec2b24722/apis/eventstream/index.yaml) explicitly allows builders to ignore that suggestion. Nico's [reference SlotBidder](https://github.com/ChainSafe/lodestar/blob/99fd8fa9ad3a867fced3a5907a68edf3a519c1cd/packages/builder/src/services/slotBidder.ts) uses Builder configuration for execution proceeds and the proposer preference for the bid's payment address. The consumer keeps those addresses separate and copies attributes through the existing SSZ clone before changing the execution recipient.

## Proposed experimental boundary

Start with a pinned Gloas-only experiment, rejecting Heze explicitly until its additional input is supplied. This is a suggested first test slice, not a reduction of LOD-76's required Gloas/Heze coverage.

1. Use the Builder-owned dispatcher from #10064. Add `payload_attributes` and `head_v2` to that subscription only for the configured experiment, preserving block/preference dispatch and failure isolation. Insert preferences into their tracker before retrying pending input. This dispatcher connection remains outstanding.
2. Consume #80's explicit hash-field proposal alongside the current producer ordering. Preserve merged #10037's emission before the BN's Engine call and account for #10056 when its producer changes are integrated.
3. Select the preference by proposal slot and the branch-correlated dependent root from a matching head event. Require its validator index and target gas limit to match the payload input. If required input is missing, wait without preparing a payload. Preference and head bootstrap/recovery remain necessary before reliable startup/reconnect behavior can be claimed.
4. Construct the existing fork-correlated `BuildRequest` and use the existing orchestrator/SlotBidder. Keep job identity and retrieval timing explicit; do not introduce another source, store or bidding service.
5. Bound pending work and suppress obsolete input before preparation. Abort during shutdown or replacement must prevent late retention/publication. Cancellation cannot undo an FCU already received by the EL.

Following the BN's emitted attributes does not, by itself, serialize a shared EL's FCU writers. Delayed delivery can still send an older view after the BN has advanced. A shared-EL run therefore remains an isolated PoC with this limitation recorded, not a production-safety claim. A dedicated EL avoids competing writers but does not remove the need for coherent parent, finality and custody inputs.

## Tests before upstream promotion

The retrieval deadline is within the slot before the proposal, not the later payload-reveal deadline. The inspected BN scheduler normally prepares at 6667 basis points. A retrieval cutoff of 5000 would reject those normally scheduled events as late. The experiment tests a 9000-basis-point cutoff against the real Lodestar clock, while retaining rejection of already-missed deadlines. This is experimental configuration, not an agreed production timing default.

- Actual typed event dispatch into the consumer, not only manually constructed resolved inputs.
- Missing/invalid fork fields, unknown preference, mismatched dependent root, and absent finality/custody inputs produce no Engine preparation.
- FULL/EMPTY parents, epoch boundaries, skipped slots and reorg replacement preserve the correct branch and execution parent.
- Duplicate events share or suppress the intended job; changed meaningful input is not accidentally suppressed by a slot-only key.
- Shutdown, timeouts and replacement prevent late retention, signing and publication.
- Heze transaction/bid-bit correlation before enabling that fork.
- Builder/CLI construction under LOD-77 and selection/reveal wiring under LOD-78, followed by a pinned local BN/EL lifecycle run.

The fork-only experiment now exercises typed input through the actual SlotBidder, accepted store, ledger, signer and bid publisher, with mocked payload construction and BN publication transport. It retains only the latest pending input, bounds distinct attempts per slot, cancels replaced work and suppresses late results for duplicate callers. Failed attempts are not automatically retried. It carries the minimal #80 producer and codec changes so the experimental BN emits the same hash fields the consumer decodes; it does not supersede #80 or accept #638.

Dispatcher/Builder/CLI construction, complete Heze input derivation, restart recovery, shared-EL safety and real bid/selection/reveal evidence remain incomplete. No broader ownership assignment is claimed.

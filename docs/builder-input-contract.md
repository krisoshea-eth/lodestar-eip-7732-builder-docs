# Builder runtime input contract

This describes the Gloas consumer in [Lodestar #10247](https://github.com/ChainSafe/lodestar/pull/10247), [CLI draft #10259](https://github.com/ChainSafe/lodestar/pull/10259) and [recovery draft #10260](https://github.com/ChainSafe/lodestar/pull/10260). See [current status](current-status.md) for delivery state. The [28 September audit](reviews/2026-09-28-reconciliation.md) retains the earlier experiment's context.

## Inputs

| Input                                        | Source                                                                                        | Consumer rule                                                                                                                                                     |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fork and proposal slot                       | Versioned `payload_attributes`                                                                | Match the configured fork and proposal slot. Reject Heze in the initial live consumer.                                                                            |
| Beacon parent root and execution parent hash | The same event                                                                                | Preserve both. FULL/EMPTY histories can use different execution parents for the same beacon root.                                                                 |
| Safe and finalized execution hashes          | Fork-specific data from merged [#10243](https://github.com/ChainSafe/lodestar/pull/10243)     | Pass through the supplied values. Do not fill missing values with zero or a separate latest-state query.                                                          |
| Preference dependent root                    | Matching `head_v2`                                                                            | Require the head's beacon root to match the payload-attributes parent. Select the current/next epoch root using the head and proposal epochs, not the wall clock. |
| Signed proposer preference                   | Live stream; proposed [#10255](https://github.com/ChainSafe/lodestar/pull/10255) for recovery | Look up the exact proposal slot and dependent root, and check the validator and gas limit against the attributes. Do not use the last preference received.        |
| Execution fee recipient                      | Builder configuration                                                                         | Keep it separate from the proposer's bid-payment address. Clone the SSZ attributes before changing the execution recipient.                                       |
| Custody columns                              | Accepted Builder source contract                                                              | Send explicit `null`. No BN custody lookup or separate Builder custody configuration.                                                                             |
| Heze inclusion-list bid bits                 | Not implemented by this consumer                                                              | Transactions and bid bits are different inputs. Do not substitute empty bits to satisfy the type. Existing Heze assembly/signing support remains intact.          |

This is a head-parent consumer, not an arbitrary historical-branch builder. It waits when required branch-correlated input is missing. It does not fetch BeaconState or repeat the BN's consensus/signature validation.

## Build and reveal

The shared stream dispatches head, payload-attributes and preference events into the consumer. Each accepted input gets a constructor-bound orchestrator signal; changing the head or slot, or shutting down, cancels obsolete work. Duplicate requests share or suppress work, and late results cannot reach retention or publication after cancellation.

The retrieval deadline falls in the slot before the proposal. The reveal cutoff falls in the selected block's slot. These are separate settings. The tests use explicit timings, not production defaults.

The runtime reuses the merged source, store, policy, ledger, signer, selector and envelope publisher. It retains the returned payload before publishing a bid. An exact local selection is recorded before retrieving retained payload data, so missing data or a failed publication does not erase the accounting record.

Enabling live bidding requires a reveal cutoff. Reveal is prompt by default, following Nico's Lodestar-specific guidance; no additional attestation threshold is required. An optional caller policy may decline it. Both policy evaluation and publication are bounded, and per-event failures do not stop later events. Recording a selection is not proof that a payment settled.

## Engine and CLI follow-up

[#10234](https://github.com/ChainSafe/lodestar/pull/10234) connects one Gloas source to one JSON-RPC endpoint using the existing JWT client and codecs. Payload IDs remain local to that endpoint. Heze Engine transport and adoption of the future shared SSZ transport are separate work.

CLI draft #10259 constructs that source and the opt-in runtime. It requires explicit URL/JWT, pricing and timing configuration; observation-only startup remains the default. It depends on #10234 and #10247.

Following emitted attributes does not serialize two FCU writers. An FCU already received by the EL cannot be undone by canceling a local request. A pinned live experiment must state its EL ownership and avoid treating a shared-EL PoC as a production-safety guarantee.

## Preference recovery follow-up

Recovery draft #10260 uses Nico's proposed #10255 endpoint and the #10247 consumer. It subscribes first, then retrieves cached signed preferences on connection or reconnection. Existing live entries win over older snapshot entries. Expired slots and responses from a disconnected or superseded request are discarded.

Transient snapshot failures have at most three application attempts per connection, with cancellable backoff and nested API-client retries disabled. Rejected/unsupported requests and malformed response data are logged without a retry loop. Transport loss cancels active input work; fresh correlated events are needed before building again.

This does not replay missed blocks or heads, recover the in-memory ledger after a process restart, or settle publication outcomes. Those remain separate recovery tasks.

## Evidence needed

Targeted tests exercise actual Builder construction, typed event dispatch, exact selection, missing payloads, failed publication, cancellation and late results, with mocked BN/Engine boundaries. The adapter also has a separate pinned-Geth smoke test, not a complete Builder lifecycle.

The remaining live qualification must demonstrate a retained bid reaching another BN over p2p, selection, envelope publication and payload import, with matching client/genesis pins and an active registered Builder. Include startup/reconnect, late reveal, competing roots, FULL/EMPTY parents, shutdown and error cases. Heze needs its own inputs and transport qualification before enabling that runtime.

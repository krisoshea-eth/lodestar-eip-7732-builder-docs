# Beacon API Gloas Builder-selection event decision

> **Status:** Working draft for discussion. This document is not an accepted Beacon API specification.

| Field | Value |
| --- | --- |
| Owner | Kris O'Shea |
| Project tracker | [Linear LOD-48](https://linear.app/kriso/issue/LOD-48/spec-01-champion-the-gloas-builder-selection-event-decision-in-beacon) / [GitHub issue #49](https://github.com/krisoshea-eth/lodestar/issues/49) |
| Parent work | [BN-01 / LOD-15](https://linear.app/kriso/issue/LOD-15/bn-01-confirm-or-add-the-bn-route-and-event-surface-for-lodestar) |
| Upstream discussion | [ethereum/beacon-APIs #599](https://github.com/ethereum/beacon-APIs/issues/599) |
| Builder evidence | [API-02 PR #48](https://github.com/krisoshea-eth/lodestar/pull/48) |
| Lodestar proofs of concept | Marco's upstream [#9854](https://github.com/ChainSafe/lodestar/pull/9854), [#9875](https://github.com/ChainSafe/lodestar/pull/9875), [#9876](https://github.com/ChainSafe/lodestar/pull/9876), and [#9896](https://github.com/ChainSafe/lodestar/pull/9896), plus Nico's unpublished [`nflaig/builder`](https://github.com/ChainSafe/lodestar/tree/nflaig/builder) branch at `99fd8fa9ad` |
| Target repository | [`ethereum/beacon-APIs`](https://github.com/ethereum/beacon-APIs) |
| Beacon APIs audit base | [`159622d`](https://github.com/ethereum/beacon-APIs/commit/159622d983a703eb03a8a37bb1edeab7ffc3b6bc) |
| Last updated | 2026-08-24 |

## Abstract

This working draft compares the interoperable ways to notify an external Builder that a proposer selected its bid. The original preference was to extend the existing Beacon API `block` event from Gloas onward with `builder_index` and `block_hash`. Marco's four upstream Lodestar proofs of concept and Nico's implementation review have reopened that choice.

The extension gives an external Builder enough selection identity to reject unrelated blocks without retrieving every imported post-Gloas block. The two fields are a negative filter, not proof that the complete selected bid matches a locally signed bid. It does not remove `block` plus `getBlockV2` as the compatibility and complete-verification fallback.

The current candidates are the additive `block` fields, a dedicated event carrying the block root and complete signed bid, a dedicated event carrying the complete signed bid with the same payload as `execution_payload_bid`, and `block_v2`. No candidate has cross-client consensus. The specification draft must not choose one until the Lodestar implementation tradeoffs and other client constraints have been reviewed. The static client audit in this document establishes likely implementation seams, not client support.

## Motivation

The current `block` event reports that a block was successfully imported through the fork-choice `on_block` handler. Its payload contains:

- `slot`;
- `block`, meaning the beacon block root; and
- `execution_optimistic`.

It does not expose the fork version, selected Builder index, or execution block hash. The API-02 Builder path therefore retrieves each newly observed post-Gloas block by root with `getBlockV2`, checks the response fork metadata, and reads `signed_execution_payload_bid` from the fork-correct body.

That path is sufficient for correctness and remains the fallback. However, it requires one block request per imported post-Gloas root merely to determine whether the event could correspond to a local bid.

The sibling `execution_payload` event already carries `builder_index`, `block_hash`, and `block_root`, but it is emitted after the signed payload envelope is received and imported. That is too late to notify a Builder that it must reveal the selected payload. Reusing its field names and encodings avoids defining a second representation for the same selection identity.

## Goals

- Select the smallest interoperable post-import Builder-selection signal.
- Compare a minimal identity signal with a retrieval-free complete-bid signal.
- Preserve the existing pre-Gloas event shape.
- Define self-build behavior explicitly.
- Reuse field names and JSON encodings already present in the event API.
- Keep the change small enough to implement consistently across clients.
- Retain full block retrieval when a consumer needs the complete signed bid.
- Define safe behavior while client implementations roll out at different times.

## Non-goals

- Replace exact comparison with the complete locally signed bid.
- Change the event's import, canonicality, or optimistic-execution semantics.
- Add a gossip-time selection signal.
- Add event replay, SSE IDs, or reconnect recovery.
- Pre-commit to an additive `block` change, a dedicated event, or `block_v2` before cross-client review.
- Require every client implementation in the specification PR itself.
- Change event delivery ordering, retrievability, or replay guarantees.

## Current contract

The current example in `apis/eventstream/index.yaml` is:

```text
event: block
data: {"slot":"10","block":"0x9a2f...54eaf","execution_optimistic":false}
```

The event is emitted for a block received through P2P or the API that is successfully imported by the fork-choice `on_block` handler. It is an imported-block event, not a canonical-head notification. A client may therefore emit it for a valid non-head block.

## Candidate A: extend `block`

### Pre-Gloas

The event remains unchanged:

```text
event: block
data: {"slot":"10","block":"0x9a2f...54eaf","execution_optimistic":false}
```

### Gloas and later forks

The proposed specification contract is that the event MUST include both `builder_index` and `block_hash`:

```text
event: block
data: {"slot":"10","block":"0x9a2f...54eaf","execution_optimistic":false,"builder_index":"42","block_hash":"0x1234...cdef"}
```

| Field | Meaning | Source | Encoding |
| --- | --- | --- | --- |
| `slot` | Slot of the imported beacon block | Beacon block | Quoted decimal |
| `block` | Root of the imported beacon block | Imported block root | `0x`-prefixed 32-byte value |
| `execution_optimistic` | Existing optimistic-execution flag | Existing event semantics | JSON boolean |
| `builder_index` | Builder selected by the proposer | `block.body.signed_execution_payload_bid.message.builder_index` | Quoted decimal |
| `block_hash` | Execution block hash committed by the selected bid | `block.body.signed_execution_payload_bid.message.block_hash` | `0x`-prefixed 32-byte value |

The field name `block` continues to mean the beacon block root. The new `block_hash` field means the execution block hash. The specification text must keep that distinction explicit.

### Self-builds

Every Gloas beacon block contains a `signed_execution_payload_bid`, including self-builds. The two new fields therefore remain present for a self-build:

```text
event: block
data: {"slot":"10","block":"0x9a2f...54eaf","execution_optimistic":false,"builder_index":"18446744073709551615","block_hash":"0x1234...cdef"}
```

`builder_index` is set to `BUILDER_INDEX_SELF_BUILD`, whose consensus value is `UINT64_MAX`. The Beacon API JSON representation is the quoted decimal string `"18446744073709551615"`. `block_hash` remains the hash committed by the self-build bid.

The two fields disclose no new consensus data. Both are already public in the successfully imported beacon block.

## Event and consumer behavior

The proposal does not change when `block` is emitted. The fields describe the bid in the successfully imported block associated with the existing event.

A Builder can use `(builder_index, block_hash)` as an efficient first-pass selection check:

1. Ignore a self-build or a foreign `builder_index`.
2. Ignore an execution block hash that does not match a locally retained bid.
3. Use `getBlockV2` when the Builder requires the complete signed bid or stronger validation.

API-02 therefore remains useful after this extension. It supplies the bounded, fork-correct fallback and supports clients that have not implemented the additional fields.

During a mixed-version rollout, a consumer MUST NOT interpret missing fields as a self-build or as evidence that its bid was not selected. If either field is absent, the consumer falls back to the existing root-based `getBlockV2` path. The extension only removes a retrieval when both fields are present and the candidate can be rejected cheaply.

## Versioning and compatibility

The current working assumption is to keep `block` unversioned:

- the existing event is unversioned;
- the added values are primitive selection fields rather than a fork-specific consensus container;
- the event's meaning and emission point remain unchanged.

Recent Beacon APIs changes support that distinction:

- [PR #587](https://github.com/ethereum/beacon-APIs/pull/587) added `{version, data}` to events that directly emit fork-dependent consensus containers;
- [PR #590](https://github.com/ethereum/beacon-APIs/pull/590) introduced `head_v2` because the event's semantics and payload-status model changed, not merely because fields were added; and
- [PR #621](https://github.com/ethereum/beacon-APIs/pull/621) made an existing event field fork-conditional without introducing a new topic.

This candidate adds two primitive fields while preserving the event's meaning and emission point. Cross-client review must still confirm that existing producers, serializers, fixtures, and consumers tolerate the additive JSON fields and can enforce their post-Gloas presence without a new event version.

The candidate fork rules are:

- before Gloas: the two fields are absent;
- from Gloas onward: the two fields are required; and
- later forks retain the same primitive meanings even when the complete `ExecutionPayloadBid` container gains new fields.

The presence of both fields is therefore also the deployment-time capability signal. It does not replace fork metadata for decoding a retrieved block.

## Alternatives considered

### Keep `block` plus `getBlockV2` only

This is correct and remains the fallback, but it requires one request per imported post-Gloas block before a Builder can reject an unrelated selection.

### Add a thin `bid_included` event

Marco's [#9875](https://github.com/ChainSafe/lodestar/pull/9875) started as a thin identity event, then changed to carry the imported block root and complete `SignedExecutionPayloadBid`. A dedicated Builder event can exclude self-builds and avoid fork-conditional mutation of `block`, but its name, versioning, duplicated slot, and whether it should retain the beacon block root remain open.

### Add a full-bid event

Marco's [#9876](https://github.com/ChainSafe/lodestar/pull/9876) emits the same complete signed-bid payload as `execution_payload_bid`, but only when an imported block contains an external Builder bid. This is retrieval-free and preserves later fork additions such as Heze's `inclusion_list_bits`. It does not by itself carry the selecting beacon block root or `execution_optimistic`, and adding the 26th event exposed a TypeScript discriminated-union assignability limit in Lodestar that required explicit typing.

### Add `block_v2`

Marco's [#9896](https://github.com/ChainSafe/lodestar/pull/9896) adds a Gloas-only `block_v2` event with `builder_index` and `block_hash`. It avoids changing the legacy topic but duplicates the topic for two fields and still needs explicit self-build and supersession semantics.

## Implementation evidence

### API-02

The current Lodestar Builder implementation demonstrates:

- standard `block` plus `getBlockV2` is sufficient;
- one retrieval is required for each new post-Gloas block root;
- the response fork metadata is authoritative for decoding;
- self-build and later-fork bid values must pass through unchanged; and
- retrieval retry, root deduplication, and recovery policy remain separate from the proposed event fields.

### Lodestar proofs of concept

Marco opened four upstream PRs so the alternatives can be compared against real Lodestar code:

| PR | Candidate | Current implementation finding |
| --- | --- | --- |
| [#9854](https://github.com/ChainSafe/lodestar/pull/9854) | Extend `block` with `builder_index` and `block_hash` | The implementation can source the fields, but fork-conditional required fields are difficult to express safely. Nico described the shape as implicit and error-prone after reviewing the code, and asked whether `block_gossip` would also need the fields. |
| [#9875](https://github.com/ChainSafe/lodestar/pull/9875) | `bid_included` with block root plus complete signed bid | Nico preferred emitting the complete signed bid, questioned the name and duplicated slot, and raised whether a spec container requires a `{version, data}` envelope. Dedicated Builder events exclude self-builds. |
| [#9876](https://github.com/ChainSafe/lodestar/pull/9876) | `included_execution_payload_bid` with the existing signed-bid payload | Keeps a clean spec object and excludes self-builds, but does not identify the selecting beacon block by itself. The new EventType also exposed Lodestar's 26-member TypeScript union limit. |
| [#9896](https://github.com/ChainSafe/lodestar/pull/9896) | `block_v2` with the two identity fields | Avoids modifying the legacy topic, but duplicates `block` for two fields and still needs final self-build and supersession rules. |

These are design proofs of concept, not four changes intended to merge. Their main result is that the original extension preference is no longer a settled specification direction.

### End-to-end development branch

Nico's unpublished [`nflaig/builder`](https://github.com/ChainSafe/lodestar/tree/nflaig/builder) branch now provides the producer and consumer proof of concept. Commit [`679e12d8e2`](https://github.com/ChainSafe/lodestar/commit/679e12d8e2) adds optional `builderIndex` and `blockHash` fields to Lodestar's `block` event codec and emits both fields for every imported post-Gloas block from `signedExecutionPayloadBid.message`. The serializer tests cover an external Builder index, omission for the legacy shape, and `BUILDER_INDEX_SELF_BUILD` encoded as the quoted decimal `UINT64_MAX` value.

The same branch adds a Builder `Revealer` that consumes the enriched fields and falls back to `getBlockV2` when they are absent. That one-shot fallback demonstrates mixed-version compatibility. API-02 remains the stronger complete-block path because it adds fork metadata checks, structural validation, bounded retry, and root deduplication. If Nico's branch becomes an upstream PR, the two implementations should be reconciled rather than keeping parallel fetch paths.

The branch also records a two-node minimal-preset Kurtosis run in `packages/builder/DESIGN.md`, with the external Builder winning and revealing payloads. That is useful implementation evidence, but the branch is unpublished and unreviewed. It does not establish cross-client agreement or replace SPEC-01's upstream review.

The combined evidence should record:

- the issue, branch, commit, and PR;
- the exact event emission and serialization changes;
- an external-Builder event sample;
- a self-build event sample;
- a pre-Gloas compatibility test;
- post-Gloas field-presence tests;
- quoted-decimal serialization of `BUILDER_INDEX_SELF_BUILD`;
- imported non-head block behavior; and
- any codec, fixture, or consumer compatibility problems.

| Evidence | Status | Link or note |
| --- | --- | --- |
| API-02 Builder consumer | Implemented on fork; upstream review pending | [PR #48](https://github.com/krisoshea-eth/lodestar/pull/48) |
| Lodestar producer alternatives | Four upstream PoCs open | [#9854](https://github.com/ChainSafe/lodestar/pull/9854), [#9875](https://github.com/ChainSafe/lodestar/pull/9875), [#9876](https://github.com/ChainSafe/lodestar/pull/9876), and [#9896](https://github.com/ChainSafe/lodestar/pull/9896) |
| End-to-end compatibility PoC | Implemented on unpublished branch | [`nflaig/builder`](https://github.com/ChainSafe/lodestar/tree/nflaig/builder), event commit [`679e12d8e2`](https://github.com/ChainSafe/lodestar/commit/679e12d8e2) |
| External-Builder example | Covered by event serializer test and devnet Builder flow | [`eventSerdes.test.ts`](https://github.com/ChainSafe/lodestar/blob/nflaig/builder/packages/api/test/unit/beacon/eventSerdes.test.ts) and [`DESIGN.md`](https://github.com/ChainSafe/lodestar/blob/nflaig/builder/packages/builder/DESIGN.md) |
| Self-build example | Covered by serializer test | `BUILDER_INDEX_SELF_BUILD` serializes as `"18446744073709551615"` |
| Pre-Gloas compatibility test | Covered at codec level | Legacy event shape omits both optional fields |
| Post-Gloas serialization tests | Covered at codec level | Both fields serialize with existing event conventions |
| Imported non-head test | Pending focused evidence | Producer remains on the existing per-import emission path; add an explicit regression before treating this behavior as PoC-tested |

## Static client feasibility audit

This audit identifies where current clients construct and consume the `block` event. The cross-client source sweep was performed on 2026-08-14. The referenced Lighthouse, Prysm, Teku, Nimbus, and Grandine paths had no newer commits when rechecked on 2026-08-24; Lodestar and Beacon APIs were refreshed against their current heads. This is not a substitute for client-team review or proof that each implementation is trivial.

| Client | Current producer seam | Initial feasibility finding | Question to confirm with team |
| --- | --- | --- | --- |
| Lodestar | [`importBlock.ts`](https://github.com/ChainSafe/lodestar/blob/bd761ec9ea1d69657a99530e0c76f08f8e315da9/packages/beacon-node/src/chain/blocks/importBlock.ts) emits after import while the block input is available | Marco's four PoCs confirm the available data, while Nico's review shows that the wire shape and fork-conditional typing still need a decision | Compare the four PoCs with API-02 and confirm the explicit non-head regression |
| Lighthouse | [`SseBlock`](https://github.com/sigp/lighthouse/blob/b263df596/common/eth2/src/types.rs) is constructed in [`beacon_chain.rs`](https://github.com/sigp/lighthouse/blob/b263df596/beacon_node/beacon_chain/src/beacon_chain.rs) while the imported block is available | The producer still has the block, so the fields appear locally sourceable | Are additive fields accepted by all Lighthouse event consumers and fixtures? |
| Prysm | [`BlockProcessedData`](https://github.com/OffchainLabs/prysm/blob/b86db8d/beacon-chain/rpc/eth/events/events.go) carries the signed block into the event serializer | The serializer can access the Gloas body before reducing it to the current event fields | Which fork/body helpers should guard the post-Gloas fields? |
| Teku | [`BlockEvent`](https://github.com/Consensys/teku/blob/3003f5443ac53e53d856978871b951c28805b08b/data/beaconrestapi/src/main/java/tech/pegasys/teku/beaconrestapi/handlers/v1/events/BlockEvent.java) receives the complete `SignedBeaconBlock` | The event constructor has the necessary source object | Can its `SerializableTypeDefinition` express fields that are absent before Gloas and required afterwards without a new event type? |
| Nimbus | [`EventBeaconBlockObject.init`](https://github.com/status-im/nimbus-eth2/blob/4110bc7828a45518d22d60e2f60438ae81ff17e9/beacon_chain/consensus_object_pools/block_pools_types.nim) receives a forked trusted signed block before storing only the current fields | The producer has the block at conversion time | Does the shared REST decoder tolerate additional fields, and should the event object become fork-aware or use optional fields? |
| Grandine | [`send_block_event`](https://github.com/grandinetech/grandine/blob/eaf220e60699cd63d4223ad2481e42fd15f67802/fork_choice_control/src/events.rs) currently accepts only slot, block root, and optimistic status | Its current event-channel boundary no longer carries the signed block, so this may need a signature change or a safe lookup | What is the preferred way to retain or recover bid identity at both block-event call sites? |

The audit suggests the wire shape is implementable, but it also shows why a Lodestar-only proof of concept is not enough to claim cross-client simplicity. Grandine's narrower event-channel interface and the different client decoder strategies are concrete review items.

The current API description is example-based rather than a strongly connected schema per event topic. The upstream PR should therefore rely on explicit prose, examples, client tests, and the `CHANGES.md` support matrix rather than assuming the OpenAPI linter can verify fork-conditional payload behavior.

## Cross-client review

The Beacon APIs change tracker currently records Lighthouse, Lodestar, Nimbus, Prysm, and Teku. The proposal should also ask whether other active clients, including Grandine, need to be included in the review.

Questions for each client team:

1. Can the client source both fields at the existing post-import `block` emission point?
2. Does its event serializer support fields that are required only from Gloas onward?
3. Do existing event consumers tolerate additional JSON fields?
4. Does the client agree with the self-build sentinel and quoted-decimal encoding?
5. Do `builder_index` and `block_hash` match its existing Gloas and event conventions?
6. Are additional fixtures or tests needed because the event stream is described through examples rather than a strongly connected per-topic schema?

Recent event PRs provide a practical starting point for reviewers: `@michaelsproul` for Lighthouse, `@rolfyone` for Teku, `@james-prysm` for Prysm, `@tersec` for Nimbus, and `@nflaig` plus `@ensi321` for the Lodestar and Gloas surface. These are suggested contacts based on [PR #590](https://github.com/ethereum/beacon-APIs/pull/590) and [PR #621](https://github.com/ethereum/beacon-APIs/pull/621), not assigned reviewers. Confirm the current contact list and the Grandine contact with Nico before tagging anyone.

| Client | Suggested initial review | Position | Implementation link | Notes |
| --- | --- | --- | --- | --- |
| Lodestar | Nico and NC | Decision reopened after implementation review | [#9854](https://github.com/ChainSafe/lodestar/pull/9854), [#9875](https://github.com/ChainSafe/lodestar/pull/9875), [#9876](https://github.com/ChainSafe/lodestar/pull/9876), [#9896](https://github.com/ChainSafe/lodestar/pull/9896) | Compare type safety, versioning, block-root identity, and self-build behavior before choosing a wire shape |
| Lighthouse | Michael Sproul | Pending | | Confirm source and decoder findings |
| Nimbus | Jacek Sieka | Pending | | Confirm source and decoder findings |
| Prysm | James | Pending | | Confirm source and fork-guard findings |
| Teku | Paul Harris | Pending | | Confirm serializer approach |
| Grandine or other active clients | Confirm with Nico | Pending | | Confirm review scope and event-channel approach |

### Outreach sequence

1. Keep this document as the evidence notebook while Marco's four upstream PoCs and Nico's review feedback are compared.
2. Ask Nico to confirm which candidate should become the initial cross-client proposal, the current client representatives, and the preferred cross-client venue. Do not treat Discord acknowledgement as specification approval.
3. When one wire contract has a defensible implementation rationale, open a draft Beacon APIs PR linked to #599 even if not every implementation exists yet. The draft PR gives all teams one concrete diff to review.
4. Request one response per client covering producer feasibility, decoder compatibility, self-build behavior, and any preferred alternative.
5. Record each response and implementation link in the table above and in the upstream `CHANGES.md` row.
6. Keep the PR in draft until the Lodestar implementation shape and initial cross-client feasibility review are complete. Client implementations may land after the specification decision, with support tracked in `CHANGES.md`.

Cross-client buy-in means agreement that the wire contract is implementable and interoperable. It does not require every client implementation to merge before the specification PR can proceed.

## Upstream patch plan

After the candidate decision, the initial Beacon APIs PR should be narrow:

1. Update the chosen event description and example in `apis/eventstream/index.yaml`.
2. Add the corresponding event entry to `CHANGES.md`.
3. Link the PR to issue #599, this working draft, API-02, and the Lodestar PoC.
4. Run `redocly lint beacon-node-oapi.yaml`.
5. Open as a draft and request cross-client feedback before treating the shape as settled.

Immediately before opening the PR, recheck `ethereum/beacon-APIs:master` and open pull requests for overlapping event changes. The 2026-08-24 refresh advanced the audit base from `ba859db` to `159622d`. The only eventstream-file change in that range adds `execution_requests_root` to the `execution_payload_bid` example and does not alter `block`. As of this refreshed base:

- [PR #585](https://github.com/ethereum/beacon-APIs/pull/585) also edits `apis/eventstream/index.yaml` to enrich `chain_reorg`; and
- [PR #490](https://github.com/ethereum/beacon-APIs/pull/490) edits the eventstream file for Heze FOCIL support.

Neither PR currently implements #599. PR #490 was updated on 2026-08-21, so both remain mechanical overlap watches before this proposal opens upstream.

## Open questions

- Which candidate best balances type safety, exact selection identity, compatibility, and implementation cost?
- If a dedicated full-bid event is selected, should it also carry the selecting beacon block root and `execution_optimistic`, and must it use a `{version, data}` envelope?
- If `block` or `block_v2` is selected, should the corresponding `block_gossip` topic change too?
- Which cross-client channel or meeting should carry the initial review request?
- Which active clients should be named beyond the five represented in `CHANGES.md`?
- Do any clients have strict event decoders that reject additional fields?
- Does the example-based event specification require additional schema or fixture work for fork-conditional fields?
- Should the compatibility fallback be mentioned directly in the normative event description or only in the PR rationale?
- Should `CHANGES.md` continue to be the complete implementation-support matrix, with Grandine tracked separately in this project until the upstream table includes it?

## Decision log

| Date | Decision | Basis |
| --- | --- | --- |
| 2026-08-11 | Preserve `block` plus `getBlockV2` as the correct bounded fallback | API-02 implementation evidence posted to #599 |
| 2026-08-12 | Record extending `block` as the initial preference over a thin `bid_included` event or `block_v2` | Discussion with Nico and Marco before the implementation comparison |
| 2026-08-12 | If `block` is extended, require both fields post-Gloas and use `BUILDER_INDEX_SELF_BUILD` for self-builds | Nico's clarification; a dedicated Builder event instead excludes self-builds |
| 2026-08-13 | Track the proposal in one SPEC-01 issue and one working design draft | [LOD-48](https://linear.app/kriso/issue/LOD-48/spec-01-champion-the-gloas-builder-selection-event-decision-in-beacon) |
| 2026-08-14 | Treat missing fields during mixed-client rollout as a signal to use `getBlockV2`, not as non-selection | Preserve API-02 correctness while implementations roll out |
| 2026-08-14 | Use a draft upstream PR as the main cross-client review artifact | Recent Beacon APIs event changes were reviewed against concrete diffs |
| 2026-08-24 | Treat Nico's `nflaig/builder` branch as the current Lodestar PoC | It implements the producer fields, mixed-version fallback, serializer tests, and a two-node Builder run, but remains unpublished and unreviewed |
| 2026-08-24 | Reopen the event-shape decision before drafting the Beacon APIs PR | Marco's four upstream PoCs and Nico's review show real type-safety, versioning, identity, and self-build tradeoffs. API-02 remains correct independently. |

## Completion criteria

This working draft is ready to become a draft Beacon APIs PR when:

- one candidate wire shape and its fork, self-build, and versioning rules are internally consistent;
- Nico has completed an initial shape review; and
- the cross-client review venue and initial reviewers are identified.

The upstream PR is ready to leave draft when:

- the reviewed Lodestar implementation evidence is linked;
- external-Builder, self-build, and pre-Gloas examples are verified;
- each active client team has responded on producer and consumer feasibility; and
- objections favoring a different event candidate have been resolved or recorded.

SPEC-01 is complete when the Beacon APIs PR either merges with documented cross-client support or reaches a recorded upstream decision with clear follow-up ownership.

## References

- [Beacon APIs issue #599](https://github.com/ethereum/beacon-APIs/issues/599)
- [Current event stream specification](https://github.com/ethereum/beacon-APIs/blob/master/apis/eventstream/index.yaml)
- [Beacon APIs PR #587: version Gloas container events](https://github.com/ethereum/beacon-APIs/pull/587)
- [Beacon APIs PR #590: add `head_v2`](https://github.com/ethereum/beacon-APIs/pull/590)
- [Beacon APIs PR #621: fork-conditional `payload_attributes` field](https://github.com/ethereum/beacon-APIs/pull/621)
- [Gloas consensus specification](https://github.com/ethereum/consensus-specs/blob/master/specs/gloas/beacon-chain.md)
- [Heze consensus specification](https://github.com/ethereum/consensus-specs/blob/master/specs/heze/beacon-chain.md)
- [API-02 implementation PR #48](https://github.com/krisoshea-eth/lodestar/pull/48)
- [Lighthouse `SseBlock` and event decoder](https://github.com/sigp/lighthouse/blob/b263df596/common/eth2/src/types.rs)
- [Prysm block-event serializer](https://github.com/OffchainLabs/prysm/blob/b86db8d/beacon-chain/rpc/eth/events/events.go)
- [Teku block-event schema](https://github.com/Consensys/teku/blob/3003f5443ac53e53d856978871b951c28805b08b/data/beaconrestapi/src/main/java/tech/pegasys/teku/beaconrestapi/handlers/v1/events/BlockEvent.java)
- [Nimbus block-event object](https://github.com/status-im/nimbus-eth2/blob/4110bc7828a45518d22d60e2f60438ae81ff17e9/beacon_chain/consensus_object_pools/block_pools_types.nim)
- [Grandine event channel](https://github.com/grandinetech/grandine/blob/eaf220e60699cd63d4223ad2481e42fd15f67802/fork_choice_control/src/events.rs)
- [Builder implementation plan](implementation-plan.md)
- [Builder Living Technical Note](living-technical-note.md)

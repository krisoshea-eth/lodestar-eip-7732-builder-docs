# Beacon API Gloas Builder-selection event decision

> **Status:** Working draft for discussion. This document is not an accepted Beacon API specification.

| Field | Value |
| --- | --- |
| Owner | Kris O'Shea |
| Project tracker | [Linear LOD-48](https://linear.app/kriso/issue/LOD-48/spec-01-champion-the-gloas-builder-selection-event-decision-in-beacon) / [GitHub issue #49](https://github.com/krisoshea-eth/lodestar/issues/49) |
| Parent work | [BN-01 / LOD-15](https://linear.app/kriso/issue/LOD-15/bn-01-confirm-or-add-the-bn-route-and-event-surface-for-lodestar) |
| Upstream discussion | [ethereum/beacon-APIs #599](https://github.com/ethereum/beacon-APIs/issues/599) |
| Builder evidence | [upstream API-02 PR #9931](https://github.com/ChainSafe/lodestar/pull/9931) |
| Lodestar proofs of concept | Marco's upstream [#9854](https://github.com/ChainSafe/lodestar/pull/9854), [#9875](https://github.com/ChainSafe/lodestar/pull/9875), [#9876](https://github.com/ChainSafe/lodestar/pull/9876), and [#9896](https://github.com/ChainSafe/lodestar/pull/9896), plus Nico's draft [`nflaig/builder`](https://github.com/ChainSafe/lodestar/tree/nflaig/builder) branch at `99fd8fa9ad` |
| Target repository | [`ethereum/beacon-APIs`](https://github.com/ethereum/beacon-APIs) |
| Beacon APIs audit base | [`ef98d51`](https://github.com/ethereum/beacon-APIs/commit/ef98d512c03c8ca6b9d7cbdc45b9293ec2b24722) |
| Last updated | 2026-09-02 |

> **Artifact boundary:** This document owns the Builder-selection notification question in beacon-APIs #599. Marco's open [beacon-APIs #638](https://github.com/ethereum/beacon-APIs/pull/638) is a separate payload-attributes schema change for `safe_block_hash` and `finalized_block_hash`. The current #638 head does not specify post-Gloas emission timing and does not settle the selection-event wire contract.

## Abstract

This working draft compares the interoperable ways to notify an external Builder that a proposer selected its bid. The original preference was to extend the existing Beacon API `block` event from Gloas onward with `builder_index` and `block_hash`. Marco's four upstream Lodestar proofs of concept and Nico's implementation review have reopened that choice.

The extension gives an external Builder enough selection identity to reject unrelated blocks without retrieving every imported post-Gloas block. The two fields are a negative filter, not proof that the complete selected bid matches a locally signed bid. It does not remove `block` plus `getBlockV2` as the compatibility and complete-verification fallback.

The two leading choices are extending `block` with `builder_index` and `block_hash`, or adding a lightweight external-Builder-only `bid_included` event with the data needed to locate retained payload material. `block_v2` remains a live compatibility alternative until other client teams respond, although it duplicates the existing topic for two fields. The full `SignedExecutionPayloadBid` and `bid_root` variants no longer have a demonstrated consumer need. No candidate has cross-client consensus. The static client audit in this document establishes likely implementation seams, not client support.

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

Every Gloas beacon block contains a `signed_execution_payload_bid`, including self-builds. Earlier discussion favored keeping both fields present and using `BUILDER_INDEX_SELF_BUILD`:

```text
event: block
data: {"slot":"10","block":"0x9a2f...54eaf","execution_optimistic":false,"builder_index":"18446744073709551615","block_hash":"0x1234...cdef"}
```

`builder_index` is set to `BUILDER_INDEX_SELF_BUILD`, whose consensus value is `UINT64_MAX`. The Beacon API JSON representation is the quoted decimal string `"18446744073709551615"`. `block_hash` remains the hash committed by the self-build bid.

Marco's latest #9854 proof of concept omits the added fields for self-builds. That is useful implementation evidence, but it is not the preferred Candidate A contract: Nico and NC both favor required post-Gloas fields because optional fields are ambiguous. Under Candidate A, a self-build therefore carries `BUILDER_INDEX_SELF_BUILD` and its committed `block_hash`. A dedicated external-Builder event naturally emits nothing for self-builds.

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

## Candidate B: add `bid_included`

Candidate B leaves `block` unchanged and adds an event emitted only when a successfully imported block selects an external Builder bid:

```text
event: bid_included
data: {"slot":"10","block_root":"0x9a2f...54eaf","block_hash":"0x1234...cdef","builder_index":"42"}
```

| Field | Meaning | Source | Encoding |
| --- | --- | --- | --- |
| `slot` | Slot of the imported beacon block | Beacon block | Quoted decimal |
| `block_root` | Root of the imported beacon block | Imported block root | `0x`-prefixed 32-byte value |
| `block_hash` | Execution block hash committed by the selected bid | `block.body.signed_execution_payload_bid.message.block_hash` | `0x`-prefixed 32-byte value |
| `builder_index` | External Builder selected by the proposer | `block.body.signed_execution_payload_bid.message.builder_index` | Quoted decimal |

NC's confirmed contract for this candidate is:

- emit only after successful block import, not when a bid is merely observed over gossip;
- emit for valid imported non-head blocks because they may later become head;
- do not emit for self-builds;
- do not add `execution_optimistic` unless another consumer demonstrates a need for it;
- use `bid_included` as the working event name;
- do not carry the complete `SignedExecutionPayloadBid`; and
- do not add `bid_root`, because the four identity fields already locate the retained material needed for reveal.

Candidate B is additive and gives consumers an explicit external-Builder lifecycle signal. Its cost is a second event that repeats the slot and beacon block root already present in `block`. The post-import trigger and non-head behavior must remain normative so it does not drift into a canonical-head or gossip event.

## Other alternatives

### Keep `block` plus `getBlockV2` only

This is correct and remains the fallback, but it requires one request per imported post-Gloas block before a Builder can reject an unrelated selection.

### Add a full-bid event

Marco's [#9875](https://github.com/ChainSafe/lodestar/pull/9875) and [#9876](https://github.com/ChainSafe/lodestar/pull/9876) demonstrate complete signed-bid variants. No current Builder consumer needs the full bid from the event: the local Builder already retains the material required for reveal, while API-02 can fetch the selected block for complete verification. Carrying a fork-dependent consensus container would also require versioning. Keep these PRs as comparison evidence unless a different consumer demonstrates a concrete need.

### Add `block_v2`

Marco's [#9896](https://github.com/ChainSafe/lodestar/pull/9896) adds a Gloas-only `block_v2` event with `builder_index` and `block_hash`. It avoids changing the legacy topic but duplicates the topic for two fields and still needs explicit self-build and supersession semantics. NC considers it a live option until other client teams respond, so it must not be described as rejected yet.

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
| [#9854](https://github.com/ChainSafe/lodestar/pull/9854) | Extend `block` with `builder_index` and `block_hash` | The implementation can source the fields, but its current self-build omission differs from the preferred required-field contract. Fork-conditional required fields also need a clear cross-client encoding rule. |
| [#9875](https://github.com/ChainSafe/lodestar/pull/9875) | `bid_included` with block root plus complete signed bid | Nico preferred emitting the complete signed bid, questioned the name and duplicated slot, and raised whether a spec container requires a `{version, data}` envelope. Dedicated Builder events exclude self-builds. |
| [#9876](https://github.com/ChainSafe/lodestar/pull/9876) | `included_execution_payload_bid` with the existing signed-bid payload | Keeps a clean spec object and excludes self-builds, but does not identify the selecting beacon block by itself. The new EventType also exposed Lodestar's 26-member TypeScript union limit. |
| [#9896](https://github.com/ChainSafe/lodestar/pull/9896) | `block_v2` with the two identity fields | Avoids modifying the legacy topic, but duplicates `block` for two fields and still needs final self-build and supersession rules. |

These are design proofs of concept, not four changes intended to merge. Their main result is that the original extension preference is no longer a settled specification direction. #9875 is still useful as the implementation base for the lightweight Candidate B, but its full-bid payload would need to be reduced to the four identity fields above.

### End-to-end development branch

Nico's draft [`nflaig/builder`](https://github.com/ChainSafe/lodestar/tree/nflaig/builder) branch now provides the producer and consumer proof of concept. Commit [`679e12d8e2`](https://github.com/ChainSafe/lodestar/commit/679e12d8e2) adds optional `builderIndex` and `blockHash` fields to Lodestar's `block` event codec and emits both fields for every imported post-Gloas block from `signedExecutionPayloadBid.message`. The serializer tests cover an external Builder index, omission for the legacy shape, and `BUILDER_INDEX_SELF_BUILD` encoded as the quoted decimal `UINT64_MAX` value.

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
| API-02 Builder consumer | In upstream review | [Lodestar #9931](https://github.com/ChainSafe/lodestar/pull/9931) |
| Lodestar producer alternatives | Four upstream PoCs open | [#9854](https://github.com/ChainSafe/lodestar/pull/9854), [#9875](https://github.com/ChainSafe/lodestar/pull/9875), [#9876](https://github.com/ChainSafe/lodestar/pull/9876), and [#9896](https://github.com/ChainSafe/lodestar/pull/9896) |
| End-to-end compatibility PoC | Implemented on a draft branch | [`nflaig/builder`](https://github.com/ChainSafe/lodestar/tree/nflaig/builder), event commit [`679e12d8e2`](https://github.com/ChainSafe/lodestar/commit/679e12d8e2) |
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

1. Does the client prefer required post-Gloas fields on `block`, a lightweight `bid_included` event, or `block_v2`?
2. Can the client source the fields at the existing successful-import point, including for valid non-head blocks?
3. If `block` is extended, can its serializer express fields that are absent before Gloas and required afterwards, and do consumers tolerate the additions?
4. If `bid_included` is added, can the producer reliably suppress self-builds while preserving imported non-head events?
5. Does the client agree that `execution_optimistic`, `bid_root`, and the complete signed bid are unnecessary for the Builder reveal decision?
6. Are additional fixtures or tests needed because the event stream is described through examples rather than a strongly connected per-topic schema?

Recent event PRs provide a practical starting point for reviewers: `@michaelsproul` for Lighthouse, `@rolfyone` for Teku, `@james-prysm` for Prysm, `@tersec` for Nimbus, and `@nflaig` plus `@ensi321` for the Lodestar and Gloas surface. These are suggested contacts based on [PR #590](https://github.com/ethereum/beacon-APIs/pull/590) and [PR #621](https://github.com/ethereum/beacon-APIs/pull/621), not assigned reviewers. Confirm the current contact list and the Grandine contact with Nico before tagging anyone.

| Client | Suggested initial review | Position | Implementation link | Notes |
| --- | --- | --- | --- | --- |
| Lodestar | Nico and NC | Split preference: Nico favors extending `block`; NC favors lightweight `bid_included`; `block_v2` remains live pending cross-client input | [#9854](https://github.com/ChainSafe/lodestar/pull/9854), [#9875](https://github.com/ChainSafe/lodestar/pull/9875), [#9876](https://github.com/ChainSafe/lodestar/pull/9876), [#9896](https://github.com/ChainSafe/lodestar/pull/9896) | Full-bid and bid-root variants no longer have a demonstrated Builder need |
| Lighthouse | Michael Sproul | Pending | | Confirm source and decoder findings |
| Nimbus | Jacek Sieka | Pending | | Confirm source and decoder findings |
| Prysm | James | Pending | | Confirm source and fork-guard findings |
| Teku | Paul Harris | Pending | | Confirm serializer approach |
| Grandine or other active clients | Confirm with Nico | Pending | | Confirm review scope and event-channel approach |

### Outreach sequence

1. Keep this document as the evidence notebook while the three live wire candidates are compared.
2. Prepare concrete `index.yaml` and `CHANGES.md` patches for Candidate A and Candidate B so client teams can review exact contracts rather than prose summaries.
3. Use Beacon APIs #599 and the preferred cross-client venue to ask client teams which patch they can implement safely. Do not treat Lodestar's split preference as specification approval.
4. Select one patch after the first cross-client responses, then open or update a draft Beacon APIs PR linked to #599. Do not open competing upstream PRs unless maintainers request that format.
5. Request one response per client covering producer feasibility, decoder compatibility, self-build behavior, and any preferred alternative.
6. Record each response and implementation link in the table above and in the upstream `CHANGES.md` row.
7. Keep the PR in draft until the Lodestar implementation shape and initial cross-client feasibility review are complete. Client implementations may land after the specification decision, with support tracked in `CHANGES.md`.

Cross-client buy-in means agreement that the wire contract is implementable and interoperable. It does not require every client implementation to merge before the specification PR can proceed.

## Upstream patch plan

Before the candidate decision, prepare two narrow patch variants:

- Candidate A updates the `block` description and example with required post-Gloas `builder_index` and `block_hash` fields.
- Candidate B adds `bid_included` with `slot`, `block_root`, `block_hash`, and `builder_index`, successful-import semantics, valid non-head behavior, and no self-build emission.

After cross-client input selects a candidate, the initial Beacon APIs PR should:

1. Update the chosen event description and example in `apis/eventstream/index.yaml`.
2. Add the corresponding event entry to `CHANGES.md`.
3. Link the PR to issue #599, this working draft, API-02, and the Lodestar PoC.
4. Run `redocly lint beacon-node-oapi.yaml`.
5. Open as a draft and request cross-client feedback before treating the shape as settled.

Immediately before opening the PR, recheck `ethereum/beacon-APIs:master` and open pull requests for overlapping event changes. The 2026-09-02 refresh advanced the audit base to `ef98d51`; issue #599 still has no chosen contract. As of this refreshed base:

- [PR #585](https://github.com/ethereum/beacon-APIs/pull/585) also edits `apis/eventstream/index.yaml` to enrich `chain_reorg`; and
- [PR #490](https://github.com/ethereum/beacon-APIs/pull/490) edits the eventstream file for Heze FOCIL support.

Neither PR currently implements #599. PR #490 was updated on 2026-08-21, so both remain mechanical overlap watches before this proposal opens upstream.

## Open questions

- Which of Candidate A, Candidate B, or `block_v2` best balances type safety, compatibility, and implementation cost across clients?
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
| 2026-08-31 | Narrow the live comparison to additive `block` fields versus a lightweight dedicated event | NC questioned the need for the full signed bid and favored enough identity to locate retained payload material. Self-build handling for the additive shape remains unresolved between earlier discussion and the latest #9854 PoC. |
| 2026-09-02 | Define the lightweight candidate as `bid_included(slot, block_root, block_hash, builder_index)` | NC confirmed external-Builder-only, successful-import and valid non-head semantics; `execution_optimistic` is not needed for reveal, and `bid_root` is superseded. |
| 2026-09-02 | Keep required post-Gloas fields for Candidate A and retain `block_v2` as a live comparison | NC agreed optional fields are undesirable and clarified that `block_v2` remains live until other client teams respond. |
| 2026-09-02 | Prepare exact patches for both leading candidates before choosing an upstream contract | Lodestar has a split preference, so cross-client review should compare concrete wire changes. |

## Completion criteria

This working draft is ready to produce the two candidate patches when:

- both leading wire shapes and their fork, self-build, and import rules are internally consistent; and
- the cross-client review venue and initial reviewers are identified.

One candidate is ready to become the draft Beacon APIs PR when initial cross-client feedback provides a defensible preference.

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
- [API-02 implementation PR #9931](https://github.com/ChainSafe/lodestar/pull/9931)
- [Lighthouse `SseBlock` and event decoder](https://github.com/sigp/lighthouse/blob/b263df596/common/eth2/src/types.rs)
- [Prysm block-event serializer](https://github.com/OffchainLabs/prysm/blob/b86db8d/beacon-chain/rpc/eth/events/events.go)
- [Teku block-event schema](https://github.com/Consensys/teku/blob/3003f5443ac53e53d856978871b951c28805b08b/data/beaconrestapi/src/main/java/tech/pegasys/teku/beaconrestapi/handlers/v1/events/BlockEvent.java)
- [Nimbus block-event object](https://github.com/status-im/nimbus-eth2/blob/4110bc7828a45518d22d60e2f60438ae81ff17e9/beacon_chain/consensus_object_pools/block_pools_types.nim)
- [Grandine event channel](https://github.com/grandinetech/grandine/blob/eaf220e60699cd63d4223ad2481e42fd15f67802/fork_choice_control/src/events.rs)
- [Builder implementation plan](implementation-plan.md)
- [Builder Living Technical Note](living-technical-note.md)

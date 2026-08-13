# Beacon API Gloas block-event extension

> **Status:** Working draft for discussion. This document is not an accepted Beacon API specification.

| Field | Value |
| --- | --- |
| Owner | Kris O'Shea |
| Project tracker | [Linear LOD-48](https://linear.app/kriso/issue/LOD-48/spec-01-champion-the-gloas-block-event-extension-in-beacon-apis) / [GitHub issue #49](https://github.com/krisoshea-eth/lodestar/issues/49) |
| Parent work | [BN-01 / LOD-15](https://linear.app/kriso/issue/LOD-15/bn-01-confirm-or-add-the-bn-route-and-event-surface-for-lodestar) |
| Upstream discussion | [ethereum/beacon-APIs #599](https://github.com/ethereum/beacon-APIs/issues/599) |
| Builder evidence | [API-02 PR #48](https://github.com/krisoshea-eth/lodestar/pull/48) |
| Lodestar proof of concept | Pending |
| Target repository | [`ethereum/beacon-APIs`](https://github.com/ethereum/beacon-APIs) |
| Last updated | 2026-08-13 |

## Abstract

This working draft proposes extending the existing Beacon API `block` event from Gloas onward with `builder_index` and `block_hash`. Both values come from the `signed_execution_payload_bid` included in the imported beacon block. Pre-Gloas event payloads remain unchanged.

The extension gives an external Builder enough selection identity to reject unrelated blocks without retrieving every imported post-Gloas block. It does not remove `block` plus `getBlockV2` as the compatibility and complete-verification fallback.

The preferred shape reflects the current Lodestar discussion with Nico. It is not cross-client consensus yet. The proposal must be checked against a Lodestar proof of concept and reviewed by other consensus-client teams before it can be treated as an interoperable contract.

## Motivation

The current `block` event reports that a block was successfully imported through the fork-choice `on_block` handler. Its payload contains:

- `slot`;
- `block`, meaning the beacon block root; and
- `execution_optimistic`.

It does not expose the fork version, selected Builder index, or execution block hash. The API-02 Builder path therefore retrieves each newly observed post-Gloas block by root with `getBlockV2`, checks the response fork metadata, and reads `signed_execution_payload_bid` from the fork-correct body.

That path is sufficient for correctness and remains the fallback. However, it requires one block request per imported post-Gloas root merely to determine whether the event could correspond to a local bid.

The sibling `execution_payload` event already carries `builder_index`, `block_hash`, and `block_root`, but it is emitted after the signed payload envelope is received and imported. That is too late to notify a Builder that it must reveal the selected payload.

## Goals

- Reuse the existing post-import `block` event.
- Expose minimal Builder-selection identity from Gloas onward.
- Preserve the existing pre-Gloas event shape.
- Define self-build behavior explicitly.
- Reuse field names and JSON encodings already present in the event API.
- Keep the change small enough to implement consistently across clients.
- Retain full block retrieval when a consumer needs the complete signed bid.

## Non-goals

- Replace exact comparison with the complete locally signed bid.
- Change the event's import, canonicality, or optimistic-execution semantics.
- Add a gossip-time selection signal.
- Add event replay, SSE IDs, or reconnect recovery.
- Add a dedicated `bid_included` event in this proposal.
- Add `block_v2` solely for these two fields.
- Require every client implementation in the specification PR itself.

## Current contract

The current example in `apis/eventstream/index.yaml` is:

```text
event: block
data: {"slot":"10","block":"0x9a2f...54eaf","execution_optimistic":false}
```

The event is emitted for a block received through P2P or the API that is successfully imported by the fork-choice `on_block` handler. It is an imported-block event, not a canonical-head notification. A client may therefore emit it for a valid non-head block.

## Proposed contract

### Pre-Gloas

The event remains unchanged:

```text
event: block
data: {"slot":"10","block":"0x9a2f...54eaf","execution_optimistic":false}
```

### Gloas and later forks

The event always includes `builder_index` and `block_hash`:

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

## Event and consumer behavior

The proposal does not change when `block` is emitted. The fields describe the bid in the successfully imported block associated with the existing event.

A Builder can use `(builder_index, block_hash)` as an efficient first-pass selection check:

1. Ignore a self-build or a foreign `builder_index`.
2. Ignore an execution block hash that does not match a locally retained bid.
3. Use `getBlockV2` when the Builder requires the complete signed bid or stronger validation.

API-02 therefore remains useful after this extension. It supplies the bounded, fork-correct fallback and supports clients that have not implemented the additional fields.

## Versioning and compatibility

The current working assumption is to keep `block` unversioned:

- the existing event is unversioned;
- the added values are primitive selection fields rather than a fork-specific consensus container;
- JSON consumers should tolerate unknown fields; and
- the event's meaning and emission point remain unchanged.

This differs from events that carry a fork-dependent consensus container, which use a `{version, data}` wrapper. Cross-client review must still confirm that existing producers, serializers, fixtures, and consumers can add the fields without a new event version.

The proposed fork rules are:

- before Gloas: the two fields are absent;
- from Gloas onward: the two fields are required; and
- later forks retain the same primitive meanings even when the complete `ExecutionPayloadBid` container gains new fields.

## Alternatives considered

### Keep `block` plus `getBlockV2` only

This is correct and remains the fallback, but it requires one request per imported post-Gloas block before a Builder can reject an unrelated selection.

### Add a thin `bid_included` event

An event containing only `builder_index` and `block_hash` would duplicate the existing `block` event and would need separate semantics for self-builds. It is not the preferred direction.

### Add a full-bid event

A retrieval-free Builder contract could emit the complete versioned `SignedExecutionPayloadBid`, together with the beacon block root and `execution_optimistic`. That would preserve later fork additions such as Heze's `inclusion_list_bits`, but it is a materially larger interface than the current minimal proposal.

### Add `block_v2`

A new event could supersede `block` from Gloas onward, but a second topic is disproportionate when the current proposal only adds two primitive fields without changing event semantics.

## Implementation evidence

### API-02

The current Lodestar Builder implementation demonstrates:

- standard `block` plus `getBlockV2` is sufficient;
- one retrieval is required for each new post-Gloas block root;
- the response fork metadata is authoritative for decoding;
- self-build and later-fork bid values must pass through unchanged; and
- retrieval retry, root deduplication, and recovery policy remain separate from the proposed event fields.

### Lodestar proof of concept

Marco's proof of concept should record:

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
| Lodestar producer PoC | Pending | Add issue and PR when available |
| External-Builder example | Pending | |
| Self-build example | Pending | |
| Pre-Gloas compatibility test | Pending | |
| Post-Gloas serialization tests | Pending | |

## Cross-client review

The Beacon APIs change tracker currently records Lighthouse, Lodestar, Nimbus, Prysm, and Teku. The proposal should also ask whether other active clients, including Grandine, need to be included in the review.

Questions for each client team:

1. Can the client source both fields at the existing post-import `block` emission point?
2. Does its event serializer support fields that are required only from Gloas onward?
3. Do existing event consumers tolerate additional JSON fields?
4. Does the client agree with the self-build sentinel and quoted-decimal encoding?
5. Do `builder_index` and `block_hash` match its existing Gloas and event conventions?
6. Are additional fixtures or tests needed because the event stream is described through examples rather than a strongly connected per-topic schema?

| Client | Contact or review | Position | Implementation link | Notes |
| --- | --- | --- | --- | --- |
| Lodestar | Nico | Supports the proposed direction | PoC pending | Confirmed self-build index behavior |
| Lighthouse | Pending | Pending | | |
| Nimbus | Pending | Pending | | |
| Prysm | Pending | Pending | | |
| Teku | Pending | Pending | | |
| Grandine or other active clients | Pending | Pending | | Confirm review scope with Nico |

## Upstream patch plan

The initial Beacon APIs PR should be narrow:

1. Update the `block` description and example in `apis/eventstream/index.yaml`.
2. Add a `block EVENT updated` entry to `CHANGES.md`.
3. Link the PR to issue #599, this working draft, API-02, and the Lodestar PoC.
4. Run `redocly lint beacon-node-oapi.yaml`.
5. Open as a draft and request cross-client feedback before treating the shape as settled.

Immediately before opening the PR, recheck `ethereum/beacon-APIs:master` and open pull requests for overlapping event changes.

## Open questions

- Which cross-client channel or meeting should carry the initial review request?
- Which active clients should be named beyond the five represented in `CHANGES.md`?
- Do any clients have strict event decoders that reject additional fields?
- Does the example-based event specification require additional schema or fixture work for fork-conditional fields?
- Should the compatibility fallback be mentioned directly in the normative event description or only in the PR rationale?

## Decision log

| Date | Decision | Basis |
| --- | --- | --- |
| 2026-08-11 | Preserve `block` plus `getBlockV2` as the correct bounded fallback | API-02 implementation evidence posted to #599 |
| 2026-08-12 | Prefer extending `block` over a thin `bid_included` event or `block_v2` | Discussion with Nico and Marco |
| 2026-08-12 | Require both fields post-Gloas and use `BUILDER_INDEX_SELF_BUILD` for self-builds | Nico's clarification |
| 2026-08-13 | Track the proposal in one SPEC-01 issue and one working design draft | [LOD-48](https://linear.app/kriso/issue/LOD-48/spec-01-champion-the-gloas-block-event-extension-in-beacon-apis) |

## Completion criteria

This working draft is ready to become a Beacon APIs PR when:

- the proposed wire shape and fork rules are internally consistent;
- Marco's Lodestar PoC evidence is linked;
- the self-build and pre-Gloas examples are verified;
- Nico has completed an initial shape review; and
- the cross-client review venue and initial reviewers are identified.

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
- [Builder implementation plan](implementation-plan.md)
- [Builder Living Technical Note](living-technical-note.md)

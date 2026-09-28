# Builder bid-inclusion events

**In review:** [Beacon APIs #641](https://github.com/ethereum/beacon-APIs/pull/641) proposes extending `block` and links `bid_included` as the alternative. Nico approved the proposal on 26 September and left it open for other client approvals; cross-client agreement is still open. The PR is not draft.

A Builder needs to know when an imported beacon block includes its bid. Today it can subscribe to `block` and fetch the block to check. [Beacon APIs #599](https://github.com/ethereum/beacon-APIs/issues/599) discusses including enough identity information in an event to avoid fetching unrelated blocks.

These are two alternatives for the same change, not proposals to merge together.

## The two options

|                 | Extend `block`                                                       | Add `bid_included`                                                                |
| --------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Fields          | Add `builder_index` and `block_hash` to the existing event           | `slot`, `block_root`, `block_hash`, `builder_index`                               |
| Self-builds     | Include both fields, using `BUILDER_INDEX_SELF_BUILD`                | No event                                                                          |
| Before Gloas    | Existing event is unchanged                                          | No event                                                                          |
| Main trade-off  | Reuses an existing topic, with two required fields from Gloas onward | Leaves `block` unchanged, but adds another topic with some duplicated information |
| Proposed change | [OpenAPI patch](extend-block.patch)                                  | [OpenAPI patch](bid-included.patch)                                               |

## Shared behavior

Both notify after successful block import, including valid non-head blocks, without waiting for the execution payload envelope. Inclusion does not guarantee the block is canonical or instruct the Builder to reveal. A Builder that needs to verify the complete signed bid still fetches the block and compares it with its local record.

The dedicated event omits the full signed bid, `bid_root` and `execution_optimistic`. Missing optimistic status must not be interpreted as `false`. The existing `block` plus block-fetch path remains available when a BN does not support the new topic.

Nico considers the separate reveal-trigger suggestion independent of this PR. His Lodestar-specific guidance permits revealing on receipt because the Builder has no unbundling risk. The runtime policy remains separate from the event wire contract.

## Feedback

Which option would be easier for clients to support? Is any field or import behavior missing for the intended consumers? `block_v2` remains an alternative if clients prefer explicit event versioning.

The extended `block` patch now follows Nico's requested concise description and current-fork example. Its 22 September revision passes OpenAPI lint, bundling and example checks; hosted CI and spellcheck also pass at the new head. The alternative retains its earlier validation. Client implementations and interoperability have not been validated. [Supporting research and proposal history](REVIEW-NOTES.md).

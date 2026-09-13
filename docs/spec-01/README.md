# Builder bid-inclusion events

**Discussion draft:** [Beacon APIs #641](https://github.com/ethereum/beacon-APIs/pull/641) proposes extending `block` and links `bid_included` as the alternative. The event choice remains open.

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

## Feedback

Which option would be easier for clients to support? Is any field or import behavior missing for the intended consumers? `block_v2` remains an alternative if clients prefer explicit event versioning.

Both patches pass the repository's OpenAPI lint and bundling checks, with additional example checks. Client implementations and interoperability have not been validated. [Supporting research, validation and draft PR text](REVIEW-NOTES.md).

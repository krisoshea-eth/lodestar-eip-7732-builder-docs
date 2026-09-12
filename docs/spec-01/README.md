# SPEC-01 candidate review packet

Prepared 10 September 2026 against Beacon APIs master `ef98d512c03c8ca6b9d7cbdc45b9293ec2b24722`.

Rechecked 12 September. Master and the #638 head (`ad322f49e9141e62fca63cedb14706498d9290fc`) are unchanged, and #599 has no new public decision. API-02 #9931 is now merged. This strengthens the fallback implementation evidence but does not choose the selection-event contract. #10056's payload-attributes producer work belongs to the separate input track. Both patches still pass git apply --check. Neither candidate patch needs a wire-shape change from this check. Docs PR #30 is merged; publication to Beacon APIs remains unapproved and no proposal has been posted. Fresh lint/bundle validation is recorded below; it is not a runtime interoperability check.

These are two alternative discussion drafts, not two changes intended to merge together. No Beacon APIs PR or discussion comment has been posted from this packet. Nico is comfortable with either approach being proposed for cross-client feedback. Coordinate the publication format with Marco and get Kris's approval before posting.

## Candidate patches

- [Extend `block`](extend-block.patch) adds required `builder_index` and `block_hash` fields for Gloas and later, including self-builds. The pre-Gloas payload remains unchanged.
- [Add `bid_included`](bid-included.patch) leaves `block` unchanged and adds an external-Builder-only event with `slot`, `block_root`, `block_hash`, and `builder_index`.

Both preserve successful-import semantics, including valid non-head blocks. Neither waits for a payload envelope, changes gossip validation, guarantees canonical selection, or replaces exact comparison with the locally signed bid. Neither introduces replay, reconnect, SSE IDs, `bid_root`, or a full signed-bid payload. `block_v2` remains a possible alternative if other clients prefer it.

The 12 September research follow-up adds consumer-safety and rollout checks to the working document. Inclusion does not require revealing an untimely non-head block; omitted optimistic status is not false. An unsupported new topic can reject the whole subscription request, so retain the standard block-event fallback and do not infer capability from a quiet stream. These clarifications leave both wire patches unchanged. Lighthouse and Teku serializer paths were rechecked, without claiming runtime interoperability or agreement from either team.

Each patch changes only `apis/eventstream/index.yaml` and `CHANGES.md`. The temporary changelog link is to issue #599; replace it with the new PR number when publishing. Empty client-support columns deliberately make no implementation claim.

## Fit with upstream proposal practice

The [Beacon APIs contributing instructions](https://github.com/ethereum/beacon-APIs/blob/ef98d512c03c8ca6b9d7cbdc45b9293ec2b24722/README.md#contributing) and CI validate the OpenAPI YAML with Redocly and bundle it with swagger-cli. There is no required EIP-style design-document template. The concrete submission should therefore remain the small YAML change, examples, compatibility explanation and an honest changelog support row. This longer packet is supporting discussion material.

The 12 September review inspected the actual changes and discussion in [#587](https://github.com/ethereum/beacon-APIs/pull/587), [#590](https://github.com/ethereum/beacon-APIs/pull/590) and [#621](https://github.com/ethereum/beacon-APIs/pull/621). Those event changes ranged from one eventstream file to a wider coordinated head/duties change. Their reviews focus on exact trigger, field meaning, fork boundaries and consumers. They do not establish a universal rule that every event needs a new version, or that two alternative PRs must be opened. Keep client-support cells empty until implementations are verified.

Nico's versioned-container work in #587 supports explicit fork handling when a whole consensus object is emitted. The Lighthouse, Teku, Nico and NC discussion in #590 demonstrates why primitive-event versioning is still a cross-client design choice. Its clarification that `slot` means the head block's slot also informs the separate runtime input consumer; it does not change SPEC-01 into a head-only event.

The current [Heze API proposal #490](https://github.com/ethereum/beacon-APIs/pull/490) remains an overlap watch for eventstream edits and inclusion-list inputs. It is not an accepted source of Builder bid bits, and older hunks must not restore fields or semantics superseded by merged event changes. [#638](https://github.com/ethereum/beacon-APIs/pull/638) still owns finality-hash transport separately.

For publication, one discussion draft with the alternative linked is a reasonable low-overhead starting point. Two clearly cross-linked alternatives also match Nico's guidance if that helps the teams compare. Neither format has been approved for publication here, and neither candidate is consensus.

## Validation evidence

The unchanged base and both candidates passed Redocly 1.19.0 lint again on 12 September. Both candidates also passed fresh swagger-cli 4.0.4 bundling and `git diff --check`. Each alternative was applied in its own clean checkout at the pinned base.

Additional local checks verified the new examples' exact field sets, 32-byte hex roots/hashes, quoted uint64 values, self-build sentinel, topic names, unchanged legacy events, and preservation through bundling. The sentinel is the string `"18446744073709551615"`, never an imprecise JavaScript number.

The event API describes SSE data through examples and prose. Lint and example checks do **not** prove producer timing, self-build suppression, non-head delivery, decoder compatibility, or Heze client behavior. These still need implementation tests and client-team review. The older #9854 and #9875 PoC caveats in the [working document](../beacon-api-block-event-extension.md) remain relevant if those variants are reused.

To reproduce, use a clean Beacon APIs checkout at the pinned commit, apply exactly one patch, and run the same tools as its CI:

```sh
git apply --check /path/to/extend-block.patch
git apply /path/to/extend-block.patch
redocly lint ./beacon-node-oapi.yaml
swagger-cli bundle ./beacon-node-oapi.yaml -r -t yaml -o ./deploy/beacon-node-oapi.yaml
git diff --check
```

Use a separate clean checkout for `bid-included.patch`. Do not apply both alternatives together. Recheck master and overlapping PRs immediately before publishing. #638 changes payload-attributes inputs and remains separate from this selection-notification proposal; #490 and #585 also touch the eventstream file. #640 is a separate Gloas endpoint-version proposal.

## Proposed PR text for Candidate A

**Title:** Add Builder bid identity to the post-Gloas block event

Related to https://github.com/ethereum/beacon-APIs/issues/599.

This proposes adding `builder_index` and `block_hash` to the existing `block` event from Gloas onwards. Both fields are required after the fork, including for self-builds using `BUILDER_INDEX_SELF_BUILD`. Pre-Gloas events are unchanged.

The aim is to let a Builder discard unrelated imports without fetching each beacon block. A matching index and execution hash do not prove that every field of its signed bid matches, so consumers that need exact verification still retrieve the block.

The trigger stays successful block import, including valid non-head blocks. It does not wait for the payload envelope. An alternative is a separate lightweight `bid_included` topic with the same import semantics but no self-build events. I would like feedback on whether extending the existing topic or adding that dedicated topic is easier to support across clients.

The patch passes Redocly lint and swagger-cli bundling at the versions used by this repository. The JSON examples were checked separately. No cross-client implementation support is claimed yet.

Lodestar's consumer is https://github.com/ChainSafe/lodestar/pull/9931 and the extension PoC is https://github.com/ChainSafe/lodestar/pull/9854. The PoC still needs its self-build producer and codec behavior aligned with this required-field proposal.

> Drafted with OpenAI Codex assistance.

## Proposed PR text for Candidate B

**Title:** Add a lightweight bid_included event

Related to https://github.com/ethereum/beacon-APIs/issues/599.

This proposes a `bid_included` topic carrying `slot`, `block_root`, `block_hash`, and `builder_index`. It fires after successful import of an external-Builder block, including valid non-head blocks, without waiting for the payload envelope. It does not fire for self-builds or pre-Gloas blocks, and the existing `block` topic is unchanged.

The event lets a Builder identify a possible local selection without retrieving every block. It is not proof that the complete signed bid matches. Consumers that need that check still retrieve the block. `execution_optimistic`, `bid_root`, and the full signed bid are omitted from this candidate.

The alternative is to add the two bid-identity fields to `block`. I would like feedback on the preferred topic, whether any consumer needs optimistic status here, and whether each client can emit this at import time for valid non-head blocks.

The patch passes Redocly lint and swagger-cli bundling at the versions used by this repository. The JSON example was checked separately. No cross-client implementation support is claimed yet.

Lodestar's current fallback is https://github.com/ChainSafe/lodestar/pull/9931. https://github.com/ChainSafe/lodestar/pull/9875 is comparison evidence, not an implementation of this four-field proposal at its current head.

> Drafted with OpenAI Codex assistance.

## Publication decision

After Kris and Marco review the patches, either publish one draft with the alternative attached or publish two clearly cross-linked alternative drafts. Use #599 as the common discussion reference. Initial cross-client feedback is not a prerequisite for opening a discussion draft; it is the purpose of that draft. Keep both provisional until the actual contract is agreed.

This packet does not advance #80 or decide #638, runtime ownership, safe/finalized input delivery, custody columns, or payload-attributes emission/deduplication.

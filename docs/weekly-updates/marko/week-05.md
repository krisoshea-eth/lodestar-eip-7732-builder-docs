# EPF7 - Week 5 Update
## Presentation - Lodestar ePBS Builder
For this week Kris and I signed up to present, so a good chunk of time was dedicated to making a nice presentation and delivering it properly.

We are both very happy with how it went.

Presentation slides can be found [here](https://docs.google.com/presentation/d/1cmC3fpu652gZFTIm2_P1lIYOfC2M_w3c5qXSUZ4B6lc) and the video of the session is [here](https://youtu.be/2YlWjt7xZvg).

## Building Preparations

Kris invested very large amounts of work into building our technical documentation which is supposed to be a collection of our knowledge, plans and a tracker for all relevant happenings in the ecosystem - EIPs, issues, PRs etc.
This week we introduced a lot of things there: new entries to track, new stretch goals and a bunch of other things.

## Other work

### `head_v2` Event
I mentioned before how I started working on the `head_v2` event implementation on Lodestar.

- [feat: implement head_v2 event #9486](https://github.com/ChainSafe/lodestar/pull/9486)

It was blocked for a bit due to spec ambiguities.

Discussion with other client devs resulted in making the event specification more strict - which can be seen in this PR here:

 - [Make the second head_v2 emission on empty->full a "should" #628](https://github.com/ethereum/beacon-APIs/pull/628)

This basically enforces the emission of a `head_v2` event on a payload status change from 'empty' to 'full', and therefore enables consumers to rely on this information, which would not be the case if this emission continued to be seen as implementation specific.

I made another PR here, which is supposed to document another topic we spoke of in the thread - that the rest of the emissions, if the payload status changes again (ex. 'full' to 'empty'), can be implementation specific.

- [Add head_v2 edge-case emissions note #629](https://github.com/ethereum/beacon-APIs/pull/629)

This should not happen often anyway, and though this was an implied behavior before, I feel it deserves some attention - so why not document it in an explicit way.

### Lodestar Logger in Zig
Logger went through a new round of review, new changes were applied and now it should be mostly done:

- [feat: implement logging module #446](https://github.com/ChainSafe/lodestar-z/pull/446)

Logger currently contains only the most basic set of functionalities (there is a list of deferred features in the PR description).
I hope to work on those if time allows, but now that I am focusing on the builder I might be required to put my Zig work on hold.

## Next week
In the following week we plan to settle on a development strategy and start on some initial implementation work.
The documentation that we have should be tightened up, and early steps of our plan should be clear.
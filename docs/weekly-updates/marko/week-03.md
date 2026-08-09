# EPF7 - Week 3 Update

In the 3rd EPF week, I was mostly focused on one single thing, ePBS / EIP-7732. By the end of the second week, it was clear that this is a way to go, for myself and my collaborator Kris. I have managed to dig into movements related to the ePBS, even a bit in the fields that do not directly affect the builder.

I focused on deepening my knowledge about pre-ePBS client workflow, changes that ePBS brings, their functional value, decentralization improvements and the effects it has on MEV (both in context of its strategy and architecture).

## Scaffolding

Both Kris and I have independently engaged in the scaffolding inspection, concluding that everything that holds the builder in place is already there - only the builder itself is missing.

As not all things on ePBS are finalized, we will need to track the movement on it on github, discord and on ACD calls. Smaller changes are expected to happen, even now that EIP-8282 landed, there are changes that need to be made on the scaffolding (mostly cleanup though).

Based on where things currently stand, I do not expect large disturbances in the builder development, but either way monitoring the movements is mandatory.

## Proposal Preparation

Currently, Kris is leading the documentation writing and preparing the initial proposal draft. We still have extra time that we will use to polish the proposal and we hope to come to a solid merging strategy and make a strategic work distribution among us - made in a way that we can review each other's code easily, and have everything readable for mentors.

So, on week 4 we plan to work on the following:

 - Proposal design
 - Extended documentation (lead by Kris)
 - Presentation
 - Work distribution strategy
 - Merging strategy
 - Track active discussions (continuous task)

And we would like to figure all of these out before we start the development.

## Potential Bonus Point

During past week we considered working on FOCIL as well - but this idea won't be realized as Lodestar already has a 99% ready implementation. They need to make reviews and do some testing but otherwise it is ready - though same as for builder some modifications are definitely to be expected.

This is a good thing, and it opens up a new direction for us, that just leans even better on currently planned work - and that is preparing the builder for Heze fork.

In order to make this preparation happen, the FOCIL PR needs to land first, which we assume will happen in the following weeks of the cohort:

https://github.com/ChainSafe/lodestar/pull/7342

We will keep this in mind, and would be glad to work on the Heze adaptation if circumstances allow.
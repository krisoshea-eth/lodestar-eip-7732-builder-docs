# EPF 7 - Week 7 Update

I spent this week on further development of the ePBS builder on Lodestar.

Kris and I received feedback on our plan, and Kris incorporated new comments from Nico while I was working on development of what is already settled.

The second `head_v2` spec change PR also landed which closes out the `head_v2` spec changes.

I worked on the Gloas ASCII art banner for Lodestar.

In the following paragraphs I will expand on each topic.

## Kris's plan

Since the start, the plan has covered the implementation and dependencies in great detail. This week we were looking for feedback, which we received and addressed.

PR: https://github.com/krisoshea-eth/lodestar-eip-7732-builder-docs/pull/2

It is very exhaustive and very helpful for future development. Though we asked mentors to review only the pieces of it which are relevant for them, the other pieces are mostly for our personal use/documentation.

## `head_v2` spec changes

I wrote before about changes that were to be made to the `head_v2` event spec. The second PR was merged this week, which makes it 2/2.

https://github.com/ethereum/beacon-APIs/commit/3904964b86ade743127838d4e19f504fbcbc3cfa

## Builder development

Here is the builder code written so far — made into a PR that is already merged into Lodestar's `unstable` (main) branch.

PR: [feat: builder initial setup #9758](https://github.com/ChainSafe/lodestar/pull/9758)

Here's how this week contributed to it:

I started this week with a cleanup. I think that after each iteration of work, it is necessary to have a review and a cleanup. No matter how small the work is, there are always some open ends left.

Work continued on the builder's initialization flow. Once communication with the BN was established, I continued with the config checks, which ensure that both the BN and the builder are properly aligned.

In this flow I found similarities with Lodestar's validator. Based on the findings, we decided to move some pieces of code included in the `@lodestar/validator` package to dependency-focused packages, such as `@lodestar/config` and `@lodestar/state-transition`. Here are some details:
- `assertEqualParams` is a function previously present in the initialization flow of the validator, which can be identical for the builder. Therefore we moved it to the most logical place based on its own dependencies: `@lodestar/config`. PR: https://github.com/ChainSafe/lodestar/pull/9725
- `waitForGenesis` is a function that is also needed both inside the validator's and the builder's initialization flow. This one is pretty small, but moving it would add new dependencies to the common packages, so we decided to keep it separate and have it identical inside the builder and the validator. Inside of it I stumbled upon an old TODO, asking to handle the BN throwing 404 when asked for genesis. I implemented the branching here: https://github.com/markolazic01/lodestar/blob/6fc2602470b37a6ac0f2a356ee2d84c106f23264/packages/builder/src/genesis.ts#L13
and then Lodekeeper (the Lodestar team's main AI companion) applied the same fix to the validator: https://github.com/ChainSafe/lodestar/pull/9726
- `Clock` was also taken care of, as a commonly needed module, and moved inside the `state-transition` package: https://github.com/ChainSafe/lodestar/pull/9733

## Gloas Polar Bear Banner

I've had a unique chance to work on the Gloas banner for Lodestar.

```
                               __           .    .- '%%%░░░░░
                              /  '-.       ,    '    '%%%░░░░
                      _.--""""--.._;          . * .-' '%%%%░░
      \ /          _.""    .'       '-._         '  .   '%%%%
       L         .";      ;           ; '-.     .   / ' * '""
      Ø         / /     .'      '    ;     '.     '     ;  |
     D         / ;     e     ' ) ( ' ;       \     .  .'   ,:
      E       ; :      P      ( ' )  :     '-.\          '  '
       S      ; ;      B       ).(    '.      ';      '   '
        T     : :      S      (/:\)     \      :
       A      : \      ':     / : \      \   '.;
      R       \ \      ';     \\ //       ;    ;
     / \       \ : .'   \      \|/        |   /
                '>'      :      '       '.;   |
                 / ,'    /             '.  ;/ _\
                ;,'     ;    '.        '.;    '-.
               ;' .'   :    '. '.       / \, \ \ \
 \             :,'     :      '. '. \  ; ::\_/_/_/::
 ~|         .-=:.-"   -,-   "-.,=-.\ ;.; :::; ; ;::
 ~|\        |('.'      :       .')| \: '.  :::::::
 ~|:\        \\/       :       \//   ;   \              _____
 ~~\:\     ■  :       .:.       :  _/     ;             \hjw:
 ~~~\/     |  ;                 ;  ;      |              \"""
 ~~.'      ■   :    _     _    ;  /       ;              /|~~
 ~/        |    '. \';   ;'/ .' .'       /              /:|~~
 |         ■      !  :   :  !_.'        /           .--::/~~~
 |\___     |       '.:   :.'/\         ;      ____.':|:|/~~~~
 \:::|\    ■         \'_'/  | :       :   ___/|:::|:'""" ~~~~
 ~'""|:\   |         ;"^"   | !       :__/|::|/"""" ~~~~~~~~~
 ~~~~\::\_____     .-'      | ;       |::|/"" ~~~~~~~~~~~~~~~
 ~~~~~\:|::::|\   / / /    / /       /"""~~~~~~~~~~~~~~~~~~~~
 ~~~~~~\|::::|:'--\_\_\__.'-|       ;~~~~~~~~~~~~~~~~~~~~~~~~
 ~~~~~~~ """" \::::::::::::/      .'~~~~~~~~~~~~~<><~~~~~~~~~
 ~~~~~~~~~~~~~~""""'"""".-'      /~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~~~~~~~__,------.__.--/ , ,  , |/--._~~~~~~~~~~~~~~~~~~~~~~~
 ~~~~~~/   |     .    :\|  |  |v'     \__~~~~~~~~~~~~~~~~~~~~
 ~~~~~|\   ■    /:\   :::v-;v-'::        \_~~~~~~~~~~~~~~~~~~
 ~~~~~\:\      / : \   :::::::::           \~~~~~~~~~~~~~~~~~
 ~~~~~ \|'-.  /  :  \                      /|~~~~~~~~~~~~~~~~
 ~~~~~~~~': \ \'. ,'/  ___            ____/:/~~~~~~~~~<><~~~~
 ~~~~~~~~~~\|: \ ' /  /|:|\          /|:::|/~~~~~~~~~~~~~~~~~
 ~~~~~~~~~~~|:  \:/  //"""\\        /:/"""~~~~~~~~~~~~~~~~~~~
 ~~~><>~~~~~|\   '  //~~~~~\\______/:/~~~~~~~~~~~~~~~~~~~~~~~
 ~~~~~~~~~~~'|\____//~~~~~~~\|GLOAS|/~~~~~~~~<><~~~~~~~~~~~~~
 ~~~~~~~~~~~~\|:::|/~~~~~~~~~'"""""'~~~~~~~~~~~~~~~~~~~~~~~~~
 ~~~~~~~~~~~~~'"""'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~eth
```

PR: https://github.com/ChainSafe/lodestar/pull/9742

It is a remix of the work of an artist named `hjw` (Hayley Wakenshaw), whose signature is visible in the artwork.
Original art can be found here: https://asciiart.website/art/7281
All changes were authored manually.

I also found a nice ASCII art guide, which was very helpful when I was making the banner:
https://www.ludd.ltu.se/~vk/pics/ascii/junkyard/techstuff/tutorials/Hayley_Wakenshaw.html

## What's next

Finishing the builder identity with readiness check, followed by the metrics and unit tests.

Continuing the builder work by setting up the testing environment using Kurtosis.

These two tasks are named `API-01` and `ENV-01` in our plan.
Realistically `API-01` will get done in week 8, but `ENV-01` won't.

They both belong to our `Epic A` taskboard which can be found here: [`Epic-A`](https://github.com/krisoshea-eth/lodestar-eip-7732-builder-docs/blob/b57d3e62b02258d2684b4d8cf9b5ccd7a026d1ed/docs/implementation-plan.md#epic-a--foundation-and-source-bn-access)
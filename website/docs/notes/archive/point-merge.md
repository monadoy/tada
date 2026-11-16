# Point merge (BGY)

!!! tada-archive "Research note"
    Part of the development diary of the single-agent work, kept for reference. Model names such as
    `1_38` are internal run ids (the published TMB and PMS policies are `1_76` and `1_77`). File paths and
    commands refer to the private development repository, and numbers were measured with the evaluation
    setup of the time. The published design is under [How it works](../../how/index.md); the final results are under
    [Results](../../results.md).

!!! abstract "Summary"
    Point merge at Bergamo (`VALIDATION_USE_CASE_2`) was the alternative scenario to the MXP
    trombone. The first single-agent run on it (`1_24_pms`) stayed near the do-nothing floor; the later
    `1_30_pms` does better but remains far below MXP.
    Its known blocker was observation saturation, the same problem log scaling later fixed for
    MXP. Point merge was also solved by stitching two 10-aircraft agents; the windowed agent is the
    version of that idea that needs no hand-off rule. Every current run is on MXP.

## What was tried

- **`1_24_pms`** ([card](../models/1_24_pms.md)): the PMS campaign (commit `f9ecc24`) added the BGY
  scenario, a sixth success tier and an analysis harness. The best checkpoint stayed near the
  do-nothing floor: 0 of 100 seeds solved. Its renders are on its card.
- **`1_30_pms`** ([card](../models/1_30_pms.md)): launched 24 Aug; not documented beyond its run
  name. Scored on 28 Sep on the point-merge scenario it trained on, it is the best point-merge
  agent so far (the July runs solved 0–1 of 100), but still far below MXP, and it loses
  separation in over a quarter of episodes. Its tier does not compare with the July runs': the
  ladder changed between them.
- On 24 Sep the code's default difficulty was switched to point merge (commit `bfd1355`). The
  windowed env sets MXP explicitly in its own config, so no windowed run is affected.

## Why it was hard

Point merge's observations were the worst saturated: `time_to_target` was pinned at ±1 in 71.4% of
samples. Log scaling brought that to 15.1% ([10-aircraft tests](ten-aircraft-tests.md)). No
point-merge run was trained after that fix and scored, so whether it was the whole blocker is
untested.

## Stitching two agents

Point merge was solved by stitching two 10-aircraft agents, up to 99% on the validation seeds (as
reported on the old windowed page; the underlying files are not in this repo's registry). On the
trombone the halves overlap in time, because flight 11 spawns before flight 10 lands, so stitching
there needs a hand-off rule. The [windowed env](../../how/environments.md#windowed) is the version that
needs none: it has to beat roughly 0.55² ≈ 0.30 all-on-time, what two independent 10-flight halves
would score.

---
icon: material/book-alphabet
---

# Glossary

!!! abstract "Summary"
    The terms of the paper and of the public code, each defined once. Definitions follow the
    paper; where a term is a name in the code, the name is given. Terms that appear only in the
    development diary are collected in the [last section](#research-notes).

## Arrival management { #arrival-management }

**AMAN.** Arrival Manager: the tool that gives every arrival a position in the landing order (the
*AMAN sequence*) and a *target landing time*. The agents' task is to make the traffic land in that
order and at those times.

**ATCO.** Air traffic control officer; the approach controller whose clearances the agents
suggest.

**TMA.** Terminal manoeuvring area: the airspace around the airport in which the arrivals are
simulated and controlled.

**TTL, TTG.** Time-to-lose and time-to-gain: the adjustment the AMAN requires of a flight, the
difference between its target landing time and its originally estimated landing time. A flight
with a TTL must be delayed; a flight with a TTG must arrive earlier.

**Time deviation.** The difference between a flight's AMAN target landing time and its actual
landing time. The *predicted* time deviation uses the landing time forecast by the no-operation
rollout instead; the *initial* time deviation is that forecast at the start of the episode.

**Clearance.** One instruction to one aircraft: a speed change, a turn off the route with an
automatic rejoin, skipping waypoints, extending or retracting the trombone, a vector to the ILS,
or a direct to the merge point. "Do nothing" is also a choice the policy can make; an *active*
clearance is any other.

**TMB.** The trombone procedure at Milan Malpensa: a downwind leg that can be extended or
retracted, one level at a time, to change the length of the path and with it the arrival time.

**PMS.** The point merge system at Milan Bergamo: aircraft fly along a *sequencing leg* (an arc)
until they are cleared direct to the *merge point*; the longer they stay on the arc, the later
they land.

**LIMC, LIME.** The ICAO codes of Milan Malpensa (trombone) and Milan Bergamo (point merge). The
repository's file names use the IATA codes instead, `mxp` and `bgy`.

**AMAN route, full route.** The AMAN route is the shortest version of the delay-absorption
structure, which an aircraft flies if it receives no clearance; the full route is the complete
trombone or sequencing leg. See [the problem](how/problem.md).

## Separation { #separation }

**Infringement.** Two aircraft closer than 5 NM horizontally and 1000 ft vertically at the same
time. Each pair of aircraft counts at most once per scenario.

**Conflict, loss of separation (LoS).** The severe case of an infringement: two aircraft closer
than 3 NM horizontally and 500 ft vertically at the same time. It ends the episode. See
[Separation rules](how/separation.md).

## Simulation { #simulation }

**Live world, predicted world.** The live world is the simulation in which clearances take effect
and time advances. The predicted world is a copy of it, used to look ahead without changing the
live world.

**No-operation rollout.** The predicted world simulated forward with no new clearances until the
aircraft have landed or a horizon is reached; also called the do-nothing forecast. It yields each
flight's predicted landing time and every predicted infringement, and it is the source of the
forecast features in the observation and of the reward shaping.

**Decision interval.** The 45 s of simulated time between two decisions of the agent; also called
a step.

**Scenario, seed.** A scenario is one set of arrivals to one airport with their routes, spawn
times and AMAN targets. It is generated from an integer seed, and the same seed always gives the
same scenario.

**Episode.** One scenario flown from start to end. It ends when all aircraft have landed, when a
conflict occurs, when an aircraft leaves the airspace, or at a step limit.

**Use case.** The code's name for the procedure of a scenario: use case 1 is the trombone at
Milan Malpensa, use case 2 is point merge at Milan Bergamo (`--use-case`).

## Single-agent design { #single-agent }

**Temporal window.** The fixed set of slots through which the single-agent policy sees the
traffic: the next 10 flights due to land in the AMAN sequence. When a flight lands or is released
its slot is freed and the next flight in the queue enters. In the code this is the *windowed*
environment (`--env windowed`). See [Episodes and temporal windowing](how/environments.md).

**Under control.** A flight that has spawned and is inside the TMA, so that it can receive a
clearance. A flight can occupy a slot of the window before it is under control; it is then
visible but cannot be selected.

**Release.** Handing a flight off before it lands, which frees its slot in the window. In the
public code a flight at the front of the queue is released once it is under control, forecast to
land within 30 s of its target and in no forecast conflict (`--release-locked`).

**Reselection.** The policy's option to select a second aircraft and clearance within the same
decision interval, after seeing the forecast effect of the first. The policy asks for it with a
binary *Again* flag; the intermediate transition takes no simulated time. See
[Actions and reselection](how/actions.md#reselection).

**Action mask.** The set of choices that are legal at a decision, computed by the environment from
aircraft limits, waypoint constraints and route geometry. Masked aircraft and clearances cannot be
sampled.

**Action set.** The list of discrete clearances available to a policy. The public code has two
sets of 15, `v2` for the trombone and `v2pms` for point merge, chosen with `TADA_ACTION_SET`.

**Airport mask.** An optional fixed mask that blocks some clearances of an action set for one
procedure, chosen with `TADA_AIRPORT_MASK`. The published TMB policy uses the mask named
`procedure`.

**Sequence observations.** Four features per aircraft that describe how the forecast landing order
and landing gaps differ from the AMAN sequence, enabled with `TADA_SEQUENCE_OBS=1`. See
[Observations](how/observations.md).

**Autoregressive policy.** A policy that makes its decision in stages, each conditioned on the
previous one: first the aircraft, then the clearance for that aircraft, then the Again flag. See
[Policy network](how/policy.md).

**Landing bracket.** The band of absolute time deviation in which a flight lands, and the value
the reward gives for it: 4 within 30 s, 3 within 60 s, 1 within 120 s, 0 within 300 s, −1.5 within
600 s and −3 beyond. See [Objective and reward](how/objective.md).

**Potential-based shaping.** The part of the reward that pays for the change in a potential
computed from the no-operation rollout. It rewards an action that improves the forecast and
penalises one that worsens it.

**PPO.** Proximal Policy Optimisation, the on-policy actor-critic algorithm used to train every
policy in the paper.

**Curriculum.** A training schedule that changes the traffic during a run. The paper's
single-agent curriculum uses 10 flights per scenario for the first 2.5 million transitions and 20
afterwards (`--curriculum`).

**Warm start, critic warm-up.** A warm start begins training from the weights of an existing
policy (`--init-weights`). A critic warm-up then trains only the value head for the first
transitions, so that it adapts to the new reward before its estimates move the policy.

## Evaluation { #evaluation }

**Evaluation seeds.** The 100 scenario seeds of the paper's evaluation, in
`single-agent/evaluation/seeds.txt`. Training does not draw them, but they were used to select the
published models.

**Attempt.** One episode on a given scenario. Attempt 0 is *deterministic*: the policy takes its
most probable legal action at every decision. The 20 further attempts are *stochastic*: actions
are sampled from the policy's distribution.

**Solved.** An episode in which every flight lands within 60 s of its target landing time and no
conflict occurs.

**Hard-solved.** The same with 30 s in place of 60 s. The public evaluation tools report it; the
paper does not use it.

**On time.** A flight is on time when it lands within 60 s of its target. The on-time share of an
episode counts all its flights, so a flight that never lands counts as not on time.

**Rollout search.** Search at inference time that uses the simulator and the trained policy: at
each planning point several candidate continuations are rolled out to the end of the episode, and
the first actions of the best one are executed. See [Rollout search](how/search.md).

**Candidate, incumbent plan.** A candidate is one continuation considered by the rollout search,
produced by the deterministic or the sampled policy. The incumbent plan is the remainder of the
best candidate from the previous planning point, which competes again at the next one.

**K, M.** The two parameters of the rollout search: K candidates per planning point, and M actions
executed between planning points. The single-agent evaluation uses K = 8 and M = 10.

## Multi-agent approach { #multi-agent }

**Agent.** In the multi-agent approach every arriving aircraft is an agent, and the policy selects
a clearance for one aircraft at a time from an observation centred on that aircraft. See
[the multi-agent approach](how/multi-agent.md).

**Parameter sharing.** All agents use one policy network with the same weights.

**Sector group.** One of three groups of control sectors, each taken to be the area handled by one
controller. The multi-agent approach issues at most one clearance per sector group in each
decision interval, so up to three per interval.

**Selection rule.** The fixed rule by which the multi-agent approach chooses the aircraft to act
in each sector group, from a priority score based on forecast infringements and time deviation.
In the single-agent approach the policy makes this choice itself.

**Auto-solver.** An algorithm run at the start of a multi-agent episode, before the policy first
acts, that chooses initial extensions of the trombone or the sequencing leg. It absorbs large TTL
values, so that the policy handles separation and the remaining timing error.

## Terms used in the research notes { #research-notes }

The [Research notes](notes/index.md) are the development diary of the single-agent work. They use
the following terms in addition to those above.

**Run.** One training run, identified in the notes by a number. The
[leaderboard](notes/models/index.md) lists them.

**10-aircraft env.** The first environment: one scenario of up to 10 arrivals, all visible at
once, with no window.

**Windowed env.** The environment with the temporal window, defined above.

**Release MDP.** The windowed environment with release switched on. The published models use it.

**Stitched stream (2×20).** Two independently generated 20-flight scenarios joined with a random
gap of 120 to 900 s: a test on a longer stream (`--stitch-segments`, `--segments`).

**Validation seeds.** The fixed 100 scenario seeds on which development runs were scored,
`single-agent/config/eval_seeds.txt` in the public code. Training never draws them.

**Battery.** The standard set of evaluations a run received: deterministic on 20-flight streams,
stitched 2×20, several attempts, and lookahead. See [the evaluation battery](notes/evaluation.md).

**Flights on time.** The on-time share defined above, averaged over the seeds.

**Separation lost.** The number of seeds, out of 100, whose episode ended in a loss of separation.

**pass@N, pass@1.** pass@N is the number of seeds solved by at least one of N attempts, the
deterministic one and N − 1 sampled ones. pass@1 is the share of single sampled attempts that
solve their seed.

**Safety-bound, precision-bound.** A seed that no attempt solves is safety-bound if every attempt
loses separation, and precision-bound if some attempt is safe but leaves a flight outside 60 s.

**Lookahead.** Critic-guided search over one step: each of the policy's few most probable actions
is tried for one step on a copy of the simulation and scored by its reward plus the critic's value
(`analysis/lookahead.py`). It is not the rollout search of the paper. See
[the finding](notes/findings/lookahead.md).

**Clearances per stream.** Active clearances issued in one stream of flights.

**AMAN swaps.** Pairs of flights that land in the opposite order to the AMAN sequence.

**Champion.** The best run at a given time under the rule used on the leaderboard.

**Paired test.** Two models compared seed by seed on the same scenarios, with McNemar's test for
solved and lost counts and the standard error of the per-seed difference for on-time shares.

**Success, tier.** Metrics of the 10-aircraft env. The tiers form a graduated ladder from T1 to
T5, and success is T5: every aircraft landed within 60 s and no loss of separation. See
[the 10-aircraft reward](notes/archive/ten-aircraft-reward.md).

**Clean-subset success.** Success among the episodes that did not lose separation.

**Worst-aircraft deviation.** Per episode, the largest landing deviation of any aircraft,
averaged over the seeds.

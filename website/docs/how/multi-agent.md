---
icon: material/account-group-outline
---

# Multi-agent approach

!!! abstract "Summary"
    Every arriving aircraft is an agent, and all agents share one recurrent policy that looks at the
    traffic around a single aircraft and chooses a clearance for that aircraft alone. A rule, not the
    policy, selects which aircraft act: up to three per 45 s decision, one per sector group. An algorithmic
    auto-solver sets initial route extensions before the policy takes control, and the reward makes
    strategic clearances cheaper than tactical ones. This page summarises the paper's section on the
    multi-agent solution; the implementation and its guides are in
    [`multi_agent/`](https://github.com/monadoy/tada/blob/main/multi_agent/README.md).

## Design aims

Several choices follow from a real-time experiment with controllers and their feedback:

- favour **strategic** clearances, which can be declared early and programmed by the crew, over
  **tactical** ones given near the point of execution;
- keep controller workload low: few clearances, none that need constant attention and adjustment;
- discourage clearances that interfere with the planned descent, such as speed increases.

Two mechanisms implement these aims: an **auto-solver** that is run at the start of an episode, and
**different costs for different clearances** during training.

## The auto-solver

Lengthening the trombone or the PMS sequencing leg has a predictable effect on the arrival time, because
each level adds a known path length. Before the policy is first queried, an algorithmic auto-solver
selects initial route extensions that absorb most of a large time-to-lose. The policy then does not have
to issue many near-identical clearances and can concentrate on separation and on the remaining timing.

## Who acts: the selection rule

Each candidate aircraft gets a priority score that combines the severity of its worst predicted
infringement within the next six decision intervals, its normalised absolute predicted deviation, and a
small preference for early aircraft in conflict (delaying such an aircraft helps both the infringement and
the deviation). In each of the three sector groups, which correspond to the area handled by one
controller, the highest-scoring candidate is selected.

- An aircraft whose predicted deviation is below 30 s is **locked out** of selection unless it is in a
  predicted infringement.
- After acting, or after choosing to do nothing when other clearances were available, an aircraft is
  suppressed for one step, unless its score exceeds the best unsuppressed candidate's by a margin, so an
  urgent conflict is never postponed.

The same rule is used in training and at inference.

## Observation

The observation is ego-centric and contains no absolute position.

| Component | Content |
|---|---|
| Own state (9 scalars) | ground and vertical speed, heading (sine, cosine), time to target, predicted deviation, under control, time since the last clearance, whether the forecast landing time is known |
| Remaining route | up to 20 waypoints, 8 features each, relative to the aircraft |
| Neighbours | the five most relevant other aircraft, 16 features each in the aircraft's body frame: relative position, velocity and heading, closing rate, time and distance of closest approach, predicted conflict severity |
| Global context (critic only, 12 features) | fractions of active and actionable aircraft, conflict severity statistics, deviation statistics, elapsed fraction of the episode |

Neighbours are ranked by risk: aircraft with a severe predicted conflict towards the observed aircraft
first, then aircraft currently within 5 NM and 1000 ft, then converging aircraft, then the rest. There is
no action history: the time since the last clearance and the recurrent memory of the network take its
place.

## Clearances and their costs

The policy chooses among 12 clearances. Each carries a cost multiplier in the action term of the reward,
so that using the delay-absorbing structure is the cheapest way to lose time.

| Clearance | Actions | Cost multiplier |
|---|---|---|
| Do nothing | 1 | 0 |
| Lengthen trombone or sequencing leg by one level | 1 | 0.01 |
| Shorten trombone or sequencing leg by one level | 1 | 0.15 |
| Speed reduction (20, 40 kt) | 2 | 0.7 |
| Vector to ILS / direct to merge point | 1 | 1.0 |
| Skip one to four waypoints | 4 | 1.5 |
| Speed increase (10 kt) | 1 | 1.5 |
| Vector left or right (40°, 15 NM) | 2 | 1.5 |

Feasibility masking is as described on [How it works](index.md#action-masking); in addition, vectoring
turns are not allowed inside the central corridor of the trombone or inside the PMS arc.

## Reward

One team reward is computed per step as the sum of four terms, and then divided between the aircraft:

- **Timing.** The reduction, from one step to the next, of each aircraft's predicted deviation,
  normalised by the mean deviation when the policy takes control and capped so that one aircraft cannot
  dominate.
- **Conflict.** The reduction of the forecast's conflict level, in which shallow incursions into the
  5 NM / 1000 ft band are suppressed and imminent events weigh more than distant ones. Its scale is larger
  than the timing term's.
- **Actions.** The cost multiplier of every issued clearance, plus a damping penalty for a route clearance
  soon after a route clearance, or a speed clearance soon after a speed clearance, which discourages
  oscillation.
- **Terminal.** A bonus for a successful episode, larger when aircraft land well inside 30 s; a smaller
  term for a safe but late sequence; a penalty for a loss of separation or an airspace exit.

As in the single-agent reward, the timing and conflict terms pay for the *change* in the no-operation
forecast, so doing nothing in a stable situation earns nothing. 8% of each step reward goes to all active
aircraft and 92% to the aircraft selected in that step.

## Network and training

The shared actor-critic network has about 0.8 million parameters. The aircraft state is encoded by a small
perceptron and the route by a one-dimensional convolution with masked pooling; the neighbours enter
through four-head cross-attention with the aircraft's own embedding as the query; a gated recurrent unit
with 192 hidden units carries context across the successive decisions of one aircraft. The value head
alone sees the global context.

Training uses PPO with Ray RLlib: one learner, twelve environment runners, batches of complete episodes.
Each policy comes from a single run divided into phases, each of which restores its parent checkpoint and
changes one setting. The Malpensa run starts from random weights; the Bergamo run starts from an average
of Malpensa checkpoints. Training grades success at 30 s and evaluation at 60 s. Late checkpoints are
averaged parameter by parameter, and checkpoints were chosen on the evaluation scenarios.

For setup, evaluation, training and serving, follow the
[multi-agent guide](https://github.com/monadoy/tada/blob/main/multi_agent/README.md).

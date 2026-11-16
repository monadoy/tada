---
icon: material/school-outline
---

# Train a policy

!!! abstract "Summary"
    `single-agent/main_jax.py` trains a policy with PPO and writes Stable-Baselines3 checkpoints
    that the [evaluation tools](evaluate.md) load directly. The procedure is chosen by the action
    set and the use case; the reward, the traffic curriculum, the seeds and the optimiser are
    command-line options. The paper's curriculum of 10 flights for the first 2.5 million
    transitions and 20 afterwards is one `--curriculum` argument. A run is stored under
    `experiments/` with its settings, so a trained model can be scored without further
    configuration.

Complete the [setup](index.md#setup) first. For training on a GPU, install the unchanged
requirements file as described there. All commands are run from `single-agent/`.

## A first run { #first-run }

Training uses the same [environment variables](evaluate.md#environment) as evaluation:

```sh
export TADA_GENERATOR=procedure
export TADA_SEQUENCE_OBS=1 TADA_MAX_PICKS=2 TADA_MASK_FRAME_FIX=1
```

Choose the device before starting Python: `export CUDA_VISIBLE_DEVICES=` (empty) trains on the
CPU, and leaving the variable unset or naming a device lets JAX use the GPU.

The repository's guide gives a short example for the trombone at Milan Malpensa:

```sh
TADA_ACTION_SET=v2 TADA_AIRPORT_MASK=procedure \
  python main_jax.py --env windowed --reward-mode outcome_pbrs \
  --use-case 1 --flights 20 --seed 42 \
  --train-seed-pool config/training_seeds/training_seeds.txt \
  --n-envs 4 --total-timesteps 1000000 --run-suffix mxp
```

and the same for point merge at Milan Bergamo, with the other action set, no airport mask and use
case 2:

```sh
TADA_ACTION_SET=v2pms TADA_AIRPORT_MASK= \
  python main_jax.py --env windowed --reward-mode outcome_pbrs \
  --use-case 2 --flights 20 --seed 42 \
  --train-seed-pool config/training_seeds/training_seeds.txt \
  --n-envs 4 --total-timesteps 1000000 --run-suffix pms
```

With four workers and one million transitions this is a quick example that the pipeline works, not
the paper's training budget. It also uses the default reward settings, which differ from those of
the published models; see [below](#published-settings).

## What a run does { #loop }

`--n-envs` worker processes each run one [windowed environment](../how/environments.md#windowed).
Together they collect a rollout of 4096 transitions, so `--n-envs` must divide 4096. The learner
then updates the policy on that rollout, and the cycle repeats until `--total-timesteps`
transitions have been collected.

These PPO settings are fixed in `main_jax.py` and are the ones listed in the paper:

| Setting | Value |
|---|---|
| Rollout buffer | 4096 transitions, shared by all workers |
| Minibatch size | 256 |
| Optimisation epochs | 5 |
| Clip range | 0.2 |
| Discount γ | 0.998 (1 for a zero-time [reselection](../how/actions.md#reselection) transition) |
| GAE λ | 0.95 |
| Maximum gradient norm | 1.5 |
| Normalisation | rewards yes, observations no |

The learning rate rises linearly from zero to `--lr-max` over the first `--warmup-frac` of
training and then follows a half cosine down to `--final-lr`.

## Options { #options }

`python main_jax.py --help` prints the full list. The options below are grouped by purpose; where
no default is shown, the option is off or unset.

**Procedure and traffic**

| Option | Default | Meaning |
|---|---|---|
| `--env` | `windowed` | `windowed` is the published design. `default` is an earlier environment without the temporal window. |
| `--use-case` | 1 | `1` is the trombone at Milan Malpensa, `2` is point merge at Milan Bergamo. Combine it with the matching `TADA_ACTION_SET`. |
| `--flights` | 20 | Arrivals per scenario. |
| `--curriculum` | | Traffic stages within one run; see [the curriculum](#curriculum). |
| `--seed` | 0 | Seeds the initial weights and the training scenarios; see [seeds](#seeds). |
| `--train-seed-pool` | | Draw training scenarios from a file of seeds instead of at random. |
| `--train-max-early-s` | | Redraw a training scenario while the do-nothing forecast has a flight landing more than this many seconds early. |
| `--stitch-segments`, `--stitch-gap` | 1 segment; gap 120 to 900 s | Join several generated scenarios into one longer stream, separated by a random gap. Not used for the published models. |

**Reward and environment**

| Option | Default | Meaning |
|---|---|---|
| `--reward-mode` | `legacy` | `outcome_pbrs` is the reward of the paper: landing brackets, a cost per clearance, a terminal penalty and potential-based shaping ([Objective](../how/objective.md)). It is required when `TADA_MAX_PICKS` is above 1. |
| `--hard-bracket` | | Adds the top landing bracket: 4 for a landing within 30 s. The terminal penalty rises from 90 to 100 with it. |
| `--release-locked` | | Releases flights from the front of the window once they are locked: under control, forecast to land within `--release-dev-s` of the target, and in no forecast conflict. |
| `--release-dev-s` | 30 | The threshold for `--release-locked`, in seconds. |
| `--pay-at-release` | | Pays a flight's bracket value when it is released, from its forecast deviation, and corrects it at touchdown. Needs `--release-locked`. |
| `--flat-deviation` | | The deviation potential counts every flight whose landing the forecast resolves at full weight. |
| `--pbrs-flat` | | The sequence and conflict potentials without their time ramps. |
| `--violation-penalty` | | Overrides the terminal penalty. |

**Optimiser**

| Option | Default | Meaning |
|---|---|---|
| `--total-timesteps` | 5,000,000 | Transitions to collect. |
| `--n-envs` | 16 | Worker processes. Must divide 4096. |
| `--lr-max`, `--final-lr` | 3e-4, 3e-5 | Peak and final learning rate. |
| `--warmup-frac` | 0.08 | Share of training used for the linear warm-up. |
| `--ent-coef` | 0.01 | Entropy coefficient. |
| `--vf-coef` | 0.25 | Value-loss coefficient. |
| `--target-kl` | 0.05 | Updates on a rollout stop early when the approximate KL divergence reaches this value. |

**Run management**

| Option | Default | Meaning |
|---|---|---|
| `--run-suffix` | | Text appended to the run directory's name. |
| `--save-freq` | 25,000 | Transitions between checkpoints. |
| `--init-weights`, `--critic-warmup-steps`, `--critic-warmup-lr` | | [Warm starts](#warm-start). |

## The settings of the published models { #published-settings }

Each published bundle records its environment settings in `run_meta.json`. They correspond to
these options, for both procedures:

```text
--env windowed --reward-mode outcome_pbrs --flights 20
--hard-bracket --release-locked --release-dev-s 30 --pay-at-release --flat-deviation
```

with `TADA_SEQUENCE_OBS=1`, `TADA_MAX_PICKS=2` and `TADA_MASK_FRAME_FIX=1`; action set `v2` with
the `procedure` airport mask for the trombone, and `v2pms` with no mask and `--use-case 2` for
point merge. The reward given in the paper, with its top bracket at 30 s and its penalty of 100,
is the one selected by `--hard-bracket`.

## The curriculum { #curriculum }

The paper trains for ten million transitions with 32 parallel environments: 10 flights per
scenario for the first 2.5 million transitions, then 20. The short streams make credit assignment
easier while the policy learns what the clearances do; the longer ones make it learn how flights
replace one another in the window.

`--curriculum` expresses this directly. Its value is a comma-separated list of stages, each
written `flights:segments:until_step`, where `segments` is the number of stitched scenarios
(1 for a single scenario) and `until_step` is the transition count at which the stage ends:

```sh
TADA_ACTION_SET=v2 TADA_AIRPORT_MASK=procedure \
  python main_jax.py --env windowed --reward-mode outcome_pbrs \
  --hard-bracket --release-locked --pay-at-release --flat-deviation \
  --use-case 1 --seed 42 \
  --curriculum "10:1:2500000,20:1:10000000" \
  --train-seed-pool config/training_seeds/training_seeds.txt \
  --n-envs 32 --total-timesteps 10000000 --run-suffix mxp
```

For point merge, change the action set, the mask and the use case as in the first example.

This command combines the schedule described in the paper with the settings recorded in the
bundles. The bundles do not record the seed, the seed pool or the schedule of the runs that
produced them, so it is the documented recipe, not a guarantee of reproducing the published
weights.

How the stages work:

- The stage boundaries must increase, and the last must reach `--total-timesteps`.
- At a boundary only the environment workers are replaced. The policy, the optimiser state, the
  reward-normalisation statistics and the learning-rate schedule carry over.
- The stage values replace `--flights` and `--stitch-segments`.
- A stage may name its own seed file as a fourth field, `flights:segments:until_step:pool`, which
  replaces `--train-seed-pool` for that stage. This allows a curriculum over scenario difficulty
  as well as length.
- `--curriculum` needs `--env windowed` and fewer than 100 workers.

## Seeds and seed pools { #seeds }

`--seed` fixes two things: the initial network weights, and the scenarios each worker sees. Worker
*i* draws its scenario seeds from its own generator, seeded with `seed × 1000 + i` (plus
`100 × stage` under a curriculum). The sequence of training scenarios is therefore determined by
`--seed`, `--n-envs` and the curriculum.

Where the scenario seeds come from depends on `--train-seed-pool`:

- **With a pool**, each new episode takes a seed drawn at random from the file. The repository
  supplies `config/training_seeds/training_seeds.txt`, a pool of 40,000 seeds, one per line. It is
  used for both procedures.
- **Without a pool**, each new episode takes a random 31-bit seed.

In both cases the seeds listed in `config/eval_seeds.txt` are never used for training, and the
supplied pool contains none of the seeds in `evaluation/seeds.txt`.

`--train-max-early-s` is an alternative to a pool: it filters scenarios during training by
generating each one and redrawing it if a flight is forecast to land too early. A pool of seeds
screened in advance avoids that work in the training loop.

## Outputs { #outputs }

A run is named `atc_run_1_<N>`, with the next free number and the `--run-suffix` if one is given.
Everything it writes is under `experiments/`:

```text
experiments/atc_run_1_<N>_<suffix>/
├── run_meta.json                                  settings of the run
├── checkpoints/
│   ├── ppo_tada_<steps>_steps.zip                 policy, every --save-freq transitions
│   └── ppo_tada_vecnormalize_<steps>_steps.pkl    its reward-normalisation statistics
├── tb/                                            TensorBoard events and progress.csv
├── final_model.zip                                policy at the end of training
└── vecnormalize.pkl
```

The TensorBoard logs are in the run's own `tb/` directory. A top-level `tb_logs/` directory, if
one exists, is only consulted when the next run number is chosen. The trainer also creates two
directories it does not write to, `best/` and `eval_logs/`.

`run_meta.json` records the action set, the airport mask, the observation and reselection
settings, the reward and environment options, the seed, the curriculum and the optimiser settings.
The evaluation tools look for it next to a model or one directory above, so both `final_model.zip`
and the files in `checkpoints/` can be scored as they are:

```sh
TADA_ACTION_SET=v2 TADA_AIRPORT_MASK=procedure \
  python -m analysis.score_windowed \
  --models experiments/atc_run_1_<N>_mxp/final_model.zip \
  --seed-file evaluation/seeds.txt
```

To follow a run:

```sh
tensorboard --logdir experiments/atc_run_1_<N>_mxp/tb
```

Useful series are `custom_metrics/success_rolling` and `window_metrics/on_time_rate` for the
outcome of training episodes, `window_metrics/clearances` for the number of clearances,
`rollout/ep_rew_mean` for the return, `train/approx_kl` and `train/learning_rate` for the
optimiser, and `time/fps` for throughput. Under a curriculum, `time/curriculum_stage` shows the
current stage. Training episodes are sampled from the policy on training scenarios, so these
series are not the evaluation scores of a checkpoint; score a checkpoint as shown above.

Stopping a run with Ctrl-C saves `latest_model.zip` and `latest_vecnormalize.pkl` in the run
directory. There is no option to resume a run with its optimiser state; a new run can start from
saved weights as described next.

## Warm starts { #warm-start }

`--init-weights` starts a run from the weights of an existing checkpoint instead of random
weights. The checkpoint's network may be narrower than the new one in two supported ways: it may
lack the sequence observations or the reselection input, in which case the new input columns start
at zero, and it may lack the reselection head, which then starts with a small probability of
asking for a second pick. The new policy therefore begins close to the behaviour of the old one.
Any other difference in shape is an error.

When the reward differs from the one the checkpoint was trained on, its value estimates are on the
wrong scale and the first updates can erase the policy. Two options guard against this, as the
paper describes:

- `--critic-warmup-steps N` trains only the value head for the first N transitions, at the
  constant learning rate `--critic-warmup-lr` (default 3e-4). The rest of the network is then
  unfrozen with a fresh optimiser state, and the normal schedule runs over the remaining
  transitions.
- A peak learning rate ten times lower than for training from scratch.

The example in `main_jax.py` combines them:

```sh
python main_jax.py --env windowed --reward-mode outcome_pbrs \
  --init-weights experiments/<run>/checkpoints/ppo_tada_<N>_steps.zip \
  --n-envs 16 --critic-warmup-steps 100000 --lr-max 3e-5 --final-lr 3e-6 \
  --ent-coef 0.003 --total-timesteps 5000000 --run-suffix windowed_jax
```

A warm start copies weights only. The reward-normalisation statistics and the optimiser state of
the earlier run are not loaded.

The published reference recipe trains from random weights. How warm starts were used during
development is described in the [Research notes](../notes/training/index.md).

## Hardware { #hardware }

The public files do not state a required machine or an expected training time; the repository's
guide says to choose the worker count and the training budget for your hardware. What they do
state:

- Each of the `--n-envs` workers is a separate process running the simulator on the CPU.
- The PPO updates run in JAX. With the CUDA build of JAX they run on the GPU; with the CPU build
  the same code runs without one.
- `main_jax.py` sets `XLA_PYTHON_CLIENT_PREALLOCATE=false` unless you set it yourself, so JAX
  allocates GPU memory as needed instead of reserving it all.
- Evaluation always runs the policy with PyTorch on the CPU.

The paper's runs used 32 parallel environments. Timings measured during development are in the
[Research notes](../notes/training/compute.md).

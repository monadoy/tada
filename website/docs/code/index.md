---
icon: material/code-braces
---

# Get the code

!!! abstract "Summary"
    The public repository [github.com/monadoy/tada](https://github.com/monadoy/tada) holds both
    implementations, the trained models and the simulator. To run the single-agent code you need
    CPython 3.12 on Linux x86_64, the simulator wheel from `artifacts/`, and an A320 performance
    file that you must supply yourself because the data is licensed. This page lists what is in the
    repository and walks through the single-agent setup. The next two pages cover
    [evaluation](evaluate.md) and [training](train.md).

## What is in the repository

| Path | Contents |
|---|---|
| `single-agent/` | The single-agent implementation described on this site: a JAX PPO learner with a windowed, autoregressive policy. Trained policies are saved as Stable-Baselines3 checkpoints and evaluated with PyTorch. |
| `multi_agent/` | The multi-agent implementation: a shared policy trained with Ray RLlib and PyTorch. |
| `artifacts/single_agent/` | The two published single-agent policies, `mxp/` (TMB) and `pms/` (PMS), each with its normalisation statistics and settings. |
| `artifacts/multi_agent/` | The two published multi-agent policies, `mxp/` and `pms/`. |
| `artifacts/simulator/wheels/` | Flight simulator 0.2.80, built for CPython 3.12 on Linux, macOS (Apple Silicon) and Windows. Both implementations use it. |
| `docs/aircraft-designs.md` | The format of the aircraft performance file and where to put it. |

Each implementation includes the scenario configuration and the seeds it needs. In file and
directory names the repository uses the IATA codes of the two airports: `mxp` for Milan Malpensa
(LIMC, trombone) and `bgy` for Milan Bergamo (LIME, point merge).

The software and models are research artefacts, shared as they are.

## Prerequisites

- **CPython 3.12.** The simulator wheels are built for this version only.
- **Linux x86_64 with glibc 2.34 or newer.** The setup below is documented for Linux. Wheels for
  macOS and Windows are provided, but the
  [simulator notes](https://github.com/monadoy/tada/blob/main/artifacts/simulator/README.md) state
  that a wheel being available does not establish that the full training stack works on those
  systems. Use the Linux wheel inside WSL or a Linux container.
- **The simulator wheel** for your platform, from `artifacts/simulator/wheels/`.
- **Aircraft performance data**, which is not in the repository. See
  [below](#aircraft-data).
- **A GPU is optional.** Evaluation runs the policy with PyTorch on the CPU. Training runs its
  updates in JAX, on the CPU or on a CUDA device.

## Set up the single-agent code { #setup }

### 1. Clone and create an environment

```sh
git clone https://github.com/monadoy/tada.git
cd tada/single-agent
python3.12 -m venv .venv && source .venv/bin/activate
```

Any Python 3.12 environment works. All commands on this page and the next two are run from
`single-agent/` unless stated otherwise.

### 2. Install the dependencies and the simulator

Copy the Linux wheel into `simulator/wheels/` (create the directory, keep the filename) and
install the CPU dependencies:

```sh
mkdir -p simulator/wheels
cp ../artifacts/simulator/wheels/flight_simulator-0.2.80-cp312-cp312-manylinux_2_34_x86_64.whl simulator/wheels/
python -m pip install torch==2.8.0 --index-url https://download.pytorch.org/whl/cpu
sed 's/^jax\[cuda12\]/jax/' recipes/requirements-windowed.txt | python -m pip install -r /dev/stdin
python -m pip install simulator/wheels/flight_simulator-0.2.80-cp312-cp312-manylinux_2_34_x86_64.whl
```

The `sed` substitution replaces the CUDA build of JAX with the CPU build. For training on a GPU,
install the requirements file unchanged instead, with a compatible NVIDIA driver:

```sh
python -m pip install -r recipes/requirements-windowed.txt
python -m pip install simulator/wheels/flight_simulator-0.2.80-cp312-cp312-manylinux_2_34_x86_64.whl
```

The requirements file pins `jax` 0.7.1, `flax` 0.12.0, `optax` 0.2.8, `stable_baselines3` 2.9.0 and
`gymnasium` 1.1.1.

### 3. Supply the aircraft performance data { #aircraft-data }

Aircraft performance data is licensed and is not distributed. Before running tests, training or
evaluation, place it as `A320.json` in a `designs/` directory under each scenario configuration:

```sh
for root in config/simulation_config_mxp config/simulation_config_bgy; do
  mkdir -p "$root/designs" && cp /path/to/A320.json "$root/designs/"
done
```

The simulator loads every `*.json` file in `designs/` as one aircraft design, and the scenario
generator uses the ICAO type `A320`. The file has this structure; every field is a required
number unless shown as a string:

```json
{
  "icao_typename": "A320",
  "descriptive_name": "AIRBUS A320-231",
  "masses": {"minimum_kg": 0.0, "reference_kg": 0.0, "maximum_kg": 0.0},
  "limits": {
    "max_longitudinal_acceleration_knots_per_sec": 0.0,
    "max_op_altitude_ft": 0.0,
    "v_stall_flap_kcas": 0.0,
    "v_stall_clean_kcas": 0.0,
    "v_mo_kcas": 0.0,
    "max_climb_rate_fpm": 0.0,
    "max_descent_rate_fpm": 0.0
  },
  "performance_sectors": [
    {
      "altitude_min_ft": 0.0,
      "altitude_max_ft": 2000.0,
      "cruise": {"v_opt_kcas": 0.0},
      "climb": {"v_opt_kcas": 0.0, "roc_fpm": 0.0},
      "descent": {"v_opt_kcas": 0.0, "rod_fpm": 0.0}
    }
  ]
}
```

`performance_sectors` lists altitude bands in ascending order. The published models were trained
and evaluated with Airbus A320-231 values derived from EUROCONTROL BADA (Base of Aircraft Data),
in five bands: 0 to 2000, 3000 to 8000, 10000 to 16000, 18000 to 24000 and 26000 to 33000 ft. That
file has the SHA-256 checksum

```text
466a0686dd1e181625fbef570c7dc0b433e0fdbc9f68188c0ffae0d63d850fcc
```

Other values change the simulated trajectories and therefore the results. The full description is
in [`docs/aircraft-designs.md`](https://github.com/monadoy/tada/blob/main/docs/aircraft-designs.md).

### 4. Verify the downloaded artefacts

From the repository root:

```sh
(cd artifacts/simulator && sha256sum -c SHA256SUMS)
(cd artifacts/single_agent && sha256sum -c SHA256SUMS)
```

### 5. Run the tests

`pytest` is not in the requirements file, so install it first:

```sh
python -m pip install pytest
TADA_SEQUENCE_OBS=1 TADA_MAX_PICKS=2 python -m pytest tests
```

The two variables select the configuration of the published models; they are explained under
[environment variables](evaluate.md#environment). `tests/test_wheel_selection.py` expects the Linux
wheel in `simulator/wheels/`, as copied in step 2.

## Where things are in `single-agent/`

| Path | Contents |
|---|---|
| `atc_env/`, `actions/`, `models/`, `network/` | The environment, the clearance sets and masks, the observations and the policy network. |
| `jax_ppo/`, `main_jax.py` | The JAX learner and the training entry point. |
| `evaluation/` | The rollout-search runner, the supplied evaluation seeds and the CSV export. |
| `analysis/` | Policy-only scoring, the rollout search itself and episode recording. |
| `config/` | Settings (`config.py`, `windowed_config.py`), the scenario configuration of each procedure and the training seed pool. |
| `simulator/`, `static/` | Python adapters for the simulator and the sector definitions. |
| `tests/` | Behaviour, compatibility, resume and numerical checks. |

## The multi-agent code

The multi-agent implementation has its own setup (it uses `uv` and a helper script), its own
evaluation protocol and its own training configuration. They are documented in the
[multi-agent guide](https://github.com/monadoy/tada/blob/main/multi_agent/README.md) in the
repository. The design is summarised on [the multi-agent page](../how/multi-agent.md), and the
aircraft performance file is supplied in the same way, under
`multi_agent/config/simulation_config_mxp/designs/` and
`multi_agent/config/simulation_config_bgy/designs/`. The multi-agent tools hash every file in the
scenario configuration, so they accept only the exact file with the checksum given above, and
`designs/` must contain nothing else.

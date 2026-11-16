# TADA: Reinforcement Learning for Arrival Management

[![TADA — Terminal Airspace Digital Assistant](static/tada-header.jpg)](https://www.sesarju.eu/projects/TADA)

Single- and multi-agent PPO policies for time-based arrival management at Milan Malpensa (MXP, trombone) and Milan Bergamo (BGY, point merge).

The policies suggest speed changes, shortcuts, vectors and path extensions that meet the landing sequence and target times from an Arrival Manager (AMAN), maintaining aircraft separation while balancing landing-time accuracy against the number of clearances issued. See the [TADA project page](https://tada.monad.fi/).

- [Multi-agent guide](multi_agent/README.md): Ray RLlib and PyTorch implementation.
- [Single-agent guide](single-agent/README.md): JAX implementation with SB3-compatible policies.
- `artifacts/`: trained MXP and PMS models for both implementations.
- [Documentation site](website/README.md): the design of both approaches, the results of the paper, the TADA Lab and the single-agent research notes. Sources are in `website/`.

Each implementation includes its required scenario and seed inputs. Licensed aircraft performance data is a prerequisite and is not included; see [aircraft performance data](docs/aircraft-designs.md). The guides cover setup, evaluation and training.

Research software and models, shared as is.

The TADA Lab on the documentation site flies the published single-agent policies in the browser. Its engine is published encrypted and unlocks with a key that anyone may request; see the [Lab engine terms](website/LAB-ENGINE-TERMS.md).

## Acknowledgements

![SESAR 3 Joint Undertaking, co-funded by the European Union, Monad, and University of Malta](static/funding.svg)

Developed within [TADA (Terminal Airspace Digital Assistant)](https://www.sesarju.eu/projects/TADA), with contributions from the [Institute of Aerospace Technologies, University of Malta](https://www.um.edu.mt/) and [Monad Oy](https://monad.fi/en/).

This work received funding from the SESAR 3 Joint Undertaking under grant agreement No 101166972 (TADA), under the European Union’s Horizon Europe research and innovation programme.

## Citation

```bibtex
@unpublished{tada2026arrivalmanagement,
  title = {Single- and Multi-Agent Reinforcement Learning for Time-Based Arrival Management in Terminal Airspace with Trombone and Point Merge Procedures},
  author = {Viljanen, Aleksi and Grech, Leander and Puhakka, Antti and Baldacchino, Samuel and Viitanen, Risto and Zammit, Brian and Hakanen, Eero and Äijö, Tomi and Gauci, Jason},
  year = {2026},
  note = {Manuscript submitted for publication}
}
```

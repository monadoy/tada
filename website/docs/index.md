---
icon: material/airplane-landing
---

# TADA: reinforcement learning for arrival management

<p class="tada-lede">Policies that turn an arrival manager's landing sequence and target times into
controller clearances, trained and compared on the trombone at Milan Malpensa and the point merge at
Milan Bergamo.</p>

<div class="tada-actions" markdown>
[:material-flask-outline: Fly the policies in the Lab](lab/index.md){ .md-button .md-button--primary }
[:material-chart-box-outline: See the results](results.md){ .md-button }
[:material-code-braces: Get the code](code/index.md){ .md-button }
</div>

<div class="tada-tiles tada-tiles--hero">
<div class="tada-tile tada-tile--ok"><span class="tada-tile__label">Multi-agent policy</span><span class="tada-tile__value">95<span class="tada-tile__unit">/100</span></span><span class="tada-tile__delta">trombone solved</span></div>
<div class="tada-tile tada-tile--ok"><span class="tada-tile__label">Multi-agent policy</span><span class="tada-tile__value">100<span class="tada-tile__unit">/100</span></span><span class="tada-tile__delta">point merge solved</span></div>
<div class="tada-tile tada-tile--ok"><span class="tada-tile__label">Single-agent + search</span><span class="tada-tile__value">96<span class="tada-tile__unit">/100</span></span><span class="tada-tile__delta">trombone · 0 LoS</span></div>
<div class="tada-tile tada-tile--ok"><span class="tada-tile__label">Single-agent + search</span><span class="tada-tile__value">100<span class="tada-tile__unit">/100</span></span><span class="tada-tile__delta">point merge · 0 LoS</span></div>
</div>

An arrival manager (AMAN) gives every arriving flight a place in the landing sequence and a target landing
time, and leaves the choice of clearances to the approach controller. TADA trains reinforcement-learning
policies that make that choice: speed changes, shortcuts, vectors and path extensions that land each flight
on its target time while keeping aircraft separated and the number of clearances low.

## Two approaches

<div class="tada-duo" markdown>
<div class="tada-duo__card" markdown>
<span class="tada-duo__who">University of Malta</span>
### :material-eye-outline: Single-agent
One policy sees a window of the next ten flights in the landing queue and picks an aircraft and a clearance
for it, up to two per 45 s decision. [How it works](how/environments.md).
</div>
<div class="tada-duo__card" markdown>
<span class="tada-duo__who">Monad</span>
### :material-account-group-outline: Multi-agent
Every aircraft is an agent of one shared policy that chooses its own clearance; a rule selects up to three
aircraft per decision, one per sector group. [How it works](how/multi-agent.md).
</div>
</div>

This site documents the design, reports the results of the paper, and lets you fly the published
single-agent policies in your browser. The code and the trained models are in the
[repository](https://github.com/monadoy/tada).

## Results at a glance

Each policy was evaluated on 100 held-out scenarios of 20 arrivals per procedure. An episode is **solved**
when every flight lands within 60 s of its AMAN target and no loss of separation occurs. The table gives
solved episodes / episodes with a loss of separation, for the deterministic policy.

<table class="tada-table tada-results" markdown>
<thead><tr><th>100 episodes per procedure</th><th>TMB solved / LoS</th><th>PMS solved / LoS</th></tr></thead>
<tbody>
<tr><td>Single-agent, policy only</td><td>74 / 20</td><td>64 / 6</td></tr>
<tr><td>Single-agent, policy + rollout search</td><td>96 / 0</td><td class="is-best">100 / 0</td></tr>
<tr><td>Multi-agent, policy only</td><td>95 / 3</td><td class="is-best">100 / 0</td></tr>
<tr><td>Multi-agent, policy + rollout search</td><td class="is-best">97 / 0</td><td class="is-best">100 / 0</td></tr>
</tbody>
</table>

The multi-agent policy is strong on its own, and uses fewer than 1.6 clearances per aircraft on the
trombone and fewer than 0.5 on the point merge. The single-agent policy reaches comparable success rates
with repeated stochastic attempts or with rollout search, and uses more clearances.
[All results and figures](results.md).

## Sections

<ul class="tada-sections" markdown>
<li markdown><a class="tada-section" href="results/"><span class="tada-section__glyph">:material-chart-box-outline:</span><span class="tada-section__name">Results</span><span class="tada-section__what">The evaluation of the paper: solved episodes, separation, landing-time deviation and clearances, for both approaches.</span></a></li>
<li markdown><a class="tada-section" href="how/"><span class="tada-section__glyph">:material-sitemap-outline:</span><span class="tada-section__name">How it works</span><span class="tada-section__what">The problem, the environment, what the agent observes and can do, the policy network, the reward and rollout search.</span></a></li>
<li markdown><a class="tada-section" href="lab/"><span class="tada-section__glyph">:material-flask-outline:</span><span class="tada-section__name">TADA Lab</span><span class="tada-section__what">Generate a scenario and fly the published policies in your browser. The engine is encrypted; request a key to try it.</span></a></li>
<li markdown><a class="tada-section" href="code/"><span class="tada-section__glyph">:material-code-braces:</span><span class="tada-section__name">Use the code</span><span class="tada-section__what">Set up the repository, reproduce the evaluation of the published models, and train a policy.</span></a></li>
<li markdown><a class="tada-section" href="glossary/"><span class="tada-section__glyph">:material-book-alphabet:</span><span class="tada-section__name">Glossary</span><span class="tada-section__what">The terms used in the paper and on this site, each in a sentence or two.</span></a></li>
<li markdown><a class="tada-section" href="notes/"><span class="tada-section__glyph">:material-notebook-outline:</span><span class="tada-section__name">Research notes</span><span class="tada-section__what">The development diary of the single-agent work: findings, every training run, the experiment log and the archive.</span></a></li>
</ul>

## The paper

Viljanen, A., Grech, L., Puhakka, A., Baldacchino, S., Viitanen, R., Zammit, B., Hakanen, E., Äijö, T. and
Gauci, J. *Single- and Multi-Agent Reinforcement Learning for Time-Based Arrival Management in Terminal
Airspace with Trombone and Point Merge Procedures.* Manuscript submitted for publication, 2026.

```bibtex
@unpublished{tada2026arrivalmanagement,
  title  = {Single- and Multi-Agent Reinforcement Learning for Time-Based Arrival Management in Terminal Airspace with Trombone and Point Merge Procedures},
  author = {Viljanen, Aleksi and Grech, Leander and Puhakka, Antti and Baldacchino, Samuel and Viitanen, Risto and Zammit, Brian and Hakanen, Eero and Äijö, Tomi and Gauci, Jason},
  year   = {2026},
  note   = {Manuscript submitted for publication}
}
```

## Acknowledgements

<img class="tada-funding" src="assets/funding.svg" alt="SESAR 3 Joint Undertaking, co-funded by the European Union, Monad, and University of Malta Institute of Aerospace Technologies">

Developed within [TADA (Terminal Airspace Digital Assistant)](https://www.sesarju.eu/projects/TADA), with
contributions from the [Institute of Aerospace Technologies, University of Malta](https://www.um.edu.mt/)
and [Monad Oy](https://monad.fi/en/). This work received funding from the SESAR 3 Joint Undertaking under
grant agreement No 101166972 (TADA), under the European Union's Horizon Europe research and innovation
programme.

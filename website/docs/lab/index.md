---
icon: material/flask-outline
hide:
  - toc
---

# TADA Lab

Generate a scenario, pick one of the published single-agent policies, and fly it. Every flight runs the
real simulator and the policy's own weights, scored as the paper scores it, so a curated seed reproduces
the paper's episode. Everything runs in your browser: the simulator and the policies are compiled to
WebAssembly, and nothing is installed or uploaded. The engine is published encrypted and unlocks with an
engine key; if you do not have one, [request a key](access.md).

<div id="lab-app" class="tada-lab" data-mode="browser" data-key-request="access/" data-assets="../assets/lab/" data-worker="../javascripts/lab-worker.js">
  <noscript>The Lab needs JavaScript.</noscript>
</div>

## What you can do { #run-the-lab }

- **Fly the paper's episodes.** Choose the trombone (Malpensa) or the point merge (Bergamo) and a curated
  seed: these are the 100 evaluation scenarios of the [results](../results.md), and each shows how the
  policy and the policy with rollout search fared on it in the paper.
- **Three ways to run a policy.** The deterministic policy, the best of several sampled attempts, or
  [rollout search](../how/search.md) with adjustable parameters (candidates, replanning interval, CPU
  threads). During a search the radar draws the candidate rollouts and follows the plan as it is chosen.
- **Compose your own traffic.** Under *Stream*, pick *compose* and build a stream from up to eight
  segments, each with its own number of flights (2 to 40) and difficulty, joined by gaps you choose. The
  link in the address bar holds the whole composition, so a scenario can be shared.
- **Watch it in 2D or 3D.** A radar view with sectors, range rings, trails and clearance glyphs; a 3D view
  with altitudes; a timeline of every clearance; and the landing-time deviation of every flight.
- **Airports from OpenStreetMap.** Zoom in and Malpensa or Bergamo appears with runways, taxiways, aprons
  and buildings. Map data © OpenStreetMap contributors, under the
  [ODbL](https://opendatacommons.org/licenses/odbl/).

## Good to know

- The policy weights (under 1 MB each) load only when you press **Download**, and are checked against
  their published checksum.
- The engine draws no MP4 video; the replay shows the same flight. Three rendered episodes are on the
  [Results](../results.md#watch-the-single-agent-policies) page.
- Rollout search is computed on your machine and can take from a second to a minute per episode,
  depending on the scenario and on the number of threads.
- To run the policies outside the browser, on the full code, see [Use the code](../code/index.md).

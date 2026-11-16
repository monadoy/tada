---
icon: material/notebook-outline
---

# Research notes

!!! tada-archive "Research notes"
    This section is the development diary of the single-agent work, brought over as it was written. It
    is kept because it records what was tried and why, including what did not work. It is not needed to
    understand or use the published models: for that, read [How it works](../how/index.md) and
    [Results](../results.md).

## How to read these pages

- **Run names.** Models are called by their internal run ids, such as `1_38`. The two published policies
  are `1_76` (trombone, Malpensa; `artifacts/single_agent/mxp` in the repository) and `1_77` (point merge,
  Bergamo; `artifacts/single_agent/pms`).
- **Paths and commands** refer to the private development repository. Many of the scripts they name are
  not in the public code. [Use the code](../code/index.md) has the commands that work on the public
  repository.
- **Numbers** were measured with the evaluation setup of the time: mostly an earlier scenario generator
  and the 100 development validation seeds, not the evaluation episodes of the paper. They are comparable
  with each other within a page, not with the [Results](../results.md) page.
- **Names that changed.** The scenario generator and the airport mask that the notes call `monad` are
  `procedure` in the public code.
- **Frozen.** The model cards and tables were generated from the development repository's evaluation
  files and are not regenerated here.

## What is here

<ul class="tada-sections" markdown>
<li markdown><a class="tada-section" href="findings/"><span class="tada-section__glyph">:material-lightbulb-on-outline:</span><span class="tada-section__name">Findings</span><span class="tada-section__what">What the experiments established, one short page each: reselection, sequencing, capacity, long streams, search, point merge, training from scratch.</span></a></li>
<li markdown><a class="tada-section" href="models/"><span class="tada-section__glyph">:material-trophy-outline:</span><span class="tada-section__name">Development runs</span><span class="tada-section__what">The leaderboard and a report card for every training run, with lineage, scores and the command that produced it.</span></a></li>
<li markdown><a class="tada-section" href="training/"><span class="tada-section__glyph">:material-dumbbell:</span><span class="tada-section__name">Training notes</span><span class="tada-section__what">The from-scratch recipe as developed, reference curves, search distillation, discrete SAC, compute and TensorBoard.</span></a></li>
<li markdown><a class="tada-section" href="evaluation/"><span class="tada-section__glyph">:material-clipboard-text-outline:</span><span class="tada-section__name">Evaluation battery</span><span class="tada-section__what">The development evaluation protocol: validation, dev and test seeds, the battery, paired tests.</span></a></li>
<li markdown><a class="tada-section" href="log/"><span class="tada-section__glyph">:material-history:</span><span class="tada-section__name">Experiment log</span><span class="tada-section__what">The run-by-run history, with the progress board of every lineage.</span></a></li>
<li markdown><a class="tada-section" href="archive/"><span class="tada-section__glyph">:material-archive-outline:</span><span class="tada-section__name">Archive</span><span class="tada-section__what">The 10-aircraft environment and its reward, the 22-clearance set, the early runs.</span></a></li>
</ul>

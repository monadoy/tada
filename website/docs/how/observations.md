---
icon: material/eye-outline
---

# Observations

!!! abstract "Summary"
    At every decision the policy receives a fixed-size dictionary that describes the ten flights in
    the temporal window: four global features, 17 scalars per aircraft, each aircraft's remaining
    route relative to its position, its eight most recent clearances, and the masks that mark
    padding and infeasible choices. Every continuous value is bounded to `[-1, 1]`. Some features
    are read from the live world and others from the predicted world, so the policy sees both the
    current traffic and what will happen if no further clearance is issued. The layout is
    identical for the trombone (TMB) and point merge (PMS) policies.

Source: `single-agent/models/observations.py` (`build_global_observation`),
`single-agent/atc_env/windowed_env.py` (`_build_window_observation`, `_sequence_state`,
`_add_pick_observation`), `single-agent/config/config.py`, `single-agent/config/windowed_config.py`.

<figure class="tada-fig-wrap"><svg class="tada-dg" viewBox="0 0 760 470" role="img" aria-label="The observation: a window of the next 10 flights in the AMAN queue, and what each slot carries">
<defs>
  <marker id="oa" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="arrowhead" d="M0,0 L8,4 L0,8 z"/></marker>
</defs>
<!-- AMAN queue -->
<text class="h" x="14" y="20">AMAN queue of a 20-flight stream, in landing order</text>
<g>
  <circle class="slot off" cx="28" cy="46" r="11"/><text class="s" x="24" y="50">1</text>
  <circle class="slot off" cx="56" cy="46" r="11"/><text class="s" x="52" y="50">2</text>
  <circle class="slot off" cx="84" cy="46" r="11"/><text class="s" x="80" y="50">3</text>
</g>
<text class="s" x="14" y="78">landed or released</text>
<rect class="box in" x="102" y="30" width="298" height="34" rx="17"/>
<g>
  <circle class="slot" cx="120" cy="46" r="11"/><text class="s" x="116" y="50">4</text>
  <circle class="slot" cx="148" cy="46" r="11"/><text class="s" x="144" y="50">5</text>
  <circle class="slot" cx="176" cy="46" r="11"/><text class="s" x="172" y="50">6</text>
  <circle class="slot" cx="204" cy="46" r="11"/><text class="s" x="200" y="50">7</text>
  <circle class="slot" cx="232" cy="46" r="11"/><text class="s" x="228" y="50">8</text>
  <circle class="slot" cx="260" cy="46" r="11"/><text class="s" x="256" y="50">9</text>
  <circle class="slot off" cx="288" cy="46" r="11"/><text class="s" x="281" y="50">10</text>
  <circle class="slot off" cx="316" cy="46" r="11"/><text class="s" x="309" y="50">11</text>
  <circle class="slot off" cx="344" cy="46" r="11"/><text class="s" x="337" y="50">12</text>
  <circle class="slot off" cx="372" cy="46" r="11"/><text class="s" x="365" y="50">13</text>
</g>
<text class="t b c-in" x="190" y="84">the window: next 10 flights in the queue</text>
<text class="s" x="190" y="100">filled = under control · hollow = not yet spawned (visible, do nothing only)</text>
<g>
  <circle class="slot off" cx="424" cy="46" r="11"/><text class="s" x="417" y="50">14</text>
  <circle class="slot off" cx="452" cy="46" r="11"/><text class="s" x="445" y="50">15</text>
  <text class="s" x="472" y="50">… 20</text>
</g>
<text class="s" x="478" y="78">not shown until a slot frees</text>

<!-- one slot expanded -->
<path class="e dash" d="M176,58 L176,122" marker-end="url(#oa)"/>
<text class="h" x="14" y="138">what one slot carries (flight 6)</text>

<rect class="box in fill-in" x="14" y="148" width="360" height="232" rx="5"/>
<text class="t b" x="26" y="168">17 scalars</text>
<text class="s" x="26" y="188">0–2   position x, y, z</text>
<text class="s" x="26" y="204">3–6   ground speed, vertical speed, heading sin/cos</text>
<text class="s" x="26" y="220">7     scheduled time to target (log scale)</text>
<text class="s" x="26" y="236">8     predicted landing-time deviation (log scale)</text>
<text class="s" x="26" y="252">9     predicted infringement, 3–10 NM band</text>
<text class="s" x="26" y="268">10    time to the first predicted infringement</text>
<text class="s" x="26" y="284">11    under control (0 / 1)</text>
<text class="s" x="26" y="304">12    AMAN rank shift (predicted − target)</text>
<text class="s" x="26" y="320">13    predicted order crossings</text>
<text class="s" x="26" y="336">14–15 landing-gap error to AMAN predecessor, successor</text>
<text class="s" x="26" y="356">16    cleared in this decision interval</text>

<rect class="box in fill-in" x="390" y="148" width="356" height="70" rx="5"/>
<text class="t b" x="402" y="168">relative flight plan · 20 × 11</text>
<text class="s" x="402" y="188">each remaining waypoint: position, offset from the</text>
<text class="s" x="402" y="204">aircraft, distance, bearing, target speed; + validity mask</text>

<rect class="box in fill-in" x="390" y="228" width="356" height="70" rx="5"/>
<text class="t b" x="402" y="248">action history · 8 × 16</text>
<text class="s" x="402" y="268">its last 8 clearances: a validity flag + one-hot over</text>
<text class="s" x="402" y="284">the 15 clearances; most recent first, no timestamps</text>

<rect class="box in fill-in" x="390" y="308" width="356" height="72" rx="5"/>
<text class="t b" x="402" y="328">masks</text>
<text class="s" x="402" y="348">mask_aircraft, mask_select (who may be picked)</text>
<text class="s" x="402" y="364">mask_action_per_ac: 15 feasible clearances; mask_again</text>

<!-- global -->
<rect class="box in" x="14" y="396" width="732" height="62" rx="5"/>
<text class="t b" x="26" y="416">global · 4 features, once per state</text>
<text class="s" x="26" y="436">time until the window's last flight is due · window flights under control ·</text>
<text class="s" x="26" y="450">mean predicted |deviation| · largest predicted infringement in the window</text>
</svg>
</figure>

## Where the values come from

The environment keeps two copies of the simulation. The *live world* is the traffic as it is now.
The *predicted world* is the result of a *no-operation rollout* (do-nothing forecast): the live
world advanced with no further clearance over a horizon that covers the scheduled landings of the
flights in the window. Positions,
speeds and routes are read from the live world. Predicted landing-time deviations, predicted
infringements and the AMAN-sequence features are read from the predicted world, so they state the
consequence of issuing nothing more. The forecast is recomputed after every decision, including a
zero-time [reselection](actions.md#reselection) pick, where it includes the clearance just queued.

The window, the forecast horizon and the episode rules are described in
[Episodes and windowing](environments.md#windowed).

## Layout

The observation is a dictionary. `A = 10` is the number of slots, `C = 15` the number of
clearances in the action set (`v2` for TMB, `v2pms` for PMS; both have 15).

| Component | Key | Shape | Content |
|---|---|---|---|
| Global features | `global` | `(4,)` | window time span, traffic load, mean predicted deviation, largest predicted infringement |
| Aircraft scalars | `aircraft` | `(10, 17)` | kinematics, schedule and conflict forecasts, control status, AMAN-sequence descriptors, same-interval clearance flag |
| Relative flight plans | `flight_plans_rel` | `(10, 20, 11)` | up to 20 remaining waypoints per flight |
| Action histories | `action_histories` | `(10, 8, 16)` | the eight most recent clearances per flight |
| Flight-plan mask | `flight_plan_mask` | `(10, 20)` | rows of `flight_plans_rel` that hold a real waypoint |
| Aircraft-selection mask | `mask_select` | `(10,)` | slots that may be selected at this pick |
| Clearance mask | `mask_action_per_ac` | `(10, 15)` | feasible clearances for each slot |
| Reselection mask | `mask_again` | `(1,)` | whether another pick may be requested before time advances |
| Slot validity | `mask_aircraft` | `(10,)` | slots that hold a flight |

Slot `i` holds the `i`-th flight of the window in AMAN order. A slot without a flight is all
zeros and has `mask_aircraft = 0`. The [policy network](policy.md) applies the same weights to
every slot and has no positional input, so the slot index carries no information of its own.

The scalar width of 17 requires `TADA_SEQUENCE_OBS=1` (four AMAN-sequence columns) and
`TADA_MAX_PICKS=2` (one clearance flag, and the keys `mask_select` and `mask_again`). Both
published policies were trained with these settings and their `run_meta.json` records
`aircraft_scalar_len: 17`.

### Coordinate frame

All horizontal positions pass through a translation drawn once per episode, uniformly within
±75 NM on each axis (`sample_translation_matrix`). Aircraft and waypoints are shifted together, so
relative geometry is unchanged, while absolute coordinates differ from episode to episode.

### Encodings

Three maps are used. `clip` limits a value to the stated range.

```
linear, symmetric   sym(v; s)       = clip(v / s, -1, 1)
linear, one-sided   unit(v; lo, hi) = 2 * clip((v - lo) / (hi - lo), 0, 1) - 1
signed logarithm    slog(v; m, f)   = sign(v) * ln(1 + min(|v|, m) / f) / ln(1 + m / f)
```

The signed logarithm is used for times. It keeps the sign, saturates at `|v| = m`, and gives the
most resolution near zero: with `m = 1800 s` and `f = 10 s`, deviations of 30 s, 60 s and 120 s
map to 0.27, 0.37 and 0.49, where a linear map over the same range would give 0.02, 0.03 and 0.07.

## Aircraft scalars

| # | Name in code | Feature | Normalisation |
|---|---|---|---|
| 0, 1 | `pos_x`, `pos_y` | horizontal position (NM), translated frame | `sym(v; 150)` |
| 2 | `pos_z` | altitude (ft) | `sym(v; 45000)` |
| 3 | `vel_xy` | ground speed (kt) | `unit(v; 0, 350)` |
| 4 | `vz` | vertical speed (ft/min) | `sym(v; 3000)` |
| 5, 6 | `heading_sin`, `heading_cos` | sine and cosine of the heading, from the horizontal velocity | none (already in `[-1, 1]`) |
| 7 | `time_to_target` | scheduled time to target: AMAN target landing time minus now (s), not below 0 | `2 * slog(v; 7200, 30) - 1` |
| 8 | `time_deviation` | predicted landing-time deviation (s): predicted landing minus target, positive when late | `slog(v; 1800, 10)` |
| 9 | `predicted_infringement` | largest predicted infringement measure of this aircraft, `[0, 1]` | `unit(v; 0, 1)` |
| 10 | `time_to_conflict` | urgency of its earliest predicted infringement, `max(0, 1 - Δt / 1200 s)` | `unit(v; 0, 1)` |
| 11 | `under_control` | 1 if the flight is under control, 0 if it has not yet entered the TMA | none (0 or 1) |
| 12 | sequence | predicted rank displacement: predicted landing rank minus AMAN rank | `clip(v / 10, -1, 1)` |
| 13 | sequence | number of order crossings: flights predicted to land on the other side of this one than in the AMAN sequence | `unit(min(v, 10); 0, 10)` |
| 14 | sequence | predecessor landing-gap error (s): predicted gap to the AMAN predecessor minus the target gap | `slog(v; 1800, 10)` |
| 15 | sequence | successor landing-gap error (s), likewise | `slog(v; 1800, 10)` |
| 16 | pick | cleared in the current decision interval | none (0 or 1) |

Columns 0–11 are the fields of `AircraftScalarFeatures`. Columns 12–15 and 16 are appended by the
windowed environment.

**Position and speed (0–6)** locate the aircraft in the terminal area. The sine and cosine pair
encodes the heading without a discontinuity at 360°.

**Scheduled time to target (7)** tells the policy how soon the flight is due. It is the schedule,
not a prediction.

**Predicted landing-time deviation (8)** is what the forecast says will happen if nothing more is
done. It is 0 when the forecast lands the flight within the simulator's 10 s tolerance of its
target.

**Predicted infringement and time to conflict (9, 10)** make a developing interaction visible
before it becomes a violation. The measure is taken over the predicted separation events of this
aircraft in the next 2880 s:

```
measure = min( clip((10 NM - h) / 7 NM, 0, 1), clip((1000 ft - v) / 500 ft, 0, 1) )
```

where `h` and `v` are the horizontal and vertical separation of the pair. It is 0 at 10 NM or
1000 ft and reaches 1 at the conflict boundary (3 NM and 500 ft). This band is wider than the
3–5 NM band on which the reward prices a predicted infringement
([Separation rules](separation.md#severity)): the policy can watch a pair close from 10 NM, before
it costs anything. Column 10 is +1 for an event that is imminent and −1 when no event is
predicted within 20 minutes. Both columns include events with a partner outside the window.

**Under control (11)** separates flights that can receive a clearance from flights that hold a
place in the queue but have not yet spawned.

**AMAN-sequence descriptors (12–15)** state how far the predicted traffic departs from the fixed
AMAN sequence. Landing times are the actual ones for flights already down and the forecast ones
for the rest; a flight the forecast does not land is placed at the end of the forecast. A positive
rank displacement means the flight is predicted to be overtaken, a negative one that it overtakes.
A negative gap error means compression against the neighbouring flight.

**Cleared in the current decision interval (16)** is set for an aircraft that already received a
clearance at this simulated time. It distinguishes the observation of a second pick from that of
the first, and such an aircraft can only be left alone until time advances.

## Features defined on the window { #windowed }

No input depends on how many flights the stream contains. A 20-flight training stream is treated
as an excerpt of continuous traffic, and the same policy can be run on a longer stream without any
feature leaving its range. The following features are therefore defined on the window:

| Feature | Definition | Encoding |
|---|---|---|
| scalar 7, scheduled time to target | AMAN target landing time minus now | signed logarithm over 7200 s with a 30 s knee, mapped to `[-1, 1]` |
| `global[0]`, window time span | scheduled time until the last flight in the window is due | the same |
| `global[1]`, traffic load | number of flights in the window that are under control | `unit(n; 0, 10)` |
| `global[2]`, mean deviation | mean absolute predicted landing-time deviation over the flights in the window | `2 * slog(v; 1800, 10) - 1` |
| `global[3]`, largest infringement | maximum of scalar 9 over the flights in the window | as scalar 9 |

The 7200 s scale (`WindowedConfig.TIME_SCALE_S`) is chosen to cover the time span of ten
consecutive flights.

A flight that has not yet spawned may occupy a slot. Its state and route are visible, its
`under_control` flag is 0, and its row of the clearance mask allows only *do nothing*. An active
aircraft more than ten places behind the head of the queue is not represented at all; this is the
partial observability that temporal windowing accepts.

## Relative flight plans

For each flight, the first 20 points of its remaining route, in flying order. Rows beyond the end
of the route are zero and are marked in `flight_plan_mask`.

| # | Feature | Normalisation |
|---|---|---|
| 0, 1 | waypoint position x, y (NM), translated frame | `sym(v; 150)` |
| 2 | waypoint altitude (ft): the mean of its minimum and maximum altitude constraints, or the aircraft's altitude when it has none | `sym(v; 45000)` |
| 3, 4 | offset from the aircraft to the waypoint, x and y (NM) | `sym(v; 150)` |
| 5 | altitude offset (ft) | `sym(v; 40000)` |
| 6 | horizontal distance from the aircraft (NM) | `unit(v; 0, 150)` |
| 7, 8 | sine and cosine of the bearing from the aircraft to the waypoint | none |
| 9 | target speed at the waypoint (kt); 0 when the waypoint has none | `unit(v; 0, 350)` |
| 10 | target speed available | none (0 or 1) |

The remaining route determines which path modifications are still possible. A clearance that
changes the route (a skip, a trombone extension, a vector to the ILS, a direct to the merge point)
appears here once it has been executed.

## Action histories

For each flight, its eight most recent picks, most recent first (`Config.MAX_HISTORY = 8`). A
record has 16 values: a validity flag followed by a one-hot vector over the 15 clearances. Unused
records are all zeros. Both action sets have 15 clearances, so the record width is 16 for the TMB
and the PMS policy alike. A *do nothing* pick addressed to the aircraft is recorded like any other
clearance. Records carry no timestamp.

The history lets the policy distinguish natural motion from the lasting effect of an earlier
clearance, for example a speed that is low because the aircraft was slowed down.

## Global features

| # | Feature | Normalisation |
|---|---|---|
| 0 | scheduled time until the last flight in the window is due (s) | `2 * slog(v; 7200, 30) - 1` |
| 1 | number of flights in the window that are under control | `unit(n; 0, 10)` |
| 2 | mean absolute predicted landing-time deviation over the window (s) | `2 * slog(v; 1800, 10) - 1` |
| 3 | largest predicted infringement measure in the window | as aircraft scalar 9 |

## Masks { #masks }

**Flight-plan mask** (`flight_plan_mask`). 1 for a row of `flight_plans_rel` that holds a real
waypoint. The route encoder averages over these rows only.

**Slot validity** (`mask_aircraft`). 1 for a slot that holds a flight. The network uses it to keep
empty slots out of the self-attention and out of the pooled context.

**Aircraft-selection mask** (`mask_select`). The slots the aircraft head may pick: flights under
control that have not been cleared in the current decision interval. If no flight in the window is
under control, every occupied slot is selectable, so the mask is never empty.

**Clearance mask** (`mask_action_per_ac`). For each slot, the clearances that are physically and
procedurally feasible for that flight now, computed from aircraft limits, waypoint constraints and
route geometry (`single-agent/actions/`; see [Actions](actions.md)). The environment then reduces
the row to *do nothing* for a flight that is not under control, has been released, or has already
been cleared in this interval. *Do nothing* is removed for an aircraft whose forecast contains a
conflict (scalar 9 at its maximum), so that the policy must act on it. A row is never empty.

**Reselection mask** (`mask_again`). 1 if the policy may ask for another pick before simulated
time advances: the current pick is the first of the interval (the budget is two clearances per
45 s) and at least one other selectable aircraft would remain. See
[Reselection](actions.md#reselection).

## What the observation does not contain

- Aircraft beyond the window: a flight more than ten places behind the head of the queue.
- The time at which an earlier clearance was issued: the action history is ordered, not
  timestamped.
- The effect of future clearances: every predicted feature assumes that nothing more is issued.
  [Rollout search](search.md) is the mechanism that evaluates sequences of clearances.

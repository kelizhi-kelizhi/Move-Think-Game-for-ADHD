# Move & Think ADHD Training Game

This is a zero-dependency local web prototype. Open `index.html` in a browser to run it.

## Current Rules

- V3 uses a forest route board with a static route event plan generated before each run.
- The right side shows a timed GO / NO-GO cue.
- V3 lets you configure two input groups. Each group contains two active keys.
- The training is designed around physical movement: place group A and group B inputs far apart, such as a distant keyboard/mouse pair or two separated foot pedals.
- By default, group A is `Left Shift` / `Right Shift`, and group B is mouse left / mouse right.
- `AB alternation` controls how strongly the next cue switches groups. At `0`, all four active keys are fully random. At `1`, the next cue always switches to the other group.
- GO / NO-GO, displayed key, required action, and cue delay are generated for every route space when the run starts.
- During a run, each route space keeps its generated values. If the explorer moves back and revisits a space, the same cue and delay are used again.
- Route spaces can show generated wait time with color depth: shorter waits are lighter, longer waits are darker.
- On a correct action, the pixel explorer moves forward one space.
- On a wrong action or missed green GO cue, the explorer moves back one space.
- The explorer cannot move before the start.
- Routes can be longer than one screen. The board shows up to 42 spaces at once, then switches to the next page when the explorer reaches space 43, 85, and so on.
- The session ends when the explorer reaches the finish space.
- The route starts with the configured start hand for the first half, then switches to the other hand for the second half.
- The HUD highlights the current hand. The browser voice announces the start hand at the start and the other hand when crossing the halfway point.
- Hand voice prompts use the browser's built-in SpeechSynthesis voice when available, so no audio files need to be downloaded.
- Purple route spaces are reverse zones: green cues use the matching slot in the other input group, so A1 maps to B1 and A2 maps to B2.
- Blue route spaces are 1-back zones: while standing on that space, perform the previous route space's generated cue, including both GO and NO-GO.
- 1-back only applies while standing on a 1-back space. Leaving the zone restores normal current-cue rules.
- Starting a run requests fullscreen plus pointer lock and hides the cursor; press `Space` to pause or resume, and press `Esc` to exit the run and return to settings.
- Setting labels include hover/focus help for what each value changes.

## Inputs

Right-side GO / NO-GO:
- The four keys selected in the Input Groups settings.
- Input group slots can be left empty, but each group needs at least one key and at least one A/B matching slot pair.
- Available choices are left/right Shift, left/right Ctrl, left/right Alt, mouse left, and mouse right.

## Settings

- `Cue interval ms`: minimum delay after the previous cue is resolved before the next cue appears.
- `Random jitter ms`: extra random delay added to the cue interval. For example, `1500` plus `500` means the next cue appears after `1500-2000ms`.
- `Delay block size`: number of consecutive route spaces that share one generated cue delay. For example, `10` means spaces 1-10 share one delay, spaces 11-20 share another, and so on.
- `Delay balance`: value from `0` to `1`. At `0`, each delay block is independently random. At `1`, the delay block values are evenly spaced between `Cue interval ms` and `Cue interval ms + Random jitter ms`, then shuffled across the route.
- `Delay color strength`: value from `0` to `1`. At `0`, wait time does not affect route space brightness. At `1`, short-wait spaces are lightest and long-wait spaces are darkest.
- `Response window ms`: time allowed for the cue.
- `Path length`: number of route spaces from start to finish. Values up to `420` are allowed; only the current page of 42 spaces is displayed during a run.
- `Red light rate %`: chance that a cue is NO-GO.
- `Reverse zones`: number of purple reverse segments on the route. Reverse uses group-slot mapping, not physical left/right mapping.
- `1-back zones`: number of blue 1-back segments on the route.
- `AB alternation`: value from `0` to `1`. If the previous displayed key was in group A, the next cue chooses group B with probability `0.5 + 0.5 * AB alternation`; the same formula applies in reverse.
- `Start hand`: whether the first half of the route starts as left-hand or right-hand practice.
- `Input Groups`: non-overlapping key choices split into group A and group B. Empty slots are allowed; A1/B1 and A2/B2 are the reverse pairs.

Before training, make sure the space around the player is clear. Put group A and group B far enough apart that switching groups requires a deliberate body movement.

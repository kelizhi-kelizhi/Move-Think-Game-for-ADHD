# Move & Think ADHD Training Game

This is a zero-dependency local web prototype. Open `index.html` in a browser to run it.

## Current Rules

- V2 uses a forest route board instead of the old memory sequence board.
- The right side shows a timed GO / NO-GO cue.
- V2.1 lets you configure two input groups. Each group contains two active keys.
- By default, group A is `Left Shift` / `Right Shift`, and group B is mouse left / mouse right.
- `AB alternation` controls how strongly the next cue switches groups. At `0`, all four active keys are fully random. At `1`, the next cue always switches to the other group.
- On a correct action, the pixel explorer moves forward one space.
- On a wrong action or missed green GO cue, the explorer moves back one space.
- The explorer cannot move before the start.
- Routes can be longer than one screen. The board shows up to 42 spaces at once, then switches to the next page when the explorer reaches space 43, 85, and so on.
- The session ends when the explorer reaches the finish space.
- The first half of the route is marked as left-hand practice, and the second half is marked as right-hand practice.
- The HUD highlights the current hand. The browser voice says "left hand" at the start and "right hand" when crossing the halfway point.
- Hand voice prompts use the browser's built-in SpeechSynthesis voice when available, so no audio files need to be downloaded.
- Purple route spaces are reverse zones: green left/right inputs are reversed while standing on that space.
- Blue route spaces are 1-back zones: while standing on that space, perform the previous displayed cue, including both GO and NO-GO.
- In a 1-back zone, the current displayed cue is stored for the next 1-back check.
- 1-back only applies while standing on a 1-back space. Leaving the zone restores normal current-cue rules.
- Starting a run requests fullscreen plus pointer lock and hides the cursor; press `Esc` to exit the run and return to settings.

## Inputs

Right-side GO / NO-GO:
- The four keys selected in the Input Groups settings.
- Available choices are left/right Shift, left/right Ctrl, left/right Alt, mouse left, and mouse right.

## Settings

- `Cue interval ms`: minimum delay after the previous cue is resolved before the next cue appears.
- `Random jitter ms`: extra random delay added to the cue interval. For example, `1500` plus `500` means the next cue appears after `1500-2000ms`.
- `Response window ms`: time allowed for the cue.
- `Path length`: number of route spaces from start to finish. Values up to `420` are allowed; only the current page of 42 spaces is displayed during a run.
- `Red light rate %`: chance that a cue is NO-GO.
- `Reverse zones`: number of purple reverse segments on the route.
- `1-back zones`: number of blue 1-back segments on the route.
- `AB alternation`: value from `0` to `1`. If the previous displayed key was in group A, the next cue chooses group B with probability `0.5 + 0.5 * AB alternation`; the same formula applies in reverse.
- `Input Groups`: four non-overlapping key choices split into group A and group B.

Before training, make sure the space around the player is clear and the mouse is fixed away from the computer.

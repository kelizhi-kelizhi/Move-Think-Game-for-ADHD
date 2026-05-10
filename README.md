# Move & Think ADHD Game

This is a zero-dependency local web prototype. Open `index.html` in a browser to run it.

This project is a personal/experimental game prototype for movement-based cognitive practice.

It is loosely inspired by research on integrated cognitive-motor exercise for ADHD, such as:

[Integrated cognitive-motor exercise for core symptoms and executive functions in children with attention deficit hyperactivity disorder: a randomized clinical trial](https://doi.org/10.1007/s12519-026-01019-4)

The published study involved a specific clinical protocol, participant group, supervision, training schedule, and outcome assessment. This game is only a simplified, home-playable prototype inspired by some general design ideas, such as combining physical movement with cognitive challenges.

This project is not a medical device and is not intended to diagnose, treat, cure, or prevent ADHD or any other medical condition. It does not guarantee improvements in attention, executive function, ADHD symptoms, or health outcomes.

If you have ADHD or other health concerns, please consult a qualified professional.

## Current Rules

- V6.1 uses a forest route board with a static route event plan generated before each run.
- During a run, a central pixel cue shows GO / NO-GO and abstract input slots such as `A1`, `B1`, `A2`, and `B2` instead of physical key names. Target slots fade out after the configured visible time.
- V6.1 lets you edit and save three custom settings sets. Defaults can be changed in `defaults.js`.
- The training is designed around physical movement: place group A and group B inputs far apart, such as a distant keyboard/mouse pair or two separated foot pedals.
- By default, group A is `Left Shift` / `Right Shift`, and group B is mouse left / mouse right.
- `AB alternation` controls how strongly the next cue switches groups. At `0`, all four active keys are fully random. At `1`, the next cue always switches to the other group.
- GO / NO-GO, displayed key sequence, required action sequence, and cue delay are generated for every route space when the run starts.
- During a run, each route space keeps its generated values. If the explorer moves back and revisits a space, the same cue and delay are used again.
- Route spaces can show generated wait time with color depth: shorter waits are lighter, longer waits are darker.
- On a correct action, the pixel explorer moves forward one space.
- On a wrong action or missed green GO cue, the explorer moves back one space.
- The explorer cannot move before the start.
- Routes can be longer than one screen. `Spaces per page` controls how many spaces are shown before the board switches to the next page.
- Later pages can require multi-key GO sequences. By default page 1 uses one key, page 2 uses two keys, and page 3+ uses up to three keys.
- When `Slot voice` is on, A1/B1/A2/B2 voice cues play during the GO / NO-GO response window. If the trial ends before the voice finishes, playback stops when the game returns to Ready.
- GO sequences use one response window per key. Pressing the correct key starts a fresh response window for the next key; the explorer moves only after the full sequence is completed.
- The first response window in each route space can be extended by a configured amount per displayed key. The default is `50ms` per key, and `0` disables the extra time.
- Adaptive response mode uses an N-up / 1-down rule. Complete green GO spaces in a row shrink both the base response window and the first-window bonus. One error grows both values. Correct NO-GO spaces do not count toward the streak, but false alarms count as errors.
- When adaptive response mode is on, each run starts from the configured response window and adjusts only within that run.
- The summary screen shows the final response window after the last adaptive update.
- Completed sessions are saved to local browser history and can be viewed from the settings screen.
- NO-GO sequences require no input for one response window, regardless of sequence length.
- The session ends when the explorer reaches the finish space.
- Purple route spaces are reverse zones: green cues use the matching slot in the other input group, so A1 maps to B1 and A2 maps to B2.
- Blue route spaces are 1-back zones: while standing on that space, perform the previous route space's generated cue sequence, including both GO and NO-GO.
- 1-back only applies while standing on a 1-back space. Leaving the zone restores normal current-cue rules.
- Starting a run requests fullscreen plus pointer lock and hides the cursor; press `Space` to pause or resume, and press `Esc` to exit the run and return to settings.
- Setting labels include hover/focus help for what each value changes.

## Inputs

GO / NO-GO inputs:
- The four keys selected in the Input Groups settings.
- Input group slots can be left empty, but each group needs at least one key and at least one A/B matching slot pair.
- Available choices are left/right Shift, left/right Ctrl, left/right Alt, mouse left, and mouse right.

## Settings

- `Custom 1` / `Custom 2` / `Custom 3`: saved setting slots stored in the browser. `Save` writes the current editor values to the selected slot.
- `Restore Defaults`: reloads the selected slot's default values into the editor without overwriting saved browser values unless you press `Save`.
- `defaults.js`: external default settings source. Edit `window.MOVE_THINK_DEFAULT_PRESET` to change the defaults used by `Restore Defaults` and first-time startup.
- `Cue interval ms`: minimum delay after the previous cue is resolved before the next cue appears.
- `Random jitter ms`: extra random delay added to the cue interval. For example, `1500` plus `500` means the next cue appears after `1500-2000ms`.
- `Delay block size`: number of consecutive route spaces that share one generated cue delay. For example, `10` means spaces 1-10 share one delay, spaces 11-20 share another, and so on.
- `Delay balance`: value from `0` to `1`. At `0`, each delay block is independently random. At `1`, the delay block values are evenly spaced between `Cue interval ms` and `Cue interval ms + Random jitter ms`, then shuffled across the route.
- `Delay color strength`: value from `0` to `1`. At `0`, wait time does not affect route space brightness. At `1`, short-wait spaces are lightest and long-wait spaces are darkest.
- `Response window ms`: time allowed for each GO key step, or the one NO-GO window.
- `First window bonus / key ms`: extra time added to the first response window in each route space for every displayed key. Later GO sequence steps use `Response window ms` without this bonus.
- `Adaptive window`: whether the game automatically scales `Response window ms` and `First window bonus / key ms`.
- `Correct streak to decrease`: number of complete green GO successes needed before the adaptive values shrink.
- `Decrease %`: percentage shrink applied after a correct streak.
- `Increase %`: percentage growth applied after one error.
- `Cue visible ms`: total time the target slot sequence stays visible during the response window. It must be shorter than `Response window ms`.
- `Slot voice`: whether to play A1/B1/A2/B2 voice cues during the response window.
- `Sequence start page`: first page where sequence length grows beyond one key.
- `Sequence page step`: number of pages between each sequence length increase.
- `Max sequence length`: cap on keys in one route-space sequence.
- `Spaces per page`: number of route spaces shown on each page.
- `Route pages`: total number of route pages. Total route spaces equal `Spaces per page` multiplied by `Route pages`, up to `420`.
- `Red light rate %`: chance that a cue is NO-GO.
- `Reverse zones`: number of purple reverse segments on the route. Reverse uses group-slot mapping, not physical left/right mapping.
- `1-back zones`: number of blue 1-back segments on the route.
- `AB alternation`: value from `0` to `1`. If the previous displayed key was in group A, the next generated key chooses group B with probability `0.5 + 0.5 * AB alternation`; the same formula applies in reverse. Multi-key sequences apply this continuously across keys and across route spaces.
- `Input Groups`: non-overlapping key choices split into group A and group B. Empty slots are allowed; A1/B1 and A2/B2 are the reverse pairs.

Before training, make sure the space around the player is clear. Put group A and group B far enough apart that switching groups requires a deliberate body movement.

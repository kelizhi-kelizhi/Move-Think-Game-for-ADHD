# Move & Think ADHD Training Game

This is a zero-dependency local web prototype. Open `index.html` in a browser to run it.

## Current Rules

- Pick a system preset or one of three custom presets.
- Clicking a preset fills the current editor; every number remains manually editable.
- Save writes the current editor values into a custom preset slot using `localStorage`.
- Simple Web Audio cues can be toggled on/off and tested from the settings screen.
- The game view uses a pixel platform style: only nearby route cells are shown, hidden cells are question bricks, and correct memory input makes the player jump forward.
- At game start, the board generates `rounds * memory sequence` hidden key cells.
- Set `Memory sequence` to `0` for right-side-only mode with no memory board.
- A right-side success reveals the next board cell briefly, then covers it again.
- A right-side error is recorded but does not reveal or advance the board.
- During memory input, the current cell is highlighted but the key stays hidden.
- A memory error is recorded but does not reveal the answer and does not move the player.
- Purple border means poison reversal for the right-side go task only.
- Starting a run requests fullscreen plus pointer lock and hides the cursor; press `Esc` to exit the run and return to settings.

## Inputs

Right-side go/no-go:
- `Left Shift`
- `Right Shift`
- Mouse left button
- Mouse right button

Left-side memory board:
- `Space`
- Mouse middle button

Before training, make sure the space around the player is clear and the mouse is fixed away from the computer.

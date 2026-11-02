# Mouse Recorder

Records mouse movement, clicks, and scrolling, then replays the sequence using global hotkeys.

## Install

```bash
python3 -m pip install -r requirements.txt
```

On Linux, `pynput` requires an X11 session. Wayland may prevent global input capture. On Windows or macOS, install the dependency and grant accessibility/input permissions if prompted.

## Run

```bash
python3 autoclicker.py
```

- `F6`: start or stop recording (starting a new recording replaces the previous one)
- `F7`: play the recording
- `F8`: stop playback
- `Esc`: quit

The recording is kept in memory and is cleared when the program exits.
import threading
import time

from pynput import keyboard, mouse


class MouseRecorder:
    def __init__(self):
        self.mouse = mouse.Controller()
        self.events = []
        self.recording = False
        self.recording_started = 0.0
        self.lock = threading.Lock()
        self.hotkeys_down = set()
        self.playback_stop = threading.Event()
        self.playback_thread = None

    def _record(self, event):
        with self.lock:
            if self.recording:
                event["time"] = time.monotonic() - self.recording_started
                self.events.append(event)

    def on_move(self, x, y):
        self._record({"type": "move", "x": x, "y": y})

    def on_click(self, x, y, button, pressed):
        self._record(
            {
                "type": "click",
                "x": x,
                "y": y,
                "button": button.name,
                "pressed": pressed,
            }
        )

    def on_scroll(self, x, y, dx, dy):
        self._record({"type": "scroll", "x": x, "y": y, "dx": dx, "dy": dy})

    def toggle_recording(self):
        with self.lock:
            if self.playback_thread and self.playback_thread.is_alive():
                print("Stop playback before recording.")
                return
            if self.recording:
                self.recording = False
                count = len(self.events)
                print(f"Recording stopped. Captured {count} events.")
                return

            self.events.clear()
            self.recording_started = time.monotonic()
            self.recording = True
            print("Recording started. Press F6 again to finish.")

    def start_playback(self):
        with self.lock:
            if self.recording:
                self.recording = False
                print("Recording stopped.")
            if not self.events:
                print("Nothing recorded yet. Press F6 to record first.")
                return
            if self.playback_thread and self.playback_thread.is_alive():
                print("Playback is already running. Press F8 to stop it.")
                return

            events = list(self.events)
            self.playback_stop.clear()
            self.playback_thread = threading.Thread(
                target=self._play, args=(events,), daemon=True
            )
            self.playback_thread.start()
            print("Playback started. Press F8 to stop.")

    def _play(self, events):
        started = time.monotonic()
        held_buttons = set()
        try:
            for event in events:
                delay = event["time"] - (time.monotonic() - started)
                if delay > 0 and self.playback_stop.wait(delay):
                    break
                if self.playback_stop.is_set():
                    break

                if event["type"] == "move":
                    self.mouse.position = (event["x"], event["y"])
                elif event["type"] == "click":
                    self.mouse.position = (event["x"], event["y"])
                    button = getattr(mouse.Button, event["button"])
                    if event["pressed"]:
                        self.mouse.press(button)
                        held_buttons.add(button)
                    else:
                        self.mouse.release(button)
                        held_buttons.discard(button)
                elif event["type"] == "scroll":
                    self.mouse.position = (event["x"], event["y"])
                    self.mouse.scroll(event["dx"], event["dy"])
        finally:
            for button in held_buttons:
                self.mouse.release(button)
            print("Playback stopped.")

    def stop_playback(self):
        if self.playback_thread and self.playback_thread.is_alive():
            self.playback_stop.set()

    def on_key_press(self, key):
        if key not in (keyboard.Key.f6, keyboard.Key.f7, keyboard.Key.f8, keyboard.Key.esc):
            return
        if key in self.hotkeys_down:
            return
        self.hotkeys_down.add(key)

        if key == keyboard.Key.f6:
            self.toggle_recording()
        elif key == keyboard.Key.f7:
            self.start_playback()
        elif key == keyboard.Key.f8:
            self.stop_playback()
        elif key == keyboard.Key.esc:
            self.stop_playback()
            return False

    def on_key_release(self, key):
        self.hotkeys_down.discard(key)


def main():
    recorder = MouseRecorder()
    print("Mouse recorder ready")
    print("F6: start/stop recording | F7: play | F8: stop playback | Esc: quit")
    try:
        with mouse.Listener(
            on_move=recorder.on_move,
            on_click=recorder.on_click,
            on_scroll=recorder.on_scroll,
        ) as mouse_listener:
            with keyboard.Listener(
                on_press=recorder.on_key_press,
                on_release=recorder.on_key_release,
            ) as keyboard_listener:
                keyboard_listener.join()
            mouse_listener.stop()
    except Exception as error:
        raise SystemExit(
            f"Could not access global input: {error}\n"
            "On Linux, use an X11 session. Wayland may block global input capture."
        ) from error


if __name__ == "__main__":
    main()
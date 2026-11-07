// Station sound effects, all from Pixabay (Pixabay Content License):
//   meow  - "Cat meow" by Dragon Studio
//   pop   - "Pop" by Dragon Studio (trimmed to the pop itself)
//   sparkle-1..3 - "Fairy sparkle" by humordome, "Sparkle" by koiroylers,
//                  "Twinkle sparkle" by shidenbeatsmusic (played in rotation)
// Every sound respects the mute toggle and only plays after a visitor action.
import { ASSET } from './art';

const KEY = 'witchy-sound';
export const soundOn = () => { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } };
export const setSound = (on: boolean) => { try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* ignore */ } };

const cache = new Map<string, HTMLAudioElement>();
function play(file: string, volume: number) {
  if (!soundOn()) return;
  let a = cache.get(file);
  if (!a) { a = new Audio(ASSET(file)); a.preload = 'auto'; cache.set(file, a); }
  a.volume = volume;
  a.currentTime = 0;
  void a.play().catch(() => undefined);
}

export const playMeow = () => play('meow.mp3', 0.5);
export const playPop = () => play('pop.mp3', 0.45);

let sparkle = 0;
export const playSparkle = () => { play(`sparkle-${(sparkle % 3) + 1}.mp3`, 0.55); sparkle++; };

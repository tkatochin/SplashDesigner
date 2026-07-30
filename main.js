import { Engine } from "./src/core/Engine.js?v=0022a";
import { SceneManager } from "./src/core/SceneManager.js";
import { EntranceScene } from "./src/scenes/EntranceScene.js?v=0012l";
import { mountCreditsOverlay } from "./src/ui/CreditsOverlay.js?v=0012c";

const manager = new SceneManager();
const engine = new Engine(manager);
mountCreditsOverlay();

// Let the browser present Loading before beginning visual asset work.
await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

const entrance = new EntranceScene(engine);
await entrance.noren.ready;
manager.change(entrance);
engine.start(()=>entrance.markEntranceReady?.());

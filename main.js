import { Engine } from "./src/core/Engine.js?v=0022a";
import { SceneManager } from "./src/core/SceneManager.js";
import { EntranceScene } from "./src/scenes/EntranceScene.js?v=0023b";
import { mountCreditsOverlay } from "./src/ui/CreditsOverlay.js?v=0007e";

const manager = new SceneManager();
const engine = new Engine(manager);
mountCreditsOverlay();

const entrance = new EntranceScene(engine);
manager.change(entrance);

engine.start(()=>entrance.markEntranceReady?.());

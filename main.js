import { Engine } from "./src/core/Engine.js?v=0006c";
import { SceneManager } from "./src/core/SceneManager.js";
import { EntranceScene } from "./src/scenes/EntranceScene.js?v=0006v";

const manager = new SceneManager();
const engine = new Engine(manager);

manager.change(new EntranceScene(engine));

engine.start();

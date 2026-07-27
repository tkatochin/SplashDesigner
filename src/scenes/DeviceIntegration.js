import { DeviceLayer } from "./DeviceLayer.js";

/**
 * DeviceIntegration
 * Mix-in style helper to connect DeviceLayer to EntranceScene.
 */
export function attachDeviceLayer(scene){
  scene.devices = new DeviceLayer();

  const canvas = scene.engine.renderer.canvas;

  const onPointerDown = (e)=>{
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    scene.devices.pointerDown(x,y,performance.now());
  };

  canvas.addEventListener("pointerdown", onPointerDown);

  scene.renderDevices = (ctx)=>{
    scene.devices.render(ctx, performance.now());
  };

  scene.disposeDevices = ()=>{
    canvas.removeEventListener("pointerdown", onPointerDown);
  };
}

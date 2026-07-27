// Patch0019 stub
export function installPatch0019(scene){
  scene.effects ??= {};
  scene.effects.madmax = false;
  scene.effects.redLight = false;
  scene.effects.vibra = false;

  scene.startBGM = ()=>scene.audio?.play?.("bgm");
  scene.stopBGM  = ()=>scene.audio?.stop?.("bgm");

  scene.enableMadMax = ()=>scene.effects.madmax = true;
  scene.enableRedLight = ()=>scene.effects.redLight = true;
  scene.enableVibra = ()=>scene.effects.vibra = true;
}

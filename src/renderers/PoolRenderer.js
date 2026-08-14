import { ReservoirSurface } from "../effects/ReservoirSurface.js?v=0006d";
import { OverflowEffect } from "../effects/OverflowEffect.js?v=0023u";
import { OverflowRenderer } from "./OverflowRenderer.js?v=0017v";
import { WaterReflectionRenderer } from "./WaterReflectionRenderer.js?v=0020d";
import { DrainGrateRenderer } from "./DrainGrateRenderer.js?v=0023l";
import { WaterTemperature } from "../devices/WaterTemperature.js?v=0010a";
import { ThermometerRenderer } from "./ThermometerRenderer.js?v=0024c";
import { SteamRenderer } from "./SteamRenderer.js?v=0010n";
import { VibraSensor } from "../devices/VibraSensor.js?v=0011i";
import { VibraSensorRenderer } from "./VibraSensorRenderer.js?v=0024c";
import { VibraBubbleRenderer } from "./VibraBubbleRenderer.js?v=0011l";
import { MADMAXDevice } from "../devices/MADMAXDevice.js?v=0012h";
import { MADMAXOverflowEffect } from "../effects/MADMAXOverflowEffect.js?v=0012c";
import { MADMAXButtonRenderer } from "./MADMAXButtonRenderer.js?v=0012g";
import { MADMAXWaterRenderer } from "./MADMAXWaterRenderer.js?v=0012j";

/** Draws the bath as a physical facility seen from a standing visitor. */
export class PoolRenderer {
  constructor(){
    this.surface=new ReservoirSurface();
    this.overflows=[];
    this.overflowRenderer=new OverflowRenderer();
    this.reflectionRenderer=new WaterReflectionRenderer();
    this.drainRenderer=new DrainGrateRenderer();
    this.temperature=new WaterTemperature();
    this.thermometerRenderer=new ThermometerRenderer();
    this.steamRenderer=new SteamRenderer();
    this.vibraSensor=new VibraSensor();
    this.vibraSensorRenderer=new VibraSensorRenderer();
    this.vibraBubbleRenderer=new VibraBubbleRenderer();
    this.vibraFlowElapsed=0;
    this.vibraFlowStrength=0;
    this.madmax=new MADMAXDevice();
    this.madmaxOverflow=new MADMAXOverflowEffect();
    this.madmaxButtonRenderer=new MADMAXButtonRenderer();
    this.madmaxWaterRenderer=new MADMAXWaterRenderer();
    this.madmaxFlowElapsed=0;
  }

  update(dt){
    this.surface.update(dt);
    this.temperature.update(dt);
    this.steamRenderer.update(dt);
    this.vibraSensor.update(dt);
    this.vibraBubbleRenderer.update(dt,this.vibraSensor.active,this.vibraSensor.spread);
    this.#updateVibraFlow(dt);
    this.madmax.update(dt);
    this.madmaxOverflow.update(dt,this.madmax.overflowHolding);
    this.madmaxWaterRenderer.update(dt,this.madmax);
    this.#updateMADMAXFlow(dt);
    for(const overflow of this.overflows)overflow.update(dt);
    this.overflows=this.overflows.filter(overflow=>overflow.active);
  }

  waterPointAt(x,y,width,height){
    const water=this.geometry(width,height).water;
    const v=(y-water.backL.y)/(water.nearL.y-water.backL.y);
    if(v<0||v>1)return null;
    const left=this.#mix(water.backL,water.nearL,v);
    const right=this.#mix(water.backR,water.nearR,v);
    const u=(x-left.x)/(right.x-left.x);
    return u>=0&&u<=1?{u,v}:null;
  }

  disturbAt(x,y,width,height,power=.045){
    const point=this.waterPointAt(x,y,width,height);
    if(point){
      this.surface.disturb(point.u,point.v,power);
      if(this.temperature.steamLevel>0&&power>=.04)this.steamRenderer.splash(power/.045);
    }
    return point;
  }

  thermometerHitTest(x,y,width,height){return this.thermometerRenderer.hitTest(x,y,width,height);}
  cycleTemperature(){this.temperature.cycle();}
  toggleThermometerDisplay(){this.temperature.toggleDisplay();}
  boostSteam(strength=1){if(this.temperature.steamLevel>0)this.steamRenderer.splash(strength);}
  vibraSensorHitTest(x,y,width,height){
    const g=this.geometry(width,height);
    return this.vibraSensorRenderer.hitTest(x,y,g,width,height);
  }
  startVibra(){return this.vibraSensor.start();}
  madmaxButtonHitTest(x,y,width,height){return this.madmaxButtonRenderer.hitTest(x,y,width,height);}
  pressMADMAX(){return this.madmax.press();}
  cancelMADMAXPress(){return this.madmax.cancelPress();}
  activateMADMAX(){return this.madmax.release(this.temperature.mode.id);}

  triggerOverflow({strength=1,origin={u:.5,v:.5}}={}){
    const overflow=new OverflowEffect();
    overflow.trigger({strength,origin});
    this.overflows.push(overflow);
    if(this.overflows.length>3)this.overflows.shift();
    for(let index=0;index<7;index++){
      const u=.08+index*.14;
      this.surface.disturb(u,.3+Math.abs(.5-u)*.42,index%2?-.13:.16);
    }
    return true;
  }

  render(ctx,width,height){
    const g=this.geometry(width,height);
    const leftStructure=this.#leftStructure(g,width);
    g.leftOpening={
      ...leftStructure,
      sillLeftY:this.#projectYAtX({x:leftStructure.pillarLeft,y:g.water.backL.y},g.vanishing,0)
    };
    this.#wall(ctx,width,height,g);
    this.madmaxButtonRenderer.render(ctx,width,height,this.madmax.pressed);
    this.#rimsBackAndSides(ctx,g);
    this.drainRenderer.renderBase(ctx,g);
    this.#water(ctx,g,width,height);
    this.madmaxWaterRenderer.renderColumn(ctx,g,width,height,this.madmax,performance.now());
    this.#nearRim(ctx,g);
    this.#rimSurfaceLines(ctx,width,height,g);
    this.#steps(ctx,width,height,g);
    const time=performance.now();
    for(const overflow of this.overflows){
      this.overflowRenderer.render(ctx,g,width,height,overflow,time);
    }
    this.overflowRenderer.render(ctx,g,width,height,this.madmaxOverflow,time);
    // Vibra bubbles must sit above overflow water when both effects overlap.
    this.vibraBubbleRenderer.render(ctx,g,width);
    // The sensor is a solid object above the rim. Keep grout and overflowing
    // water behind it instead of letting either sheet cross its front faces.
    this.vibraSensorRenderer.render(ctx,g,width,height,this.vibraSensor.active,time);
    this.thermometerRenderer.render(ctx,width,height,this.temperature,g);
    const drainAmount=Math.min(1,this.overflows.reduce((sum,overflow)=>sum+overflow.levels().rim,0)+this.madmaxOverflow.levels().rim);
    this.drainRenderer.renderOpenings(ctx,g,drainAmount);
    this.madmaxWaterRenderer.renderImpact(ctx,g,width,height,this.madmax,time);
    this.steamRenderer.render(ctx,g,width,height,this.temperature.steamLevel,time);
    this.#leftPillar(ctx,width,height,g);
    this.#handrail(ctx,width,height,g);
  }

  geometry(w,h){
    const wallBottom=h*.52;
    const vanishing={x:w*.5,y:h*.26};
    const outerNearY=h*.80;
    const backY=wallBottom;
    const waterNearY=backY+(outerNearY-backY)*.67;
    const stepTopY=h*.76;
    const frontRimHeight=stepTopY-waterNearY;
    const waterNearL={x:frontRimHeight,y:waterNearY};
    const waterNearR={x:w-frontRimHeight,y:waterNearY};
    const outerAtWaterL=0;
    const outerAtWaterR=w;
    const outerRatio=(waterNearY-vanishing.y)/(outerNearY-vanishing.y);
    const outerNearL={x:vanishing.x+(outerAtWaterL-vanishing.x)/outerRatio,y:outerNearY};
    const outerNearR={x:vanishing.x+(outerAtWaterR-vanishing.x)/outerRatio,y:outerNearY};
    const waterBackY=waterNearY-h*.15;
    const wallGuideY=h*1.04;
    const leftGapNear={x:w*-.48,y:wallGuideY};
    const rightGapNear={x:w*1.48,y:wallGuideY};
    return {
      wallBottom,
      vanishing,
      sideWalls:{
        leftNear:leftGapNear,rightNear:rightGapNear,
        leftCorner:{x:this.#projectX(leftGapNear,vanishing,wallBottom),y:wallBottom},
        rightCorner:{x:this.#projectX(rightGapNear,vanishing,wallBottom),y:wallBottom}
      },
      outer:{
        backL:{x:this.#projectX(outerNearL,vanishing,backY),y:backY},
        backR:{x:this.#projectX(outerNearR,vanishing,backY),y:backY},
        nearR:outerNearR,
        nearL:outerNearL
      },
      water:{
        backL:{x:this.#projectX(waterNearL,vanishing,waterBackY),y:waterBackY},
        backR:{x:this.#projectX(waterNearR,vanishing,waterBackY),y:waterBackY},
        nearR:waterNearR,
        nearL:waterNearL
      },
      stepTop:stepTopY,
      steps:{top:stepTopY,treadTop:h*.80,riser2Top:h*.88,floorTop:h*.92}
    };
  }

  #wall(ctx,w,h,g){
    const gradient=ctx.createLinearGradient(0,0,0,g.wallBottom);
    gradient.addColorStop(0,"#d8d4cb");gradient.addColorStop(1,"#aaa9a4");
    ctx.fillStyle=gradient;ctx.fillRect(0,0,w,g.wallBottom+h*.15);
    ctx.strokeStyle="rgba(91,99,101,.32)";ctx.lineWidth=1;
    const tileW=Math.max(58,w/12),tileH=Math.max(38,h*.075);
    for(let y=0,row=0;y<g.wallBottom+h*.12;y+=tileH,row++){
      const offset=(row%2)*tileW*.5;
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
      for(let x=-offset;x<w;x+=tileW){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+tileH);ctx.stroke();}
    }
    ctx.fillStyle=this.#stoneGradient(ctx,g);ctx.fillRect(0,g.wallBottom,w,h-g.wallBottom);
    const s=g.sideWalls;
    this.#leftWindow(ctx,w,h,g);
    const sideShade=ctx.createLinearGradient(s.rightCorner.x,0,w,0);
    sideShade.addColorStop(0,"#c9cac3");sideShade.addColorStop(.55,"#deddd5");sideShade.addColorStop(1,"#e7e3d8");
    ctx.fillStyle=sideShade;
    ctx.beginPath();ctx.moveTo(w,0);ctx.lineTo(s.rightCorner.x,0);ctx.lineTo(s.rightCorner.x,s.rightCorner.y);ctx.lineTo(s.rightNear.x,s.rightNear.y);ctx.lineTo(w,h);ctx.closePath();ctx.fill();
    ctx.strokeStyle="rgba(70,76,76,.4)";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(s.rightCorner.x,0);ctx.lineTo(s.rightCorner.x,s.rightCorner.y);ctx.lineTo(s.rightNear.x,s.rightNear.y);ctx.stroke();
    this.#rightWallStoneLines(ctx,w,h,g,tileH);
  }

  #rightWallStoneLines(ctx,w,h,g,tileH){
    const s=g.sideWalls,cornerX=s.rightCorner.x,v=g.vanishing;
    const courseYAtX=(backY,x)=>v.y+(backY-v.y)*(x-v.x)/(cornerX-v.x);
    ctx.save();
    ctx.beginPath();ctx.moveTo(w,0);ctx.lineTo(cornerX,0);ctx.lineTo(cornerX,s.rightCorner.y);
    ctx.lineTo(s.rightNear.x,s.rightNear.y);ctx.lineTo(w,h);ctx.closePath();ctx.clip();
    ctx.strokeStyle="rgba(91,99,101,.30)";ctx.lineWidth=1;
    const courses=[];
    for(let y=0;y<g.wallBottom+h*.16;y+=tileH)courses.push(y);
    for(const y of courses){
      ctx.beginPath();ctx.moveTo(cornerX,y);ctx.lineTo(w,courseYAtX(y,w));ctx.stroke();
    }
    for(let row=0;row<courses.length-1;row++){
      const fraction=row%2?.43:.68;
      const x=cornerX+(w-cornerX)*fraction;
      const top=courseYAtX(courses[row],x),bottom=courseYAtX(courses[row+1],x);
      ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();
    }
    ctx.restore();
  }

  #leftWindow(ctx,w,h,g){
    const {backLeft,sillLeftY}=g.leftOpening;
    const light=ctx.createLinearGradient(0,0,Math.max(1,backLeft),0);
    light.addColorStop(0,"#fff4cf");light.addColorStop(.46,"#edf5ed");light.addColorStop(1,"#c9dce1");
    ctx.fillStyle=light;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(backLeft,0);ctx.lineTo(backLeft,g.wallBottom);
    ctx.lineTo(0,sillLeftY);ctx.closePath();ctx.fill();
  }

  #leftPillar(ctx,w,h,g){
    const {pillarLeft,pillarRight,backRight}=g.leftOpening;
    const frontY=g.water.backL.y;

    // Flat faces, rather than a cylindrical gradient, make the projection read as a square pillar.
    ctx.fillStyle="#b7b5ad";
    ctx.fillRect(pillarLeft,0,pillarRight-pillarLeft,frontY);
    ctx.fillStyle="#858a86";
    this.#quad(ctx,
      {x:pillarRight,y:0},{x:backRight,y:0},
      {x:backRight,y:g.wallBottom},{x:pillarRight,y:frontY}
    );ctx.fill();
    ctx.strokeStyle="rgba(62,69,68,.52)";ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(pillarRight,0);ctx.lineTo(pillarRight,frontY);ctx.stroke();
    ctx.strokeStyle="rgba(58,64,63,.46)";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(pillarLeft,frontY);ctx.lineTo(pillarRight,frontY);ctx.stroke();

    const frameWidth=Math.max(5,w*.012);
    ctx.lineCap="square";
    ctx.strokeStyle="rgba(83,91,90,.48)";ctx.lineWidth=frameWidth+2;
    ctx.beginPath();ctx.moveTo(pillarLeft,0);ctx.lineTo(pillarLeft,frontY);ctx.stroke();
    ctx.strokeStyle="#d9d8cf";ctx.lineWidth=frameWidth;
    ctx.beginPath();ctx.moveTo(pillarLeft,0);ctx.lineTo(pillarLeft,frontY);ctx.stroke();
  }

  #rimsBackAndSides(ctx,g){
    const o=g.outer,w=g.water;
    ctx.fillStyle=this.#stoneGradient(ctx,g);
    this.#quad(ctx,o.backL,o.backR,w.backR,w.backL);ctx.fill();
    this.#quad(ctx,o.backL,w.backL,w.nearL,o.nearL);ctx.fill();
    this.#quad(ctx,w.backR,o.backR,o.nearR,w.nearR);ctx.fill();

  }

  #water(ctx,p,width,h){
    const w=p.water;
    ctx.save();this.#quad(ctx,w.backL,w.backR,w.nearR,w.nearL);ctx.clip();
    const water=ctx.createLinearGradient(0,w.backL.y,0,w.nearL.y);
    water.addColorStop(0,"#249db7");water.addColorStop(.5,"#087fa8");water.addColorStop(1,"#045f82");
    ctx.fillStyle=water;ctx.fillRect(0,w.backL.y,Math.max(w.nearR.x,w.backR.x),w.nearL.y-w.backL.y+h*.06);

    this.reflectionRenderer.render(ctx,p,width,h,this.surface);
    const daylight=ctx.createLinearGradient(0,0,width*.55,0);
    daylight.addColorStop(0,"rgba(255,247,205,.18)");daylight.addColorStop(1,"rgba(255,247,205,0)");
    ctx.fillStyle=daylight;ctx.fillRect(0,w.backL.y,width*.55,w.nearL.y-w.backL.y);
    const sheen=ctx.createLinearGradient(w.nearL.x,w.nearL.y,w.backR.x,w.backR.y);
    sheen.addColorStop(0,"rgba(255,255,255,.04)");sheen.addColorStop(.48,"rgba(255,255,255,.24)");sheen.addColorStop(.58,"rgba(255,255,255,.03)");
    ctx.fillStyle=sheen;ctx.fillRect(0,w.backL.y,Math.max(w.nearR.x,w.backR.x),h);
    ctx.restore();
  }

  #nearRim(ctx,g){
    const o=g.outer,w=g.water;
    ctx.fillStyle=this.#stoneGradient(ctx,g);this.#quad(ctx,w.nearL,w.nearR,o.nearR,o.nearL);ctx.fill();
    ctx.strokeStyle="rgba(210,236,235,.48)";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(w.nearL.x,w.nearL.y);ctx.lineTo(w.nearR.x,w.nearR.y);ctx.stroke();
  }

  #rimSurfaceLines(ctx,w,h,g){
    const o=g.outer,water=g.water;
    ctx.strokeStyle="rgba(213,219,210,.28)";ctx.lineWidth=1;
    for(let x=0;x<=w;x+=w/3.25){
      const anchor={x,y:h};
      ctx.beginPath();
      ctx.moveTo(this.#projectX(anchor,g.vanishing,water.nearL.y),water.nearL.y);
      ctx.lineTo(this.#projectX(anchor,g.vanishing,o.nearL.y),o.nearL.y);ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this.#projectX(anchor,g.vanishing,o.backL.y),o.backL.y);
      ctx.lineTo(this.#projectX(anchor,g.vanishing,water.backL.y),water.backL.y);ctx.stroke();
    }
    const sideYs=[water.backL.y,this.#mix(o.backL,o.nearL,.34).y,water.nearL.y];
    for(const y of sideYs){
      const rightWall=this.#pointAtY(g.sideWalls.rightCorner,g.sideWalls.rightNear,y);
      const rightInner=this.#pointAtY(water.backR,water.nearR,y);
      ctx.beginPath();ctx.moveTo(rightInner.x,y);ctx.lineTo(rightWall.x,y);ctx.stroke();
    }
  }

  #steps(ctx,w,h,g){
    const {top,treadTop,riser2Top,floorTop}=g.steps;
    ctx.fillStyle=this.#stoneGradient(ctx,g);
    ctx.fillRect(0,treadTop,w,riser2Top-treadTop);
    ctx.fillRect(0,floorTop,w,h-floorTop);
    ctx.fillStyle="#555b59";
    ctx.fillRect(0,top,w,treadTop-top);
    ctx.fillRect(0,riser2Top,w,floorTop-riser2Top);

    ctx.strokeStyle="rgba(218,222,214,.27)";ctx.lineWidth=1;
    for(let x=0;x<=w;x+=w/3.25){
      const bottom={x,y:h};
      const rimX=this.#projectX(bottom,g.vanishing,top);
      const riser2X=this.#projectX(bottom,g.vanishing,riser2Top);
      ctx.beginPath();
      ctx.moveTo(rimX,top);ctx.lineTo(rimX,treadTop);
      ctx.lineTo(riser2X,riser2Top);
      ctx.lineTo(riser2X,floorTop);
      ctx.lineTo(x,h);ctx.stroke();
    }
    ctx.beginPath();
    for(const y of [top,treadTop,riser2Top,floorTop]){ctx.moveTo(0,y);ctx.lineTo(w,y);}
    ctx.stroke();

  }

  #handrail(ctx,w,h,g){
    const frontBase={x:w*.05,y:h*.985};
    const farBaseY=g.water.nearL.y-h*.012;
    const farX=this.#projectX(frontBase,g.vanishing,farBaseY);
    // The rear post meets the lower end of a true upper semicircular bend;
    // both horizon endpoints share the same height before the sloped rail joins.
    const railStart={x:farX-w*.08,y:h*.635};
    const farShoulder={x:farX,y:h*.545};
    const cornerRadius=Math.max(10,w*.018);
    const railEnd={
      x:frontBase.x+cornerRadius,
      y:this.#projectYAtX(railStart,g.vanishing,frontBase.x+cornerRadius)
    };
    const nearJoin={x:frontBase.x,y:h*.81};
    const railWidth=Math.max(8,w*.010);
    ctx.save();
    ctx.fillStyle="rgba(35,44,46,.5)";
    ctx.beginPath();ctx.ellipse(frontBase.x,frontBase.y+2,railWidth*1.15,railWidth*.82,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
    this.#railStroke(ctx,w,h,railWidth,frontBase,nearJoin,farX,farBaseY,farShoulder,railStart);
  }

  #railStroke(ctx,w,h,railWidth,frontBase,nearJoin,farX,farBaseY,farShoulder,railStart){
    ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
    const segments=[];
    const a=new Path2D();a.moveTo(frontBase.x,frontBase.y);a.lineTo(nearJoin.x,nearJoin.y);segments.push({path:a,order:1,kind:"front"});
    const slope=new Path2D();slope.moveTo(nearJoin.x,nearJoin.y);slope.lineTo(railStart.x,railStart.y);
    segments.push({path:slope,order:2,kind:"slope"});
    const c=new Path2D();c.moveTo(farX,farBaseY);c.lineTo(farShoulder.x,farShoulder.y);segments.push({path:c,order:0,kind:"rear"});
    const slopeDx=railStart.x-nearJoin.x,slopeDy=railStart.y-nearJoin.y;
    const slopeLen=Math.max(1,Math.hypot(slopeDx,slopeDy));
    const bend= Math.min(w*.06,slopeLen*.28);

    const d=new Path2D();d.moveTo(railStart.x,railStart.y);d.lineTo(farShoulder.x,farShoulder.y);
    segments.push({path:d,order:3,kind:"horizon"});
    segments.sort((left,right)=>left.order-right.order);
    for(const segment of segments){
      const path=segment.path;
      let steel;
      let jointGradient=false;
      if(segment.kind==="horizon"){
        const dx=railStart.x-farShoulder.x,dy=railStart.y-farShoulder.y;
        const axis=Math.atan2(dy,dx);
        const normal=axis-Math.PI/2;
        const half=railWidth*.52;
        const cx=(farShoulder.x+railStart.x)/2,cy=(farShoulder.y+railStart.y)/2;
        steel=ctx.createLinearGradient(
          cx-Math.cos(normal)*half,cy-Math.sin(normal)*half,
          cx+Math.cos(normal)*half,cy+Math.sin(normal)*half
        );
      }else if(segment.kind==="slope"){
        const dx=railStart.x-nearJoin.x,dy=railStart.y-nearJoin.y;
        const axis=Math.atan2(dy,dx);
        const normal=axis-Math.PI/2;
        const half=railWidth*.52;
        const cx=(nearJoin.x+railStart.x)/2,cy=(nearJoin.y+railStart.y)/2;
        steel=ctx.createLinearGradient(
          cx+Math.cos(normal)*half,cy+Math.sin(normal)*half,
          cx-Math.cos(normal)*half,cy-Math.sin(normal)*half
        );
      }else{
        const center=segment.kind==="front"?frontBase.x:farX,half=railWidth*.52;
        steel=ctx.createLinearGradient(center-half,0,center+half,0);
      }
      steel.addColorStop(0,"#f8fbf8");steel.addColorStop(.08,"#d4ddda");
      steel.addColorStop(.22,"#c1d0cf");steel.addColorStop(.38,"#eef3ef");
      steel.addColorStop(.54,"#aab8b4");steel.addColorStop(.72,"#657371");
      steel.addColorStop(.9,"#8b9692");steel.addColorStop(1,"#1f2929");
      ctx.strokeStyle=steel;ctx.lineWidth=Math.max(8,w*.010);ctx.stroke(path);
    }
    ctx.restore();
  }

  #updateVibraFlow(dt){
    if(this.vibraSensor.active)this.vibraFlowStrength=1;
    else this.vibraFlowStrength=Math.max(0,this.vibraFlowStrength-dt/6000);
    if(this.vibraFlowStrength<=0){this.vibraFlowElapsed=0;return;}
    this.vibraFlowElapsed+=dt;
    let pulses=0;
    while(this.vibraFlowElapsed>=24&&pulses<8){
      this.vibraFlowElapsed-=24;pulses++;
      const spread=this.vibraSensor.active?this.vibraSensor.spread:1;
      const strength=this.vibraFlowStrength*this.vibraFlowStrength;
      for(let source=0;source<3;source++){
        const u=.5+(Math.random()-.5)*.94*spread;
        const v=.5+(Math.random()-.5)*.9*spread;
        const direction=Math.random()<.5?-1:1;
        this.surface.disturb(u,v,direction*(.1+Math.random()*.08)*strength);
      }
    }
  }

  #updateMADMAXFlow(dt){
    const strength=this.madmax.fallStrength;
    if(strength<=0){this.madmaxFlowElapsed=0;return;}
    this.madmaxFlowElapsed+=dt;
    let pulses=0;
    while(this.madmaxFlowElapsed>=16&&pulses<8){
      this.madmaxFlowElapsed-=16;pulses++;
      for(let source=0;source<7;source++){
        const angle=Math.random()*Math.PI*2,distance=Math.pow(Math.random(),1.7)*.18;
        const u=.5+Math.cos(angle)*distance,v=.48+Math.sin(angle)*distance*.55;
        const direction=source%3===0?-1:1;
        this.surface.disturb(u,v,direction*(.08+Math.random()*.1)*strength);
      }
    }
  }

  #quad(ctx,a,b,c,d){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();}
  #mix(a,b,t){return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
  #pointAtY(a,b,y){return this.#mix(a,b,(y-a.y)/(b.y-a.y));}
  #leftStructure(g,w){
    const backY=g.water.backL.y;
    const drainLeft=this.#pointAtY(g.sideWalls.leftCorner,g.sideWalls.leftNear,backY);
    const pillarRight=drainLeft.x;
    const backRight=this.#projectX({x:pillarRight,y:backY},g.vanishing,g.wallBottom);
    const rimBack=this.#pointAtY(g.outer.backL,g.outer.nearL,backY);
    const drainRight=this.#mix(rimBack,g.water.backL,.72);
    const grateWidth=Math.max(1,drainRight.x-drainLeft.x);
    const pillarLeft=Math.max(0,pillarRight-grateWidth);
    const backLeft=this.#projectX({x:pillarLeft,y:backY},g.vanishing,g.wallBottom);
    return {
      pillarLeft,
      pillarRight:Math.max(0,pillarRight),
      backLeft,
      backRight
    };
  }
  #projectX(point,vanishing,y){return vanishing.x+(point.x-vanishing.x)*(y-vanishing.y)/(point.y-vanishing.y);}
  #projectYAtX(point,vanishing,x){return vanishing.y+(point.y-vanishing.y)*(x-vanishing.x)/(point.x-vanishing.x);}
  #stoneGradient(ctx,g){
    const gradient=ctx.createLinearGradient(g.outer.nearL.x,0,g.outer.nearR.x,0);
    gradient.addColorStop(0,"#777b74");gradient.addColorStop(.48,"#4a504d");gradient.addColorStop(1,"#656963");
    return gradient;
  }
}

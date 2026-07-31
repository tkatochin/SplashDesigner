/** Draws the wall-mounted stainless MADMAX box from the supplied facility reference. */
export class MADMAXButtonRenderer {
  geometry(width,height){
    const radius=Math.max(20,Math.min(34,Math.min(width,height)*.055));
    const side=radius*2;
    const wallBottom=height*.52,tileHeight=Math.max(38,height*.075);
    const firstGrout=Math.floor((wallBottom-.001)/tileHeight)*tileHeight;
    const x=width*.5,y=firstGrout-tileHeight*2;
    return{x,y,side,left:x-side/2,right:x+side/2,top:y-side/2,bottom:y+side/2,buttonRadius:side*.165};
  }

  hitTest(px,py,width,height){
    const g=this.geometry(width,height);
    // Include the black bezel and a small margin beyond it so the physical
    // button does not require pixel-perfect tapping.
    return Math.hypot(px-g.x,py-g.y)<=g.buttonRadius*1.55;
  }

  render(ctx,width,height,pressed=false){
    const g=this.geometry(width,height),depth=g.side*.5;
    const sideDX=Math.min(g.side*.13,depth*.28),sideDY=Math.min(g.side*.065,depth*.14);
    ctx.save();ctx.lineJoin="round";

    // A substantial box seen almost head-on: only slim projected faces remain visible.
    const rightShade=ctx.createLinearGradient(g.right,0,g.right+sideDX,0);
    rightShade.addColorStop(0,"rgba(31,38,39,.68)");rightShade.addColorStop(.55,"rgba(39,47,48,.26)");rightShade.addColorStop(1,"rgba(45,52,53,0)");
    ctx.fillStyle=rightShade;this.#polygon(ctx,[
      {x:g.right,y:g.top},{x:g.right+sideDX,y:g.top+sideDY},
      {x:g.right+sideDX,y:g.bottom-sideDY},{x:g.right,y:g.bottom}
    ]);ctx.fill();

    ctx.shadowColor="rgba(21,27,28,.28)";ctx.shadowBlur=g.side*.09;ctx.shadowOffsetX=g.side*.04;ctx.shadowOffsetY=g.side*.05;
    const steel=ctx.createLinearGradient(g.left,0,g.right,0);
    steel.addColorStop(0,"#aeb9ba");steel.addColorStop(.18,"#edf2ef");steel.addColorStop(.38,"#b9c4c5");
    steel.addColorStop(.62,"#f1f3ef");steel.addColorStop(.84,"#a6b1b2");steel.addColorStop(1,"#dce3e0");
    ctx.fillStyle=steel;ctx.fillRect(g.left,g.top,g.side,g.side);ctx.shadowColor="transparent";
    ctx.strokeStyle="rgba(49,58,59,.62)";ctx.lineWidth=Math.max(1,g.side*.018);ctx.strokeRect(g.left,g.top,g.side,g.side);

    this.#letters(ctx,g);
    for(const [u,v] of [[.105,.105],[.895,.105],[.105,.895],[.895,.895]])this.#screw(ctx,g.left+g.side*u,g.top+g.side*v,g.side,u<.5);
    this.#button(ctx,g,pressed);
    ctx.restore();
  }

  #letters(ctx,g){
    const size=g.side*.27,targetWidth=g.side*.24;
    ctx.fillStyle="#121719";ctx.font=`900 ${size}px "Arial Black", "Helvetica Neue", sans-serif`;
    ctx.textAlign="center";ctx.textBaseline="middle";
    const positions={
      M:[.168,.39],A1:[.5,.185],D:[.832,.39],
      M2:[.168,.68],A2:[.5,.815],X:[.832,.68]
    };
    for(const [label,key] of [["M","M"],["A","A1"],["D","D"],["M","M2"],["A","A2"],["X","X"]]){
      const [u,v]=positions[key],measured=Math.max(1,ctx.measureText(label).width);
      ctx.save();ctx.translate(g.left+g.side*u,g.top+g.side*v);ctx.scale(targetWidth/measured,1);ctx.fillText(label,0,0);ctx.restore();
    }
  }

  #button(ctx,g,pressed){
    const offset=pressed?g.side*.012:0,scale=pressed?.88:1;
    ctx.save();ctx.translate(g.x+offset,g.y+offset);ctx.scale(scale,scale);
    ctx.shadowColor="rgba(0,0,0,.5)";ctx.shadowBlur=g.side*.045;ctx.shadowOffsetY=g.side*.025;
    ctx.fillStyle="#111617";ctx.beginPath();ctx.arc(0,0,g.buttonRadius,0,Math.PI*2);ctx.fill();
    ctx.shadowColor="transparent";ctx.strokeStyle="#303738";ctx.lineWidth=g.side*.035;ctx.stroke();
    const red=ctx.createRadialGradient(-g.buttonRadius*.28,-g.buttonRadius*.3,g.buttonRadius*.04,0,0,g.buttonRadius*.68);
    red.addColorStop(0,pressed?"#d85a54":"#ff8278");red.addColorStop(.42,pressed?"#a91c1b":"#db2f2a");red.addColorStop(1,"#7f1112");
    ctx.fillStyle=red;ctx.beginPath();ctx.arc(0,0,g.buttonRadius*.63,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  #screw(ctx,x,y,side,leftLit){
    const washer=side*.055,head=side*.034;
    const ring=ctx.createRadialGradient(x-washer*.28,y-washer*.3,washer*.08,x,y,washer);
    ring.addColorStop(0,leftLit?"#fffdf2":"#e6e8e2");ring.addColorStop(.55,"#aab2b2");ring.addColorStop(1,"#596164");
    ctx.fillStyle=ring;ctx.beginPath();ctx.arc(x,y,washer,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#333a3c";ctx.beginPath();ctx.arc(x,y,head,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#bfc7c5";ctx.lineWidth=Math.max(.7,side*.012);ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(x-head*.65,y);ctx.lineTo(x+head*.65,y);ctx.moveTo(x,y-head*.65);ctx.lineTo(x,y+head*.65);ctx.stroke();
  }

  #polygon(ctx,points){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();}
}

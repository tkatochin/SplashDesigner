export class ClothPanel {
  constructor(side){
    this.side=side;
    this.points=[];
    this.layoutKey="";
  }

  layout(x,y,width,height){
    const cols=10;
    const rows=12;
    const key=[x,y,width,height].map(Math.round).join(":");
    if(this.layoutKey===key) return;
    this.layoutKey=key;
    this.points=[];
    for(let row=0;row<=rows;row++){
      const line=[];
      for(let col=0;col<=cols;col++){
        const px=x+width*(col/cols);
        const py=y+height*(row/rows);
        line.push({x:px,y:py,px,py,homeX:px,homeY:py});
      }
      this.points.push(line);
    }
  }

  update(dt,pull,active,pointerX,pointerY){
    if(!this.points.length) return;
    const step=Math.min(dt/16.67,2);
    const rows=this.points.length-1;
    const cols=this.points[0].length-1;
    for(let row=1;row<=rows;row++){
      for(let col=0;col<=cols;col++){
        const p=this.points[row][col];
        const vx=(p.x-p.px)*0.86;
        const vy=(p.y-p.py)*0.86;
        p.px=p.x;p.py=p.y;
        const depth=row/rows;
        const edge=this.side<0?1-col/cols:col/cols;
        const gather=pull*pull*(0.3+0.7*depth)*(0.55+0.45*edge);
        const targetX=p.homeX+this.side*gather*190;
        const breeze=Math.sin(performance.now()*0.0017+row*0.42+col*0.3)*0.35*depth*(1-pull);
        p.x+=vx+(targetX-p.x)*0.075*step+breeze;
        p.y+=vy+(p.homeY-p.y)*0.09*step+0.045*depth;
        if(active){
          const dx=p.x-pointerX;
          const dy=p.y-pointerY;
          const influence=Math.max(0,1-Math.hypot(dx,dy)/180);
          p.x+=this.side*influence*pull*7*step;
        }
      }
    }
    for(let pass=0;pass<2;pass++) this.#constrain();
  }

  #constrain(){
    const rows=this.points.length-1;
    const cols=this.points[0].length-1;
    for(let row=0;row<=rows;row++){
      for(let col=0;col<=cols;col++){
        if(col<cols) this.#link(this.points[row][col],this.points[row][col+1]);
        if(row<rows) this.#link(this.points[row][col],this.points[row+1][col]);
      }
    }
    for(const p of this.points[0]){p.x=p.homeX;p.y=p.homeY;}
  }

  #link(a,b){
    const rest=Math.hypot(b.homeX-a.homeX,b.homeY-a.homeY);
    const dx=b.x-a.x,dy=b.y-a.y;
    const distance=Math.hypot(dx,dy)||1;
    const adjust=(distance-rest)/distance*0.42;
    if(a!==this.points[0]?.find(p=>p===a)){a.x+=dx*adjust;a.y+=dy*adjust;}
    b.x-=dx*adjust;b.y-=dy*adjust;
  }
}

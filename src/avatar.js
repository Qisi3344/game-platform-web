(function(){
  const palettes = [
    {name:'霓虹粉紫', bg:'#f7f5fb', outline:'#2b2140', main:'#8f68d9', dark:'#5a3d95', accent:'#ff6ec8', accent2:'#62dbff', light:'#ffffff', belly:'#f0b85c'},
    {name:'青紫冷调', bg:'#f7f8fb', outline:'#231d38', main:'#7863d7', dark:'#4c3795', accent:'#62dbff', accent2:'#ff98d9', light:'#ffffff', belly:'#9ff4e8'},
    {name:'糖果夜航', bg:'#f6f4fb', outline:'#2f2242', main:'#9a6bdf', dark:'#6545aa', accent:'#ffd667', accent2:'#65e4ff', light:'#ffffff', belly:'#ff98d9'},
    {name:'薄荷终端', bg:'#f4f7fb', outline:'#20253a', main:'#63c9da', dark:'#3f8ea2', accent:'#8f68d9', accent2:'#ffd46a', light:'#ffffff', belly:'#dffcf5'},
    {name:'黄蓝故障', bg:'#faf7f1', outline:'#2a233d', main:'#7e68db', dark:'#4d3e92', accent:'#ffd35f', accent2:'#60d9ff', light:'#ffffff', belly:'#ffeab3'},
    {name:'橙莓汽水', bg:'#fff6f4', outline:'#31223f', main:'#ff8b5e', dark:'#bf5a3f', accent:'#ff4fa3', accent2:'#66dcff', light:'#ffffff', belly:'#ffd574'},
    {name:'青柠外星', bg:'#f5fbf4', outline:'#233226', main:'#62cf74', dark:'#3d9650', accent:'#ffd25f', accent2:'#7f87ff', light:'#ffffff', belly:'#b3ffd6'},
    {name:'红蓝游戏厅', bg:'#f8f5fb', outline:'#281f38', main:'#dc5a7e', dark:'#9d355a', accent:'#5ccfff', accent2:'#ffd76a', light:'#ffffff', belly:'#ffc5d6'},
    {name:'奶油宇宙', bg:'#fffbf3', outline:'#2d2440', main:'#a58de8', dark:'#725fb3', accent:'#ffd36f', accent2:'#7de8ff', light:'#ffffff', belly:'#fff0c8'},
    {name:'电子深海', bg:'#f4fafe', outline:'#1d2a38', main:'#4e98db', dark:'#2f6493', accent:'#7affd8', accent2:'#ffb364', light:'#ffffff', belly:'#c5efff'}
  ];

  const types = ['cat','dog','wolf','leopard','dragon','fish','fox','rabbit','bird','penguin','bat','snail','ghost','slime','robot'];
  const labels = {
    cat:'猫', dog:'狗', wolf:'狼', leopard:'豹', dragon:'龙', fish:'鱼', fox:'狐狸', rabbit:'兔', bird:'鸟', penguin:'企鹅', bat:'蝙蝠', snail:'蜗牛', ghost:'幽灵', slime:'史莱姆', robot:'机器人'
  };

  function hashString(str){ let h=2166136261>>>0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
  function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
  function choice(rng,arr){ return arr[Math.floor(rng()*arr.length)]; }
  function coin(rng,p=.5){ return rng()<p; }
  function emptyGrid(w,h){ return Array.from({length:h},()=>Array(w).fill(null)); }
  function setPx(g,x,y,c){ if(g[y]&&x>=0&&x<g[0].length) g[y][x]=c; }
  function getPx(g,x,y){ return g[y]&&x>=0&&x<g[0].length ? g[y][x] : null; }
  function rect(g,x,y,w,h,c){ for(let yy=y;yy<y+h;yy++) for(let xx=x;xx<x+w;xx++) setPx(g,xx,yy,c); }
  function ellipse(g,cx,cy,rx,ry,c){
    for(let y=Math.floor(cy-ry)-1;y<=Math.ceil(cy+ry)+1;y++){
      for(let x=Math.floor(cx-rx)-1;x<=Math.ceil(cx+rx)+1;x++){
        const nx=(x-cx)/(rx||1), ny=(y-cy)/(ry||1);
        if(nx*nx+ny*ny<=1) setPx(g,x,y,c);
      }
    }
  }
  function diamond(g,cx,cy,r,c){
    for(let y=-r;y<=r;y++) for(let x=-r;x<=r;x++) if(Math.abs(x)+Math.abs(y)<=r) setPx(g,cx+x,cy+y,c);
  }
  function mirrorFill(g,x,y,c){ setPx(g,x,y,c); setPx(g,g[0].length-1-x,y,c); }
  function shuffle(arr,rng){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  function addOutline(g,pal){
    const out=emptyGrid(16,16);
    for(let y=0;y<16;y++) for(let x=0;x<16;x++) if(g[y][x]) out[y][x]=g[y][x];
    for(let y=0;y<16;y++){
      for(let x=0;x<16;x++){
        if(!g[y][x]) continue;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
          const nx=x+dx, ny=y+dy;
          if(ny>=0&&ny<16&&nx>=0&&nx<16&&!g[ny][nx]) out[ny][nx]=pal.outline;
        });
      }
    }
    return out;
  }

  function addEyes(g,pal,y,wide){
    setPx(g,5,y,pal.light); setPx(g,10,y,pal.light);
    if(wide){ setPx(g,6,y,pal.outline); setPx(g,9,y,pal.outline); }
  }

  function faceCat(g,pal,rng){
    ellipse(g,7.5,8.1,4.4,4.2,pal.main);
    diamond(g,4,3,1,pal.main); diamond(g,11,3,1,pal.main);
    setPx(g,4,2,pal.main); setPx(g,11,2,pal.main);
    setPx(g,4,3,pal.accent); setPx(g,11,3,pal.accent);
    rect(g,5,9,6,3,pal.belly);
    addEyes(g,pal,7,coin(rng,.5));
    setPx(g,7,9,pal.dark); setPx(g,8,9,pal.dark);
    setPx(g,4,9,pal.dark); setPx(g,11,9,pal.dark);
    if(coin(rng,.5)){ setPx(g,3,10,pal.dark); setPx(g,12,10,pal.dark); }
    if(coin(rng,.45)){ mirrorFill(g,3,6,pal.accent2); }
  }

  function faceDog(g,pal,rng){
    ellipse(g,7.5,8.3,4.3,4.4,pal.main);
    rect(g,2,5,2,5,pal.main); rect(g,12,5,2,5,pal.main);
    setPx(g,3,4,pal.main); setPx(g,12,4,pal.main);
    rect(g,5,9,6,4,pal.belly);
    addEyes(g,pal,7,coin(rng,.6));
    rect(g,6,9,4,2,pal.light);
    setPx(g,7,10,pal.dark); setPx(g,8,10,pal.dark);
    if(coin(rng,.35)){ mirrorFill(g,4,6,pal.accent); }
  }

  function faceWolf(g,pal,rng){
    ellipse(g,7.5,8.4,4.2,4.5,pal.main);
    diamond(g,4,2,2,pal.main); diamond(g,11,2,2,pal.main);
    setPx(g,4,2,pal.accent2); setPx(g,11,2,pal.accent2);
    setPx(g,3,9,pal.main); setPx(g,12,9,pal.main); setPx(g,3,10,pal.main); setPx(g,12,10,pal.main);
    rect(g,5,9,6,4,pal.belly);
    rect(g,6,9,4,3,pal.light);
    addEyes(g,pal,7,coin(rng,.55));
    setPx(g,7,10,pal.dark); setPx(g,8,10,pal.dark);
    setPx(g,6,11,pal.dark); setPx(g,9,11,pal.dark);
    if(coin(rng,.6)){ mirrorFill(g,4,5,pal.accent2); }
  }

  function faceLeopard(g,pal,rng){
    ellipse(g,7.5,8,4.6,4.1,pal.main);
    ellipse(g,4.5,3.8,1.3,1.1,pal.main); ellipse(g,10.5,3.8,1.3,1.1,pal.main);
    rect(g,5,9,6,3,pal.belly);
    addEyes(g,pal,7,coin(rng,.45));
    setPx(g,7,9,pal.dark); setPx(g,8,9,pal.dark);
    [[4,5],[3,7],[5,10],[11,5],[12,7],[10,10],[7,4]].forEach(([x,y])=>setPx(g,x,y,pal.dark));
    if(coin(rng,.5)){ mirrorFill(g,4,11,pal.dark); }
  }

  function faceFox(g,pal,rng){
    ellipse(g,7.5,8.1,4.0,4.0,pal.main);
    diamond(g,4,2,2,pal.main); diamond(g,11,2,2,pal.main);
    setPx(g,4,2,pal.belly); setPx(g,11,2,pal.belly);
    rect(g,5,9,6,3,pal.belly);
    setPx(g,6,11,pal.belly); setPx(g,9,11,pal.belly);
    addEyes(g,pal,7,true);
    setPx(g,7,9,pal.dark); setPx(g,8,9,pal.dark);
    setPx(g,4,9,pal.dark); setPx(g,11,9,pal.dark);
  }

  function faceRabbit(g,pal,rng){
    ellipse(g,7.5,8.8,4.0,3.8,pal.main);
    rect(g,4,1,2,5,pal.main); rect(g,10,1,2,5,pal.main);
    rect(g,5,2,1,3,pal.accent); rect(g,10,2,1,3,pal.accent);
    rect(g,5,9,6,3,pal.belly);
    addEyes(g,pal,8,coin(rng,.4));
    setPx(g,7,10,pal.dark); setPx(g,8,10,pal.dark);
  }

  function faceDragon(g,pal,rng){
    ellipse(g,7.5,8.2,4.2,4.2,pal.main);
    diamond(g,4,3,2,pal.belly); diamond(g,11,3,2,pal.belly);
    rect(g,2,6,2,3,pal.accent2); rect(g,12,6,2,3,pal.accent2);
    rect(g,5,9,6,3,pal.belly);
    addEyes(g,pal,7,coin(rng,.6));
    [5,6,7,8,9,10].forEach((x,i)=>{ if(i%2===0) setPx(g,x,4,pal.accent); });
    setPx(g,7,9,pal.dark); setPx(g,8,9,pal.dark);
  }

  function faceFish(g,pal,rng){
    ellipse(g,7.5,8.3,4.5,3.8,pal.main);
    diamond(g,2,8,2,pal.main); diamond(g,13,8,2,pal.main);
    diamond(g,7,3,1,pal.accent2); diamond(g,8,3,1,pal.accent2);
    rect(g,5,8,6,4,pal.belly);
    addEyes(g,pal,7,coin(rng,.4));
    setPx(g,7,9,pal.belly); setPx(g,8,9,pal.belly);
  }

  function faceBird(g,pal,rng){
    ellipse(g,7.5,8.2,4.2,4.0,pal.main);
    rect(g,3,6,1,4,pal.main); rect(g,12,6,1,4,pal.main);
    diamond(g,7,4,1,pal.accent); diamond(g,8,4,1,pal.accent);
    rect(g,5,8,6,4,pal.belly);
    addEyes(g,pal,7,coin(rng,.45));
  }

  function facePenguin(g,pal,rng){
    ellipse(g,7.5,8.4,4.2,4.3,pal.main);
    rect(g,4,5,8,8,pal.main);
    rect(g,5,6,6,6,pal.belly);
    rect(g,3,7,1,3,pal.main); rect(g,12,7,1,3,pal.main);
    addEyes(g,pal,6,coin(rng,.35));
    setPx(g,7,8,pal.accent); setPx(g,8,8,pal.accent);
  }

  function faceBat(g,pal,rng){
    ellipse(g,7.5,8.4,3.8,3.7,pal.main);
    diamond(g,3,4,2,pal.main); diamond(g,12,4,2,pal.main);
    rect(g,1,6,2,2,pal.main); rect(g,13,6,2,2,pal.main);
    addEyes(g,pal,7,coin(rng,.35));
    rect(g,6,9,4,2,pal.belly);
  }

  function faceSnail(g,pal,rng){
    ellipse(g,6.5,8.5,3.8,3.6,pal.main);
    ellipse(g,6.5,8.5,2.3,2.1,pal.dark);
    rect(g,8,10,4,2,pal.main);
    rect(g,9,11,3,1,pal.belly);
    setPx(g,10,4,pal.main); setPx(g,11,3,pal.accent2); setPx(g,9,4,pal.main); setPx(g,8,3,pal.accent2);
    addEyes(g,pal,10,coin(rng,.25));
  }

  function faceGhost(g,pal,rng){
    ellipse(g,7.5,7.7,4.2,4.2,pal.main);
    rect(g,4,7,8,5,pal.main);
    [4,6,8,10,12].forEach((x,i)=>setPx(g,x,12,i%2?pal.main:pal.dark));
    addEyes(g,pal,7,coin(rng,.4));
    setPx(g,7,9,pal.dark); setPx(g,8,9,pal.dark);
  }

  function faceSlime(g,pal,rng){
    ellipse(g,7.5,8.5,4.6,3.8,pal.main);
    [5,10].forEach(x=>setPx(g,x,5,pal.accent2));
    addEyes(g,pal,8,coin(rng,.35));
    setPx(g,7,10,pal.dark); setPx(g,8,10,pal.dark);
    if(coin(rng,.5)){ setPx(g,4,11,pal.accent); setPx(g,11,11,pal.accent); }
  }

  function faceRobot(g,pal,rng){
    rect(g,4,4,8,8,pal.main);
    rect(g,5,5,6,4,pal.accent2);
    rect(g,6,6,1,1,pal.light); rect(g,9,6,1,1,pal.light);
    rect(g,6,10,4,1,pal.belly);
    rect(g,7,2,2,2,pal.main); setPx(g,7,1,pal.accent); setPx(g,8,1,pal.accent);
    setPx(g,3,6,pal.main); setPx(g,12,6,pal.main);
  }

  function buildAvatar(seedStr,forcedType,forcedPaletteIndex){
    const seed=hashString(seedStr);
    const rng=mulberry32(seed);
    const type=forcedType||choice(rng,types);
    const paletteIndex=Number.isInteger(forcedPaletteIndex)?((forcedPaletteIndex%palettes.length)+palettes.length)%palettes.length:Math.floor(rng()*palettes.length);
    const pal=palettes[paletteIndex];
    const g=emptyGrid(16,16);

    const map = {
      cat:faceCat, dog:faceDog, wolf:faceWolf, leopard:faceLeopard, dragon:faceDragon, fish:faceFish, fox:faceFox,
      rabbit:faceRabbit, bird:faceBird, penguin:facePenguin, bat:faceBat, snail:faceSnail, ghost:faceGhost,
      slime:faceSlime, robot:faceRobot
    };
    (map[type]||faceCat)(g,pal,rng);

    for(let i=0;i<2;i++){
      const x=3+Math.floor(rng()*10), y=4+Math.floor(rng()*8);
      if(getPx(g,x,y)===pal.main && !['cat','wolf','dog','leopard','robot'].includes(type)) setPx(g,x,y,coin(rng,.5)?pal.accent:pal.accent2);
    }

    const out=addOutline(g,pal);
    return {seed:seedStr,type,paletteIndex,pal,grid:out};
  }

  function drawAvatar(canvas,config,size=64){
    const avatar=config.grid?config:buildAvatar(config.seed,config.type,config.paletteIndex);
    canvas.width=size; canvas.height=size;
    const ctx=canvas.getContext('2d'); ctx.imageSmoothingEnabled=false; ctx.fillStyle=avatar.pal.bg; ctx.fillRect(0,0,size,size);
    let minX=16,minY=16,maxX=-1,maxY=-1;
    for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(avatar.grid[y][x]){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
    let dx=0,dy=0;
    if(maxX>=minX){const w=maxX-minX+1,h=maxY-minY+1;dx=Math.floor((16-w)/2)-minX;dy=Math.floor((16-h)/2)-minY;}
    const cell=size/16;
    for(let y=0;y<16;y++) for(let x=0;x<16;x++){
      const c=avatar.grid[y][x]; if(!c) continue;
      const px=x+dx, py=y+dy; if(px<0||px>=16||py<0||py>=16) continue;
      ctx.fillStyle=c; ctx.fillRect(px*cell,py*cell,cell,cell);
    }
    return canvas;
  }

  function dataUrl(config,size=64){ const cv=document.createElement('canvas'); drawAvatar(cv,config,size); return cv.toDataURL(); }
  function randomSeed(prefix='avatar'){ return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`; }
  function randomConfig(type='all'){ const t=type==='all'?types[Math.floor(Math.random()*types.length)]:type; return {seed:randomSeed(t),type:t,paletteIndex:Math.floor(Math.random()*palettes.length)}; }
  function generateBatch(type='all',count=12){
    const typePool=type==='all'?shuffle(types,Math.random):Array(count).fill(type);
    const palOrder=shuffle([...palettes.keys()],Math.random);
    const out=[];
    for(let i=0;i<count;i++) out.push({seed:randomSeed(type==='all'?(typePool[i%typePool.length]||'avatar'):type),type:type==='all'?(typePool[i%typePool.length]||types[i%types.length]):type,paletteIndex:palOrder[i%palOrder.length]});
    return out;
  }
  function recolor(config){ let idx=Math.floor(Math.random()*palettes.length); if(palettes.length>1) while(idx===config.paletteIndex) idx=Math.floor(Math.random()*palettes.length); return {...config,paletteIndex:idx}; }
  function normalize(config){
    if(!config||!config.seed||!types.includes(config.type)) return randomConfig('cat');
    return {seed:String(config.seed),type:config.type,paletteIndex:Number.isInteger(config.paletteIndex)?config.paletteIndex%palettes.length:0};
  }

  window.AvatarLab={palettes,types,labels,buildAvatar,drawAvatar,dataUrl,randomConfig,generateBatch,recolor,normalize};
})();
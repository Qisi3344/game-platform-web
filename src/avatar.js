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
  function mirrorFill(g,x,y,c){ setPx(g,x,y,c); setPx(g,g[0].length-1-x,y,c); }
  function shuffle(arr,rng){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  function drawBody(g,pal,top,bottom,peak,start,type,rng){
    const rows=bottom-top+1;
    for(let i=0;i<rows;i++){
      const t=i/(rows-1||1);
      let hw=Math.round(start+Math.sin(t*Math.PI)*peak*(.75+rng()*.12));
      if(i<2&&coin(rng,.4)) hw--;
      if(i>rows-3&&coin(rng,.5)) hw--;
      hw=Math.max(2,Math.min(6,hw));
      if(type==='robot') hw=4;
      if(type==='fish'&&i<2) hw=Math.min(hw,4);
      if(type==='penguin'&&i===0) hw=Math.min(hw,3);
      if(type==='snail'&&i<2) hw=Math.min(hw,4);
      for(let x=Math.ceil(7.5-hw);x<=Math.floor(7.5+hw);x++) setPx(g,x,top+i,pal.main);
    }
  }

  function buildAvatar(seedStr,forcedType,forcedPaletteIndex){
    const seed=hashString(seedStr);
    const rng=mulberry32(seed);
    const type=forcedType||choice(rng,types);
    const paletteIndex=Number.isInteger(forcedPaletteIndex)?((forcedPaletteIndex%palettes.length)+palettes.length)%palettes.length:Math.floor(rng()*palettes.length);
    const pal=palettes[paletteIndex];
    const g=emptyGrid(16,16);
    const top=3+Math.floor(rng()*2), bottom=12+Math.floor(rng()*2);
    const peakMap={cat:4,dog:4,wolf:4,leopard:4,dragon:4,fish:4,fox:4,rabbit:5,bird:4,penguin:4,bat:4,snail:4,ghost:5,slime:5,robot:4};
    const startMap={ghost:2,slime:2};
    drawBody(g,pal,top,bottom,peakMap[type]||4,startMap[type]||1,type,rng);

    if(type==='cat'){
      [[4,top],[4,top-1],[5,top-2],[6,top-1],[9,top-1],[10,top-2],[11,top-1],[11,top]].forEach(([x,y])=>setPx(g,x,y,pal.main));
      setPx(g,5,top-1,pal.accent); setPx(g,10,top-1,pal.accent); setPx(g,3,top+5,pal.main); setPx(g,12,top+5,pal.main);
    }
    if(type==='dog'){
      for(let y=top+1;y<top+4;y++){ setPx(g,3,y,pal.main); setPx(g,12,y,pal.main); }
      setPx(g,4,top,pal.main); setPx(g,11,top,pal.main);
    }
    if(type==='wolf'){
      [[4,top-1],[5,top-2],[10,top-1],[11,top-2],[4,top],[11,top]].forEach(([x,y])=>setPx(g,x,y,pal.main));
      setPx(g,5,top-1,pal.accent2); setPx(g,10,top-1,pal.accent2);
    }
    if(type==='leopard'){
      [[4,top],[5,top-1],[10,top-1],[11,top],[5,top-2],[10,top-2]].forEach(([x,y])=>setPx(g,x,y,pal.main));
      [[4,top+2],[5,top+4],[4,top+6],[6,top+7]].forEach(([x,y])=>mirrorFill(g,x,y,pal.dark));
    }
    if(type==='dragon'){
      [[4,top-1],[5,top-2],[10,top-1],[11,top-2]].forEach(([x,y])=>setPx(g,x,y,pal.belly));
      for(let y=top+2;y<top+5;y++){ setPx(g,2,y,pal.accent2); setPx(g,13,y,pal.accent2); }
      [6,7,8,9].forEach(x=>setPx(g,x,bottom+1,pal.belly));
    }
    if(type==='fish'){
      for(let y=top+3;y<bottom-1;y++){ setPx(g,2,y,pal.main); setPx(g,13,y,pal.main); }
      setPx(g,1,top+6,pal.main); setPx(g,14,top+6,pal.main); setPx(g,3,top+1,pal.accent); setPx(g,12,top+1,pal.accent); setPx(g,7,top-1,pal.accent2); setPx(g,8,top-1,pal.accent2);
    }
    if(type==='fox'){
      [[3,top+1],[4,top],[5,top-1],[5,top-2],[10,top-2],[10,top-1],[11,top],[12,top+1]].forEach(([x,y])=>setPx(g,x,y,pal.main));
      [[5,top-1],[10,top-1]].forEach(([x,y])=>setPx(g,x,y,pal.belly));
    }
    if(type==='rabbit'){
      for(let y=top-3;y<top+1;y++){ setPx(g,4,y,pal.main); setPx(g,5,y,pal.main); setPx(g,10,y,pal.main); setPx(g,11,y,pal.main); }
      for(let y=top-2;y<top+1;y++){ setPx(g,5,y,pal.accent); setPx(g,10,y,pal.accent); }
    }
    if(type==='bird'){
      for(let y=top+2;y<top+5;y++){ setPx(g,3,y,pal.main); setPx(g,12,y,pal.main); }
      setPx(g,7,top-1,pal.accent); setPx(g,8,top-1,pal.accent);
    }
    if(type==='penguin'){
      for(let y=top+2;y<bottom-1;y++) for(let x=5;x<11;x++) if(coin(rng,.88)) setPx(g,x,y,pal.belly);
      for(let y=top+3;y<top+6;y++){ setPx(g,3,y,pal.main); setPx(g,12,y,pal.main); }
    }
    if(type==='bat'){
      [[4,top],[5,top-1],[10,top-1],[11,top]].forEach(([x,y])=>setPx(g,x,y,pal.main));
      for(let y=top+1;y<top+5;y++){ setPx(g,1,y,pal.main); setPx(g,2,y,pal.main); setPx(g,13,y,pal.main); setPx(g,14,y,pal.main); }
      setPx(g,3,top+3,pal.main); setPx(g,12,top+3,pal.main);
    }
    if(type==='snail'){
      for(let y=top+1;y<bottom-1;y++) for(let x=3;x<8;x++) if((x+y)%2===0) setPx(g,x,y,pal.dark);
      setPx(g,10,top-1,pal.main); setPx(g,11,top-2,pal.accent2); setPx(g,9,top-1,pal.main); setPx(g,8,top-2,pal.accent2);
    }
    if(type==='ghost'){
      [4,6,9,11].forEach(x=>setPx(g,x,top-1,pal.main));
      [4,6,8,10,12].forEach((x,i)=>setPx(g,x,bottom+1,i%2?pal.main:pal.dark));
    }
    if(type==='slime'){
      [4,6,9,11].forEach(x=>{if(coin(rng,.8))setPx(g,x,bottom+1,pal.main);});
      [5,10].forEach(x=>setPx(g,x,top-1,pal.accent2));
    }
    if(type==='robot'){
      for(let y=top+2;y<bottom-1;y++) for(let x=4;x<12;x++) setPx(g,x,y,(x>4&&x<11&&y>top+2&&y<bottom-2)?pal.accent2:pal.main);
      setPx(g,7,top-2,pal.main); setPx(g,8,top-2,pal.main); setPx(g,7,top-3,pal.accent); setPx(g,8,top-3,pal.accent);
    }

    const eyeY=top+3+Math.floor(rng()*2);
    if(['penguin','fox','dog','wolf','cat','rabbit','leopard'].includes(type)){
      for(let y=eyeY+1;y<=Math.min(bottom-1,eyeY+4);y++) for(let x=5;x<=10;x++) if(coin(rng,.84)) setPx(g,x,y,pal.belly);
    } else if(type!=='robot'&&coin(rng,.65)) {
      for(let y=eyeY+1;y<=Math.min(bottom-1,eyeY+3);y++) for(let x=5;x<=10;x++) if(coin(rng,.75)) setPx(g,x,y,pal.belly);
    }

    if(type==='robot'){
      setPx(g,5,eyeY,pal.outline); setPx(g,6,eyeY,pal.outline); setPx(g,9,eyeY,pal.outline); setPx(g,10,eyeY,pal.outline); setPx(g,5,eyeY,pal.light); setPx(g,9,eyeY,pal.light);
    } else {
      setPx(g,5,eyeY,pal.outline); setPx(g,10,eyeY,pal.outline); if(coin(rng,.4)){setPx(g,6,eyeY,pal.outline);setPx(g,9,eyeY,pal.outline);} setPx(g,5,eyeY,pal.light); setPx(g,10,eyeY,pal.light);
    }

    if(['dog','wolf','fox'].includes(type)){
      setPx(g,7,eyeY+2,pal.outline); setPx(g,8,eyeY+2,pal.outline); if(type==='wolf')setPx(g,7,eyeY+1,pal.accent2); if(type==='fox'){setPx(g,6,eyeY+3,pal.belly);setPx(g,9,eyeY+3,pal.belly);}
    } else if(type==='cat'||type==='leopard'){
      setPx(g,7,eyeY+2,pal.dark); setPx(g,8,eyeY+2,pal.dark); setPx(g,4,eyeY+2,pal.dark); setPx(g,11,eyeY+2,pal.dark);
    } else if(['penguin','bird','fish'].includes(type)){
      setPx(g,7,eyeY+2,pal.belly); setPx(g,8,eyeY+2,pal.belly);
    } else if(type!=='ghost') {
      setPx(g,7,eyeY+2,pal.dark); if(coin(rng,.4))setPx(g,8,eyeY+2,pal.dark);
    }

    if(type==='leopard') [[4,eyeY+1],[5,eyeY+4],[6,eyeY+5]].forEach(([x,y])=>mirrorFill(g,x,y,pal.dark));
    if(type==='dragon') for(let y=top+1;y<bottom;y+=2) setPx(g,7,y,pal.belly);
    for(let i=0;i<4;i++){
      const y=top+1+Math.floor(rng()*(bottom-top)), x=2+Math.floor(rng()*4);
      if(g[y]?.[x]&&type!=='leopard') mirrorFill(g,x,y,coin(rng,.5)?pal.accent:pal.accent2);
    }

    const out=emptyGrid(16,16);
    for(let y=0;y<16;y++) for(let x=0;x<16;x++) if(g[y][x]) out[y][x]=g[y][x];
    for(let y=0;y<16;y++) for(let x=0;x<16;x++) if(g[y][x]) [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(ny>=0&&ny<16&&nx>=0&&nx<16&&!g[ny][nx])out[ny][nx]=pal.outline;});
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
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){const c=avatar.grid[y][x];if(!c)continue;const px=x+dx,py=y+dy;if(px<0||px>=16||py<0||py>=16)continue;ctx.fillStyle=c;ctx.fillRect(px*cell,py*cell,cell,cell);}
    return canvas;
  }

  function dataUrl(config,size=64){ const cv=document.createElement('canvas'); drawAvatar(cv,config,size); return cv.toDataURL(); }
  function randomSeed(prefix='avatar'){ return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`; }
  function randomConfig(type='all'){ const rng=Math.random; const t=type==='all'?types[Math.floor(rng()*types.length)]:type; return {seed:randomSeed(t),type:t,paletteIndex:Math.floor(rng()*palettes.length)}; }
  function generateBatch(type='all',count=12){
    const typePool=type==='all'?shuffle(types,Math.random):Array(count).fill(type);
    const palOrder=shuffle([...palettes.keys()],Math.random);
    const out=[];
    for(let i=0;i<count;i++) out.push({seed:randomSeed(type==='all'?(typePool[i%typePool.length]||'avatar'):type),type:type==='all'?(typePool[i%typePool.length]||types[i%types.length]):type,paletteIndex:palOrder[i%palOrder.length]});
    return out;
  }
  function recolor(config){ let idx=Math.floor(Math.random()*palettes.length); if(palettes.length>1) while(idx===config.paletteIndex) idx=Math.floor(Math.random()*palettes.length); return {...config,paletteIndex:idx}; }
  function normalize(config,fallbackSeed='avatar'){
    if(!config||!config.seed||!types.includes(config.type)) return randomConfig('cat');
    return {seed:String(config.seed),type:config.type,paletteIndex:Number.isInteger(config.paletteIndex)?config.paletteIndex%palettes.length:0};
  }

  window.AvatarLab={palettes,types,labels,buildAvatar,drawAvatar,dataUrl,randomConfig,generateBatch,recolor,normalize};
})();
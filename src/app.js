const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const nowT=(ts=Date.now())=>new Date(ts).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),1800);}

/* ================= 自定义像素下拉菜单 ================= */
let pxSelectOpen=null;

function pxSelectText(sel){
  const opt=sel.options[sel.selectedIndex];
  return opt ? opt.textContent : '请选择';
}

function positionPxSelect(host,menu){
  const r=host.getBoundingClientRect();
  const margin=8, gap=6;
  const viewportW=document.documentElement.clientWidth;
  const viewportH=document.documentElement.clientHeight;
  const width=Math.max(120,Math.min(r.width,viewportW-margin*2));
  menu.style.width=width+'px';
  menu.style.left=Math.max(margin,Math.min(r.left,viewportW-width-margin))+'px';

  menu.style.maxHeight='min(310px, calc(100vh - 24px))';
  menu.style.visibility='hidden';
  menu.classList.add('on');
  const natural=Math.min(menu.scrollHeight,310);
  const below=viewportH-r.bottom-gap-margin;
  const above=r.top-gap-margin;
  const openUp=below<Math.min(180,natural) && above>below;
  const allowed=Math.max(96,openUp?above:below);
  const height=Math.min(natural,allowed);
  menu.style.maxHeight=height+'px';
  menu.style.top=(openUp?Math.max(margin,r.top-height-gap):Math.min(viewportH-height-margin,r.bottom+gap))+'px';
  menu.style.visibility='visible';
}

function closePxSelect(){
  if(!pxSelectOpen)return;
  pxSelectOpen.host.classList.remove('open');
  pxSelectOpen.menu.classList.remove('on');
  pxSelectOpen.menu.remove();
  pxSelectOpen=null;
}

function syncPxSelect(sel){
  const host=sel.closest('.pxselect');
  if(!host)return;
  const label=host.querySelector('.pxselect-label');
  if(label)label.textContent=pxSelectText(sel);
}

function openPxSelect(sel,host,trigger){
  if(pxSelectOpen?.sel===sel){closePxSelect();return;}
  closePxSelect();

  const menu=document.createElement('div');
  menu.className='pxselect-menu';
  menu.setAttribute('role','listbox');

  const opts=[...sel.options];
  if(!opts.length){
    menu.innerHTML='<div class="pxselect-empty">暂无选项</div>';
  }else{
    opts.forEach((opt,i)=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='pxselect-option'+(opt.selected?' selected':'');
      btn.textContent=opt.textContent;
      btn.dataset.index=i;
      btn.disabled=opt.disabled;
      btn.setAttribute('role','option');
      btn.setAttribute('aria-selected',opt.selected?'true':'false');
      btn.onclick=()=>{
        if(opt.disabled)return;
        sel.selectedIndex=i;
        syncPxSelect(sel);
        sel.dispatchEvent(new Event('change',{bubbles:true}));
        closePxSelect();
        trigger.focus();
      };
      menu.appendChild(btn);
    });
  }

  document.body.appendChild(menu);
  host.classList.add('open');
  pxSelectOpen={sel,host,trigger,menu};
  positionPxSelect(host,menu);

  const selected=menu.querySelector('.selected');
  if(selected) selected.scrollIntoView({block:'nearest'});
}

function enhanceSelects(root=document){
  root.querySelectorAll('select.pxinput:not([data-px-enhanced])').forEach(sel=>{
    sel.dataset.pxEnhanced='1';

    const host=document.createElement('div');
    host.className='pxselect';
    if(sel.style.maxWidth)host.style.maxWidth=sel.style.maxWidth;
    if(sel.style.width)host.style.width=sel.style.width;

    sel.parentNode.insertBefore(host,sel);
    host.appendChild(sel);
    sel.classList.add('pxselect-native');

    const trigger=document.createElement('button');
    trigger.type='button';
    trigger.className='pxselect-trigger';
    trigger.setAttribute('aria-haspopup','listbox');
    trigger.innerHTML='<span class="pxselect-label"></span><span class="pxselect-caret">▼</span>';
    host.appendChild(trigger);
    syncPxSelect(sel);

    trigger.onclick=()=>openPxSelect(sel,host,trigger);
    trigger.onkeydown=e=>{
      if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'||e.key==='ArrowUp'){
        e.preventDefault();
        openPxSelect(sel,host,trigger);
      }
      if(e.key==='Escape')closePxSelect();
    };
    sel.addEventListener('change',()=>syncPxSelect(sel));
  });
}

document.addEventListener('pointerdown',e=>{
  if(!pxSelectOpen)return;
  if(pxSelectOpen.host.contains(e.target)||pxSelectOpen.menu.contains(e.target))return;
  closePxSelect();
});
window.addEventListener('resize',()=>{if(pxSelectOpen)positionPxSelect(pxSelectOpen.host,pxSelectOpen.menu);});
window.addEventListener('scroll',()=>{if(pxSelectOpen)positionPxSelect(pxSelectOpen.host,pxSelectOpen.menu);},true);


const DB_KEY='neoncore_db_v2';
let DB,SESSION=null,G=null,authMode='login',curCat='全部',regChoices=[],regSelected=0;
function seed(){
  DB={users:{},games:[],posts:[]};
  DB.users.demo={pass:'demo',nick:'赛博巡游者',avatar:{seed:'demo_wolf_2026',type:'wolf',paletteIndex:1},joined:Date.now()};
  const g=(title,desc,tag,hue,plays)=>({id:uid(),author:'demo',title,desc,tag,hue,plays,status:'on',time:Date.now()-Math.random()*6e8});
  DB.games=[
    g('霓虹贪吃蛇','经典 snake，吃了会变色的那种。','街机',300,342),
    g('像素跑酷 VOID RUNNER','在数据深渊里一直跑，别掉下去。','跑酷',265,187),
    g('量子打砖块','砖块是像素做的，打完很解压。','休闲',190,96),
    g('紫雾弹幕试炼','粉紫色弹幕，躲不开就逝世。','弹幕',330,258)
  ];
  DB.posts=[
    {id:uid(),author:'demo',cat:'作品展示',title:'刚搓的像素风头像生成器，进来领头像',content:'注册页现在可以选动物，再随机生成造型和颜色。',time:Date.now()-3e7,likes:[],stars:[],comments:[]},
    {id:uid(),author:'demo',cat:'闲聊',title:'你们是怎么入坑像素风的？',content:'小时候看到 8bit 游戏，DNA 就动了。',time:Date.now()-9e7,likes:[],stars:[],comments:[]}
  ];
}
function loadDB(){try{DB=JSON.parse(localStorage.getItem(DB_KEY))}catch(e){} if(!DB||!DB.users)seed(); migrateDB();save();}
function migrateDB(){
  Object.entries(DB.users||{}).forEach(([id,u],i)=>{if(!u.avatar)u.avatar={seed:'legacy_'+id+'_'+i,type:AvatarLab.types[i%AvatarLab.types.length],paletteIndex:i%AvatarLab.palettes.length};u.avatar=AvatarLab.normalize(u.avatar);});
  (DB.posts||[]).forEach(p=>{p.likes=Array.isArray(p.likes)?p.likes:[];p.stars=Array.isArray(p.stars)?p.stars:[];p.comments=Array.isArray(p.comments)?p.comments:[];});
}
function save(){localStorage.setItem(DB_KEY,JSON.stringify(DB));}
function me(){return DB.users[SESSION];}
function userAvatarSrc(u,size=64){return AvatarLab.dataUrl(u?.avatar||{seed:'anon',type:'ghost',paletteIndex:0},size);}
function avatarOptionsHTML(selected='all'){return `<option value="all" ${selected==='all'?'selected':''}>全部混合</option>`+AvatarLab.types.map(t=>`<option value="${t}" ${selected===t?'selected':''}>${AvatarLab.labels[t]}</option>`).join('');}

function renderRegGrid(){
  const box=$('#aAvGrid'); if(!box)return;
  box.innerHTML=regChoices.map((cfg,i)=>`<img src="${AvatarLab.dataUrl(cfg,64)}" data-i="${i}" class="${i===regSelected?'on':''}" title="${AvatarLab.labels[cfg.type]}">`).join('');
  $$('#aAvGrid img').forEach(img=>img.onclick=()=>{regSelected=+img.dataset.i;renderRegGrid();});
}
function refreshReg(){regChoices=AvatarLab.generateBatch($('#aAnimal')?.value||'all',12);regSelected=0;renderRegGrid();}
function recolorReg(){if(!regChoices.length)refreshReg();regChoices[regSelected]=AvatarLab.recolor(regChoices[regSelected]);renderRegGrid();}

function setMode(m){
  authMode=m;
  $('#tabLogin').className='pxbtn '+(m==='login'?'pink':'ghost');
  $('#tabReg').className='pxbtn '+(m==='reg'?'pink':'ghost');
  $('#nickField').style.display=m==='reg'?'':'none';
  $('#avatarField').style.display=m==='reg'?'':'none';
  $('#authGo').textContent=m==='login'?'▶ 接入霓虹港':'▶ 注册并接入';
  $('#authErr').textContent='';
  if(m==='reg'&&!regChoices.length)refreshReg();
}
function enter(u){SESSION=u;$('#authScreen').style.display='none';$('#app').style.display='block';refreshChip();go('games');}
function logout(){SESSION=null;$('#app').style.display='none';$('#authScreen').style.display='flex';setMode('login');}
function refreshChip(){const u=me();$('#chipAv').src=userAvatarSrc(u);$('#chipNick').textContent=u.nick;}

function drawCover(cv,hue,seed=1){
  cv.width=240;cv.height=130;const x=cv.getContext('2d');x.fillStyle=`hsl(${hue},70%,10%)`;x.fillRect(0,0,240,130);
  let s=seed*331+7;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280};
  for(let i=0;i<80;i++){const sz=[4,8,12,16][(rnd()*4)|0];x.fillStyle=`hsl(${hue+rnd()*50-25},85%,${20+rnd()*45}%)`;x.globalAlpha=.35+rnd()*.6;x.fillRect((rnd()*240/sz|0)*sz,(rnd()*130/sz|0)*sz,sz,sz);}x.globalAlpha=1;
}
function go(p){$$('.page').forEach(e=>e.classList.remove('on'));$('#page-'+p).classList.add('on');$$('.navbtn').forEach(b=>b.classList.toggle('on',b.dataset.nav===p));if(p==='games')renderGames();if(p==='forum')renderForum();if(p==='me')renderMe();window.scrollTo(0,0);}

function renderGames(){
  const q=($('#gSearch').value||'').toLowerCase(),sort=$('#gSort').value;
  let list=DB.games.filter(g=>g.status==='on'&&(g.title.toLowerCase().includes(q)||g.desc.toLowerCase().includes(q)));
  list.sort((a,b)=>sort==='hot'?b.plays-a.plays:b.time-a.time);
  $('#gameGrid').innerHTML=list.map(g=>`<div class="card gcard" onclick="playGame('${g.id}')"><div class="gcover"><canvas data-id="${g.id}" data-hue="${g.hue}"></canvas><div class="gtitle">${esc(g.title)}</div></div><div class="gbody"><span class="tag">${esc(g.tag)}</span>${esc(g.desc)}<div class="gmeta"><span>▶ ${g.plays}</span><span>by ${esc(DB.users[g.author]?.nick||'佚名')}</span></div></div></div>`).join('');
  $$('#gameGrid canvas').forEach(c=>drawCover(c,+c.dataset.hue,c.dataset.id.charCodeAt(0)));
}
function openUpload(editId){
  const g=editId?DB.games.find(x=>x.id===editId):null;let hue=g?.hue||290;
  openModal(`<h3>${g?'✎ 编辑游戏':'+ 发布游戏'}</h3><div class="field"><label>// 游戏名</label><input class="pxinput" id="ugTitle" value="${g?esc(g.title):''}"></div><div class="field"><label>// 简介</label><textarea class="pxinput" id="ugDesc">${g?esc(g.desc):''}</textarea></div><div class="field"><label>// 分类</label><select class="pxinput" id="ugTag">${['街机','跑酷','休闲','弹幕','解谜','其他'].map(t=>`<option ${g&&g.tag===t?'selected':''}>${t}</option>`).join('')}</select></div><div class="mrow"><button class="pxbtn ghost" onclick="closeModal()">取消</button><button class="pxbtn pink" id="ugOk">${g?'保存':'发布'}</button></div>`);
  $('#ugOk').onclick=()=>{const t=$('#ugTitle').value.trim(),d=$('#ugDesc').value.trim();if(!t)return toast('游戏名不能为空');if(g){g.title=t;g.desc=d;g.tag=$('#ugTag').value;}else DB.games.unshift({id:uid(),author:SESSION,title:t,desc:d,tag:$('#ugTag').value,hue,plays:0,status:'on',time:Date.now()});save();closeModal();renderGames();toast('已保存');};
}
function playGame(id){const g=DB.games.find(x=>x.id===id);g.plays++;save();openModal(`<h3>▶ ${esc(g.title)}</h3><canvas class="gamecv" id="gameCv" width="320" height="240"></canvas><div class="mrow"><button class="pxbtn ghost" onclick="closeModal()">退出</button></div>`,true);startSnake(g.hue);}
function startSnake(hue){
  if(G){clearInterval(G.iv);if(G.key)document.removeEventListener('keydown',G.key);}
  const cv=$('#gameCv'),x=cv.getContext('2d'),N=20,M=15,C=16,S={sn:[{x:5,y:7}],dir:{x:1,y:0},nd:{x:1,y:0},food:{x:12,y:7},dead:false};
  const draw=()=>{x.fillStyle='#05020a';x.fillRect(0,0,320,240);x.fillStyle=`hsl(${hue},90%,60%)`;x.fillRect(S.food.x*C+3,S.food.y*C+3,C-6,C-6);x.fillStyle=`hsl(${(hue+40)%360},90%,45%)`;S.sn.forEach(s=>x.fillRect(s.x*C+1,s.y*C+1,C-2,C-2));};
  G={iv:setInterval(()=>{if(S.dead)return;S.dir=S.nd;const h={x:(S.sn[0].x+S.dir.x+N)%N,y:(S.sn[0].y+S.dir.y+M)%M};if(S.sn.some(s=>s.x===h.x&&s.y===h.y)){S.dead=true;return}S.sn.unshift(h);if(h.x===S.food.x&&h.y===S.food.y)S.food={x:(Math.random()*N)|0,y:(Math.random()*M)|0};else S.sn.pop();draw();},130)};
  const key=e=>{const m={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]}[e.key.toLowerCase()];if(m&&(m[0]!==-S.dir.x||m[1]!==-S.dir.y)){S.nd={x:m[0],y:m[1]};e.preventDefault();}};
  document.addEventListener('keydown',key);G.key=key;draw();
}

const CATS=['全部','闲聊','作品展示','求助','公告'];
function renderForum(){
  $('#catBar').innerHTML=CATS.map(c=>`<button class="catbtn ${c===curCat?'on':''}" onclick="setCat('${c}')">${c}</button>`).join('');
  const list=DB.posts.filter(p=>curCat==='全部'||p.cat===curCat).sort((a,b)=>b.time-a.time);
  $('#postList').innerHTML=list.map(p=>`<div class="card post" onclick="openPostDetail('${p.id}')"><div class="who"><img src="${userAvatarSrc(DB.users[p.author],48)}"><span>${esc(DB.users[p.author]?.nick||'佚名')}</span><span>· ${nowT(p.time)}</span></div><span class="tag">${p.cat}</span><h3>${esc(p.title)}</h3><div class="excerpt">${esc(p.content)}</div><div class="pmeta"><span class="heart">♥ ${p.likes.length}</span><span class="star">★ ${p.stars.length}</span><span class="cmt">✉ ${p.comments.length}</span></div></div>`).join('');
}
function setCat(c){curCat=c;renderForum();}
function openPost(){
  openModal(`<h3>+ 发布帖子</h3><div class="field"><label>// 分类</label><select class="pxinput" id="pCat">${CATS.slice(1).map(c=>`<option>${c}</option>`).join('')}</select></div><div class="field"><label>// 标题</label><input class="pxinput" id="pTitle"></div><div class="field"><label>// 正文</label><textarea class="pxinput" id="pBody"></textarea></div><div class="mrow"><button class="pxbtn ghost" onclick="closeModal()">取消</button><button class="pxbtn pink" id="pOk">发布</button></div>`);
  $('#pOk').onclick=()=>{const title=$('#pTitle').value.trim(),content=$('#pBody').value.trim();if(!title||!content)return toast('标题和正文都要填');DB.posts.unshift({id:uid(),author:SESSION,cat:$('#pCat').value,title,content,time:Date.now(),likes:[],stars:[],comments:[]});save();closeModal();renderForum();};
}
function openPostDetail(id){
  const p=DB.posts.find(x=>x.id===id),liked=p.likes.includes(SESSION),starred=p.stars.includes(SESSION);
  openModal(`<h3>${esc(p.title)}</h3><div style="font-size:12px;color:var(--dim);margin-bottom:10px">${esc(DB.users[p.author]?.nick||'佚名')} · ${nowT(p.time)}</div><div style="white-space:pre-wrap">${esc(p.content)}</div><div class="mrow"><button class="pxbtn small ${liked?'pink':''}" id="dLike">♥ ${p.likes.length}</button><button class="pxbtn small ${starred?'pink':'ghost'}" id="dStar">★ 收藏</button></div><div class="cmts"><div id="cList">${p.comments.map(c=>`<div class="citem"><img src="${userAvatarSrc(DB.users[c.user],48)}"><div class="cb"><span class="cu">${esc(DB.users[c.user]?.nick||c.user)}</span>：${esc(c.text)}</div></div>`).join('')}</div><div class="cinput"><input class="pxinput" id="cIn"><button class="pxbtn small pink" id="cOk">发送</button></div></div>`,true);
  $('#dLike').onclick=()=>{const i=p.likes.indexOf(SESSION);i>=0?p.likes.splice(i,1):p.likes.push(SESSION);save();openPostDetail(id);};
  $('#dStar').onclick=()=>{const i=p.stars.indexOf(SESSION);i>=0?p.stars.splice(i,1):p.stars.push(SESSION);save();openPostDetail(id);};
  $('#cOk').onclick=()=>{const v=$('#cIn').value.trim();if(!v)return;p.comments.push({user:SESSION,text:v,time:nowT()});save();openPostDetail(id);renderForum();};
}

function renderMe(){
  const u=me();$('#pfAv').src=userAvatarSrc(u,96);$('#pfNick').textContent=u.nick;
  const myG=DB.games.filter(g=>g.author===SESSION),myP=DB.posts.filter(p=>p.author===SESSION);
  $('#stGames').textContent=myG.length;$('#stPosts').textContent=myP.length;$('#stLikes').textContent=myP.reduce((a,p)=>a+p.likes.length,0);$('#stStars').textContent=DB.posts.reduce((a,p)=>a+(p.stars.includes(SESSION)?1:0),0);
  renderPfBody($('#pfTabs .on')?.dataset.pt||'works');
}
function pfTab(t){$$('#pfTabs button').forEach(b=>b.classList.toggle('on',b.dataset.pt===t));renderPfBody(t);}
function renderPfBody(t){
  if(t==='works')$('#pfBody').innerHTML=DB.games.filter(g=>g.author===SESSION).map(g=>`<div class="card mini"><div class="grow"><div class="ttl">🎮 ${esc(g.title)}</div><div class="sub">${esc(g.tag)} · ▶${g.plays}</div></div><div class="ops"><button class="pxbtn small" onclick="openUpload('${g.id}')">编辑</button></div></div>`).join('')+DB.posts.filter(p=>p.author===SESSION).map(p=>`<div class="card mini"><div class="grow"><div class="ttl">📡 ${esc(p.title)}</div><div class="sub">${p.cat} · ♥${p.likes.length}</div></div></div>`).join('');
  if(t==='collect')$('#pfBody').innerHTML=DB.posts.filter(p=>p.stars.includes(SESSION)).map(p=>`<div class="card mini" onclick="openPostDetail('${p.id}')"><div class="grow"><div class="ttl">★ ${esc(p.title)}</div></div></div>`).join('')||'<div class="empty card">收藏夹空空如也</div>';
  if(t==='comments'){const rows=[];DB.posts.forEach(p=>p.comments.forEach(c=>{if(c.user===SESSION)rows.push({p,c})}));$('#pfBody').innerHTML=rows.map(({p,c})=>`<div class="card mini"><div class="grow"><div class="ttl">回复《${esc(p.title)}》</div><div class="sub">${esc(c.text)}</div></div></div>`).join('')||'<div class="empty card">还没有评论过</div>';}
}
function openEditProfile(){
  let choices=[{...me().avatar},...AvatarLab.generateBatch(me().avatar.type,11)],selected=0;
  openModal(`<h3>✎ 编辑资料</h3><div class="field"><label>// 昵称</label><input class="pxinput" id="eNick" value="${esc(me().nick)}"></div><div class="field"><label>// 头像物种</label><div class="avatar-tools"><select class="pxinput" id="eAnimal">${avatarOptionsHTML(me().avatar.type)}</select><button class="pxbtn small" id="eGenAv">↻ 生成</button><button class="pxbtn small ghost" id="eRecolor">🎨 换色</button></div><div class="avpick" id="eAv"></div></div><div class="mrow"><button class="pxbtn pink" id="eOk">保存</button></div>`);
  const render=()=>{$('#eAv').innerHTML=choices.map((cfg,i)=>`<img src="${AvatarLab.dataUrl(cfg)}" data-i="${i}" class="${i===selected?'on':''}">`).join('');$$('#eAv img').forEach(img=>img.onclick=()=>{selected=+img.dataset.i;render();});};render();
  $('#eGenAv').onclick=()=>{choices=AvatarLab.generateBatch($('#eAnimal').value,12);selected=0;render();};
  $('#eRecolor').onclick=()=>{choices[selected]=AvatarLab.recolor(choices[selected]);render();};
  $('#eOk').onclick=()=>{const n=$('#eNick').value.trim();if(!n)return;me().nick=n;me().avatar={...choices[selected]};save();refreshChip();renderMe();closeModal();};
}
function openSettings(){openModal('<h3>⚙ 设置</h3><div class="setrow"><span>当前为本地原型</span><span>localStorage</span></div><div class="mrow"><button class="pxbtn pink" onclick="closeModal()">完成</button></div>');}
function openModal(html,wide=false){$('#mbox').className='mbox card'+(wide?' wide':'');$('#mbody').innerHTML=html;$('#modal').classList.add('on');enhanceSelects($('#mbody'));}
function closeModal(){$('#modal').classList.remove('on');if(G){clearInterval(G.iv);if(G.key)document.removeEventListener('keydown',G.key);G=null;}}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});

$$('.floatpix').forEach((c,i)=>{c.width=44;c.height=44;const x=c.getContext('2d');const hue=[300,270,190,320][i%4];for(let j=0;j<14;j++){x.fillStyle=`hsl(${hue+Math.random()*40},90%,60%)`;x.fillRect((Math.random()*11|0)*4,(Math.random()*11|0)*4,4,4);}});
$('#mqTxt').textContent=('WELCOME TO NEONCORE ★ INDIE GAME COMMUNITY ★ PIXEL NEVER DIES ★ ').repeat(2);
$('#tabLogin').onclick=()=>setMode('login');$('#tabReg').onclick=()=>setMode('reg');
$('#aAnimal').innerHTML=avatarOptionsHTML('cat');$('#aGenAv').onclick=refreshReg;$('#aRecolor').onclick=recolorReg;$('#aAnimal').onchange=refreshReg;enhanceSelects(document);
$('#authGo').onclick=()=>{const u=$('#aUser').value.trim(),p=$('#aPass').value,n=$('#aNick').value.trim();if(!u||!p)return $('#authErr').textContent='// 用户名和密码不能为空';if(authMode==='reg'){if(DB.users[u])return $('#authErr').textContent='// 该代号已被占用';DB.users[u]={pass:p,nick:n||u,avatar:{...(regChoices[regSelected]||AvatarLab.randomConfig('cat'))},joined:Date.now()};save();enter(u);}else{if(!DB.users[u]||DB.users[u].pass!==p)return $('#authErr').textContent='// 代号或密码错误';enter(u);}};
$('#aPass').addEventListener('keydown',e=>{if(e.key==='Enter')$('#authGo').click();});
loadDB();setMode('login');
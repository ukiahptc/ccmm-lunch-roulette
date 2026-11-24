// 용산 배경 (3안): 촘촘한 픽셀아트. 384×216 도트 캔버스에 레이어를 쌓아 그린다 (외부 이미지 없음, 오리지널 그림).
// 레이어: 하늘 → 먼 고층 스카이라인 → 남산·남산타워 → 용산역·전자상가·삼각지 상가 → 인도(사람·가로등·가로수) → 도로(차) → 한강철교(열차) → 한강
// 카테고리(body[data-cat])마다 시간대·조명·팔레트가 바뀐다. 색은 채도를 낮춰 UI 를 방해하지 않게.
(function(){
  const W=640, H=216, GROUND=176, OX=128;   // 장면 폭 640, 랜드마크는 OX 만큼 오른쪽으로 옮겨 가운데 배치
  const THEMES = {
    lunch:  { sky:['#a7cbe4','#b6d4ea','#c6ddef','#d5e6f3','#e2eef6'], stars:0, orb:{t:'sun',x:196,y:34,c:'#fbf3d5',halo:'#e9eef0'},
      cloud:['#f4f7fa','#dfe7ee'], far:['#a9bbcc','#b6c6d4'], farLit:0, hill:['#7b9a83','#6d8c76','#88a68e'],
      bld:['#d6dae0','#c7ced7','#bcc3cc','#e3ded5','#cfd3c9'], edge:'#9aa3ae', win:'#8ea6be', lit:'#f1ead0', litP:.05,
      neon:['#c9738a','#5d9fbf','#cfa95a','#76a883','#9a86c4'], neonOn:.55, tower:'#eef0f2', towerShade:'#c9cfd6', beacon:'#d46a6a',
      walk:'#9aa1a8', road:'#6c737c', lane:'#d9d4bf', river:['#7fa6c4','#8fb2cd'], bridge:['#5f6b78','#4f5a66'],
      train:['#e8ebef','#4f7fbf'], car:['#c25b5b','#4f79b0','#e0e0dc','#5f8f6e','#d8b24e'], headlight:false, people:['#4d5866','#7a5a5a','#506d8a','#8a7a5a'], glass:'#9fb8cf' },
    dinner: { sky:['#4d4f84','#6a5a8e','#94668e','#c27a86','#dc9a84','#e8b98e'], stars:6, orb:{t:'sun',x:470,y:120,c:'#f6d29a',halo:'#e8ad8e'},
      cloud:['#e9b0a2','#c98c94'], far:['#6e5f82','#7b6a8a'], farLit:.25, hill:['#5b5070','#51476a','#665a7a'],
      bld:['#625a7a','#574f70','#4c4566','#6c6078','#5a5274'], edge:'#433c58', win:'#443e5c', lit:'#efc58a', litP:.35,
      neon:['#e58aa5','#7fc3dc','#ebc56a','#8fd19e','#b9a0ea'], neonOn:.8, tower:'#5a5274', towerShade:'#4a4362', beacon:'#f0d38a',
      walk:'#5a536c', road:'#3f3a52', lane:'#b9a58a', river:['#8a6f96','#a07c9a'], bridge:['#3a3450','#2f2a44'],
      train:['#d9d6e0','#5f86c8'], car:['#b95a5a','#4f6ea0','#cfcac8','#5a7e66','#c9a24a'], headlight:true, people:['#2f2a40','#4a3a48','#36405a','#4a4436'], glass:'#5c6a8c' },
    date:   { sky:['#16162e','#1c1b3a','#232147','#2b2754','#352f60'], stars:70, orb:{t:'moon',x:238,y:30,c:'#f3ead4',halo:'#2f2b58'},
      cloud:null, far:['#2a2750','#312d5a'], farLit:.3, hill:['#1f1d3c','#1a1834','#252244'],
      bld:['#2c2a4e','#272546','#22203f','#312e56','#29274a'], edge:'#1b1a33', win:'#1d1c36', lit:'#f0c9da', litP:.32,
      neon:['#e47fae','#a690e2','#79c6e0','#e6b874','#8fd6b0'], neonOn:.85, tower:'#2f2c54', towerShade:'#262446', beacon:'#f08cbc',
      walk:'#24223e', road:'#1c1b32', lane:'#6e6890', river:['#26285a','#2e3066'], bridge:['#14132a','#100f22'],
      train:['#c9c6dc','#7f7fd0'], car:['#9c4a6a','#4a5a9a','#b8b4c8','#4a6a5a','#b8964a'], headlight:true, people:['#141326','#2a2040','#1e2440','#30283a'], glass:'#3a3a6a', towerGlow:'#f08cbc' },
    team:   { sky:['#0b0d1c','#0f1226','#141832','#191e3c','#1e2446'], stars:40, orb:{t:'moon',x:470,y:26,c:'#dfe7f2',halo:'#1a2040'},
      cloud:null, far:['#161a34','#1b2040'], farLit:.45, hill:['#121530','#0f122a','#161a36'],
      bld:['#1c2140','#181c38','#141830','#21264a','#1a1f3c'], edge:'#0f1226', win:'#12152c', lit:'#a9e3ee', litP:.5,
      neon:['#e05ac6','#3fc6d6','#e6cc48','#58cf88','#9a7ae8'], neonOn:1, tower:'#1d2244', towerShade:'#171b38', beacon:'#3fc6d6',
      walk:'#161a30', road:'#0f1224', lane:'#3a4268', river:['#101a40','#142050'], bridge:['#0a0c1a','#080914'],
      train:['#c4ccdc','#3fc6d6'], car:['#a8405a','#3a5a9a','#b0b6c6','#3a6a5a','#b8963a'], headlight:true, people:['#0a0c18','#22183a','#14203a','#2a2430'], glass:'#24305a', towerGlow:'#3fc6d6' }
  };
  // 3×5 도트 글꼴 (간판용)
  const F = { F:'111100110100100',W:'101101111111101',X:'101101010101101',A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',G:'011100101101011',H:'101101111101101',
    I:'111010010010111',K:'101110100110101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',
    Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',Y:'101101010010010',
    '0':'111101101101111','1':'010110010010111','2':'110001010100111','4':'101101111001001','5':'111100110001110','8':'111101111101111','!':'010010010000010' };

  function rng(seed){ return ()=>{ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }; }

  function scene(T){
    const r=rng(20261124); let s='';
    const R=(x,y,w,h,c,a='')=>{ s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${a}/>`; };
    const P=(x,y,c,a)=>R(x,y,1,1,c,a);
    const text=(str,x,y,c,a='')=>{ let g=''; [...str].forEach((ch,i)=>{ const f=F[ch]; if(!f) return; for(let k=0;k<15;k++) if(f[k]==='1') g+=`<rect x="${x+i*4+k%3}" y="${y+(k/3|0)}" width="1" height="1"/>`; }); s+=`<g fill="${c}"${a}>${g}</g>`; };
    const dither=(x,y,w,h,c,step=2)=>{ for(let yy=y;yy<y+h;yy++) for(let xx=x+((yy)%step);xx<x+w;xx+=step) P(xx,yy,c); };

    // ── 하늘: 띠 + 경계 디더링
    const sky=T.sky, bh=Math.ceil(150/sky.length);
    R(0,-400,W,400+bh,sky[0]);
    sky.forEach((c,i)=>{ R(0,i*bh,W,bh+1,c); if(i) dither(0,i*bh-2,W,2,c); });
    R(0,sky.length*bh,W,H,sky[sky.length-1]);
    for(let i=0;i<T.stars;i++){ const x=r()*W|0, y=r()*100|0, big=r()<.12; P(x,y,r()<.25?'#f3e6b8':'#e8ecf6',` class="tw" style="animation-delay:${(r()*4).toFixed(1)}s"`); if(big){P(x-1,y,'#9aa0c8');P(x+1,y,'#9aa0c8');} }
    // 해·달 (후광 디더)
    const o=T.orb, rad=o.t==='sun'?9:7;
    for(let y=-rad-3;y<=rad+3;y++) for(let x=-rad-3;x<=rad+3;x++){ const d=Math.hypot(x,y); if(d>rad+.5 && d<=rad+3 && (x+y)%2===0 && (x*y)%3===0) P(o.x+x,o.y+y,o.halo); }
    if(o.t==='sun'){ for(let y=-rad;y<=rad;y++){ const w=Math.round(Math.sqrt(rad*rad-y*y)); R(o.x-w,o.y+y,w*2+1,1,o.c); } }
    else for(let y=-rad;y<=rad;y++) for(let x=-rad;x<=rad;x++){ if(x*x+y*y>rad*rad+1) continue; if((x-4)*(x-4)+(y+2)*(y+2)<=(rad-1)*(rad-1)) continue; P(o.x+x,o.y+y,o.c); } // 초승달
    // 구름 (두 톤)
    if(T.cloud){ [[250,22,1],[340,40,.8],[150,58,.7],[460,30,.9],[40,36,.8],[560,50,.7]].forEach(([x,y,k])=>{ const w=(30*k)|0;
      s+=`<g class="cloud">`; R(x,y,w,4,T.cloud[0]); R(x+4,y-3,w-10,3,T.cloud[0]); R(x+9,y-5,(w/3)|0,2,T.cloud[0]); R(x+2,y+3,w-3,1,T.cloud[1]); s+='</g>'; }); }

    // ── 먼 스카이라인 (고층 아파트·업무지구)
    for(let x=0;x<W;){ const w=5+(r()*10|0), h=24+(r()*34|0), c=T.far[r()<.5?0:1], top=GROUND-14-h;
      R(x,top,w,h+14,c); if(r()<.4) R(x+(w>>1),top-3,1,3,c);
      if(T.farLit) for(let yy=top+2;yy<GROUND-14;yy+=3) for(let xx=x+1;xx<x+w-1;xx+=2) if(r()<T.farLit*.35) P(xx,yy,T.lit,' opacity=".55"');
      x+=w+(r()<.3?1:0); }
    s+=`<g transform="translate(${OX} 0)">`;
    // 큐브형 사옥 실루엣 (가운데 큰 사각 구멍)
    R(20,96,40,66,T.far[1]); R(32,112,16,14,T.sky[T.sky.length-1]); R(32,126,16,1,T.far[0]);
    // 쌍둥이 주상복합
    [[66,70],[78,74]].forEach(([x,top])=>{ R(x,top,9,GROUND-top,T.far[0]); R(x+4,top-5,1,5,T.far[0]); for(let yy=top+3;yy<GROUND-16;yy+=4) R(x+1,yy,7,1,T.far[1]); });

    // ── 남산 + 남산타워
    const hx=300; for(let x=232;x<370;x++){ const t=(x-hx)/70, h=Math.round(44*Math.exp(-t*t*2.2)); R(x,GROUND-14-h,1,h+14,T.hill[0]);
      if(h>4 && r()<.6) P(x,GROUND-14-h+1+(r()*3|0),T.hill[2]); if(h>8) for(let k=0;k<3;k++) if(r()<.35) P(x,GROUND-14-h+4+(r()*(h-4)|0),T.hill[1]); }
    const tx=300, tb=GROUND-58;
    R(tx-1,tb-46,4,46,T.tower); R(tx+2,tb-46,1,46,T.towerShade);                       // 기둥
    for(let y=tb-40;y<tb;y+=6) R(tx-1,y,4,1,T.towerShade);
    R(tx-5,tb-56,12,3,T.tower); R(tx-6,tb-53,14,4,T.tower); R(tx-5,tb-49,12,2,T.towerShade); // 전망대
    for(let x=tx-5;x<tx+8;x+=2) P(x,tb-52,T.lit);
    R(tx,tb-70,2,14,T.tower); R(tx,tb-62,2,1,T.towerShade); P(tx,tb-72,T.beacon,' class="blink"'); P(tx+1,tb-72,T.beacon,' class="blink"');
    if(T.towerGlow){ for(let y=tb-60;y<tb-46;y++) for(let x=tx-9;x<tx+12;x++) if((x+y)%3===0 && Math.hypot(x-tx-1,y-tb+52)<9) P(x,y,T.towerGlow,' opacity=".35"'); }
    R(tx-6,tb,14,3,T.towerShade); // 받침

    // ── 건물 그리기 도우미
    const building=(x,top,w,{c,win='grid',lit=T.litP,roof=true,ac=false,sign=null})=>{
      R(x,top,w,GROUND-top,c); R(x,top,1,GROUND-top,T.edge); R(x+w-1,top,1,GROUND-top,T.edge,' opacity=".6"'); R(x,top,w,1,T.edge);
      if(win==='grid') for(let y=top+3;y<GROUND-6;y+=3) for(let xx=x+2;xx<x+w-2;xx+=3){ const on=r()<lit; R(xx,y,2,1,on?T.lit:T.win); }
      if(win==='band') for(let y=top+3;y<GROUND-6;y+=4){ R(x+2,y,w-4,2,T.glass); for(let xx=x+2;xx<x+w-2;xx+=4) P(xx,y,T.edge); if(r()<lit*2) R(x+2+(r()*(w-8)|0),y,4,2,T.lit); }
      if(roof){ if(r()<.6){ const rx=x+2+(r()*(w-8)|0); R(rx,top-4,5,4,T.edge); R(rx+1,top-5,3,1,T.edge); } if(r()<.7){ const ax=x+w-4; R(ax,top-7,1,7,T.edge); P(ax-1,top-6,T.edge); P(ax+1,top-5,T.edge); } }
      if(ac) for(let y=top+6;y<GROUND-10;y+=7) if(r()<.5){ R(x+w,y,2,2,'#9a9fa6'); P(x+w,y,T.edge); }
    };
    const sign=(str,x,y,ci,vertical=false)=>{ const c=T.neon[ci%T.neon.length], on=r()<T.neonOn;
      if(vertical){ R(x-1,y-1,5,str.length*6+1,'#15141f'); [...str].forEach((ch,i)=>text(ch,x,y+i*6,on?c:'#3d3c4c',on?` class="neon" style="animation-delay:${(r()*3).toFixed(1)}s"`:'')); }
      else { const w=str.length*4+1; R(x-1,y-1,w+1,7,'#15141f'); text(str,x,y,on?c:'#3d3c4c',on?` class="neon" style="animation-delay:${(r()*3).toFixed(1)}s"`:''); } };

    // ── 용산역 (긴 유리 역사 + 위쪽 쇼핑몰 매스)
    building(84,118,62,{c:T.bld[3],win:'band',roof:false});
    R(80,114,70,4,T.bld[1]); R(80,113,70,1,T.edge); for(let x=82;x<148;x+=6) R(x,111,3,2,T.edge);
    R(92,124,46,7,'#15141f'); text('YONGSAN',94,125,T.neon[1],' class="neon"');
    R(84,GROUND-12,62,12,T.bld[1]); for(let x=88;x<144;x+=7){ R(x,GROUND-10,4,10,T.glass); R(x+1,GROUND-10,1,10,T.lit,' opacity=".5"'); }
    R(108,GROUND-15,14,3,T.neon[3],' opacity=".8"');   // 출입구 캐노피
    // ── 전자상가 블록 (가운데)
    building(150,96,24,{c:T.bld[0],ac:true});   sign('PC',156,100,0); sign('CPU',152,128,2);
    building(176,82,22,{c:T.bld[2],win:'band'}); R(178,88,18,10,'#15141f'); s+=`<g class="screen"><rect x="179" y="89" width="16" height="8" fill="${T.neon[1]}"/></g>`; text('GAME',179,90,'#ffffff',' opacity=".85"');
    building(200,104,18,{c:T.bld[1],ac:true}); sign('LED',202,108,3); sign('SALE',201,140,0);
    building(220,90,16,{c:T.bld[4]}); sign('AV',224,96,4,true);
    building(238,116,20,{c:T.bld[0],ac:true}); sign('PC',241,120,1);
    // 세로 간판 줄
    sign('OK',172,112,3,true); sign('24',218,124,2,true);
    // ── 삼각지 쪽 낮은 상가 (오른쪽)
    building(326,136,18,{c:T.bld[3]}); sign('BBQ',328,140,2);
    building(346,128,22,{c:T.bld[1],ac:true}); sign('PUB',349,132,0);
    building(370,140,14,{c:T.bld[4]});
    building(262,138,16,{c:T.bld[2]}); sign('K',268,142,4);
    // 왼쪽 저층 (용산역 앞)
    building(0,132,18,{c:T.bld[2]}); building(20,140,26,{c:T.bld[0]}); sign('CAFE',23,144,3); building(48,128,22,{c:T.bld[4],ac:true});
    // 상가 1층 차양·조명
    [[150,24],[200,18],[238,20],[326,18],[346,22],[20,26]].forEach(([x,w],i)=>{ const c=T.neon[i%T.neon.length]; for(let k=0;k<w;k+=2){ R(x+k,GROUND-9,2,2,k%4?c:'#e8e4dc',' opacity=".75"'); } R(x+1,GROUND-7,w-2,7,T.glass,' opacity=".7"'); if(T.headlight) R(x+2,GROUND-6,w-4,1,T.lit,' opacity=".6"'); });

    s+='</g>';
    // 양옆 채움 건물 (넓은 화면용)
    for(const [x0,x1] of [[0,OX-2],[OX+392,W]]) for(let x=x0;x<x1;){ const w=14+(r()*12|0), top=124+(r()*30|0); if(x+w>x1) break; building(x,top,w,{c:T.bld[r()*5|0],win:r()<.3?'band':'grid',ac:r()<.4}); if(r()<.45) sign(['PC','24','BAR','EAT','LED','K'][r()*6|0],x+3,top+5,r()*5|0); x+=w+2+(r()*4|0); }
    // ── 인도: 가로수·가로등·사람
    R(0,GROUND,W,3,T.walk); for(let x=0;x<W;x+=6) P(x,GROUND+1,T.edge,' opacity=".5"');
    for(let x=12;x<W;x+=46){ R(x,GROUND-9,1,9,T.edge); R(x-2,GROUND-14,5,5,T.hill[2]); R(x-3,GROUND-12,7,3,T.hill[0]); P(x-1,GROUND-14,T.hill[1]); }
    for(let x=34;x<W;x+=46){ R(x,GROUND-14,1,14,'#5a5f68'); R(x,GROUND-14,3,1,'#5a5f68'); P(x+2,GROUND-13,T.headlight?'#f6e3a8':'#c9c4b2'); if(T.headlight) for(let k=1;k<5;k++) R(x+2-k,GROUND-13+k*3,1+k*2,1,'#f6e3a8',' opacity=".12"'); }
    const person=(x,c,dir,dur,delay)=>{ s+=`<g class="walker" style="--d:${dir*(60+(r()*40|0))}px;animation-duration:${dur}s;animation-delay:-${delay}s">`;
      R(x,GROUND-6,2,1,'#e7c9a9'); R(x,GROUND-5,2,3,c); R(x,GROUND-2,1,2,T.edge); R(x+1,GROUND-2,1,2,T.edge,' class="leg"'); if(r()<.4) P(x+2,GROUND-4,'#8a6a4a'); s+='</g>'; };
    for(let i=0;i<14;i++) person(6+(r()*(W-12)|0), T.people[i%T.people.length], r()<.5?1:-1, 18+(r()*16|0), (r()*20).toFixed(1));

    // ── 도로·차량
    R(0,GROUND+3,W,10,T.road); for(let x=0;x<W;x+=10) R(x,GROUND+8,5,1,T.lane);
    const car=(lane,dir,ci,dur,delay)=>{ const y=GROUND+(lane?9:4), c=T.car[ci%T.car.length], bus=ci===5;
      s+=`<g class="car ${dir>0?'r':'l'}" style="animation-duration:${dur}s;animation-delay:-${delay}s">`;
      if(bus){ R(0,y-3,18,5,'#5f9f7a'); for(let k=2;k<16;k+=3) R(k,y-2,2,2,T.glass); }
      else { R(0,y-1,9,3,c); R(2,y-3,5,2,c); R(3,y-2,3,1,T.glass); P(1,y+1,'#111'); P(7,y+1,'#111'); }
      if(T.headlight){ const hx=dir>0?(bus?18:9):-1; P(hx,y,'#fff3c4'); R(dir>0?hx+1:hx-5,y,5,1,'#fff3c4',' opacity=".25"'); }
      s+='</g>'; };
    [[0,1,0,16,0],[0,1,3,16,8],[1,-1,1,19,3],[1,-1,5,24,12],[1,-1,2,19,15],[0,1,4,16,12]].forEach(a=>car(...a));

    // ── 한강철교 + 열차 + 한강
    R(0,GROUND+13,W,2,T.bridge[1]);
    R(0,GROUND+15,W,H-GROUND-15,T.river[0]);
    for(let y=GROUND+18;y<H;y+=3) for(let x=(y*7)%11;x<W;x+=11+(y%5)) R(x,y,3+(x%3),1,T.river[1]);
    if(T.headlight) for(let y=GROUND+18;y<H;y+=2) for(let x=0;x<W;x+=23) if(r()<.5) R(x+(r()*20|0),y,2,1,T.lit,' opacity=".35"');
    const by=GROUND+22;
    s+=`<g class="train">`; R(0,by-6,26,5,T.train[0]); R(27,by-6,26,5,T.train[0]); R(54,by-6,26,5,T.train[0]);
    [0,27,54].forEach(cx=>{ R(cx,by-3,26,1,T.train[1]); for(let k=2;k<24;k+=4) R(cx+k,by-5,2,1,T.headlight?T.lit:T.glass); }); R(79,by-6,2,2,'#f3e3a0'); s+='</g>';
    R(0,by-1,W,2,T.bridge[0]); R(0,by+1,W,1,T.bridge[1]);
    for(let x=0;x<W;x+=24){ for(let k=0;k<12;k++){ const h=Math.round(Math.sin(Math.PI*k/12)*8); P(x+k,by-1-h,T.bridge[0]); P(x+12+k,by-1-Math.round(Math.sin(Math.PI*k/12)*8),T.bridge[0]); if(k%3===0) R(x+k,by-1-h,1,h,T.bridge[0],' opacity=".6"'); }
      R(x+11,by+2,3,H-by-2,T.bridge[1]); R(x+11,by+2,1,H-by-2,T.bridge[0]); }
    return s;
  }

  function render(){
    const el=document.getElementById('bg'); if(!el) return;
    const T=THEMES[document.body.dataset.cat]||THEMES.lunch;
    const BOT=64, ih=Math.max(200,innerHeight-BOT);                 // 아래 탭바 높이만큼 띄워 한강이 보이게
    const vw = Math.min(W, Math.max(200, Math.round(innerWidth/(innerWidth<600?1.72:2.25)))); // 도트 1칸: 휴대폰 1.7px, PC 2.25px
    const vx = Math.round(OX+197-vw/2);                               // 용산역~남산타워가 가운데 오도록
    const cx = Math.max(0, Math.min(W-vw, vx));
    const vh = Math.max(H, Math.ceil(vw*ih/innerWidth));
    el.style.background = T.river[0];
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cx} ${H-vh} ${vw} ${vh}" style="height:calc(100% - ${BOT}px)" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges">${scene(T)}</svg><div class="scan"></div>`;
  }
  let last='', rt;
  new MutationObserver(()=>{ const c=document.body.dataset.cat; if(c!==last){ last=c; render(); } }).observe(document.body,{attributes:true,attributeFilter:['data-cat']});
  addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(render,150); });
  last=document.body.dataset.cat; render();
})();

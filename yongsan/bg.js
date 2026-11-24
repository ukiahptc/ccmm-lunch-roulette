// 용산 픽셀 배경. 오리지널 도트 그림을 SVG 사각형으로 그린다 (외부 이미지 없음).
// 장면: 한강철교 · 용산역 · 전자상가 · 남산타워. 카테고리(body[data-cat])마다 시간대와 조명이 바뀐다.
(function(){
  const THEMES = {
    lunch:  { sky:['#8fd3ff','#a9ddff','#c4e8ff','#dff3ff'], sun:{x:30,y:20,r:7,c:'#fff3a8'}, stars:0, cloud:'#ffffff',
              far:'#9fb8d6', hill:'#6f9a7a', bld:['#e9edf3','#d7dde7','#c3ccd9'], win:'#7aa3cf', lit:0.0, litC:'#fff6c8',
              river:'#4f8fd6', bridge:'#5a6b80', neon:['#ff5f8a','#29c4ff','#ffd23f'], neonOn:0.4, tower:'#f4f6fa', towerLight:'#ff6b6b', ground:'#5f6d7c' },
    dinner: { sky:['#3b3f8f','#8a4fa0','#e0698a','#ff9e6b','#ffc77a'], sun:{x:150,y:64,r:9,c:'#ffdd8a'}, stars:6, cloud:'#ffb2a0',
              far:'#7d5a8c', hill:'#5b4a6e', bld:['#5c4f78','#4e4369','#41385a'], win:'#3a3152', lit:0.45, litC:'#ffd27a',
              river:'#c86a8a', bridge:'#352c48', neon:['#ff5f8a','#29c4ff','#ffd23f'], neonOn:0.7, tower:'#3d3352', towerLight:'#ffe08a', ground:'#2e2740' },
    date:   { sky:['#120f2e','#1d1846','#2c205e','#46297a'], moon:{x:40,y:18,r:6,c:'#fff4d6'}, stars:60, cloud:null,
              far:'#2a2458', hill:'#1f1b40', bld:['#2a2550','#231f45','#1c1938'], win:'#1a1733', lit:0.35, litC:'#ffc6e0',
              river:'#2e2a6e', bridge:'#151230', neon:['#ff7ab8','#b48cff','#7fe3ff'], neonOn:0.8, tower:'#2b2650', towerLight:'#ff7ab8', towerGlow:'#ff9ccc', ground:'#14112a' },
    team:   { sky:['#05060f','#0b0d22','#141838','#1c1f48'], moon:{x:150,y:16,r:5,c:'#e8f0ff'}, stars:35, cloud:null,
              far:'#161a3a', hill:'#10132b', bld:['#1b1f3d','#161a34','#12152b'], win:'#0e1024', lit:0.6, litC:'#9ef0ff',
              river:'#0f1840', bridge:'#0a0c1c', neon:['#ff3df0','#00f0ff','#ffe600','#39ff88'], neonOn:1, tower:'#1b1f3d', towerLight:'#00f0ff', towerGlow:'#00b8ff', ground:'#07081a' }
  };
  // 3x5 도트 글꼴 (간판용 라틴 글자만)
  const FONT = { P:'111101111100100', C:'111100100100111', G:'111100101101111', A:'010101111101101', M:'101111111101101', E:'111100111100111',
    B:'110101110101110', Q:'111101101111001', O:'111101101101111', N:'101111111111101', Y:'101101010010010', S:'111100111001111', L:'100100100100111', I:'111010010010111', U:'101101101101111', H:'101101111101101', '2':'111001111100111', '4':'101101111001001' };

  function rng(seed){ return ()=>{ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; }; }
  const R=(x,y,w,h,c,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${extra}/>`;
  function text(str,x,y,c){ let out=''; [...str].forEach((ch,i)=>{ const f=FONT[ch]; if(!f) return; for(let k=0;k<15;k++) if(f[k]==='1') out+=R(x+i*4+(k%3),y+Math.floor(k/3),1,1,c); }); return out; }

  function scene(cat){
    const T=THEMES[cat]||THEMES.lunch, W=192, H=108, rnd=rng(7);
    let s='';
    // 하늘: 계단식 띠 + 경계 디더링
    const bands=T.sky, bh=Math.ceil(H/bands.length);
    bands.forEach((c,i)=>{ s+=R(0,i*bh,W,bh+1,c); if(i<bands.length-1) for(let x=(i%2);x<W;x+=2) s+=R(x,(i+1)*bh-1,1,1,bands[i+1]); });
    for(let i=0;i<T.stars;i++){ const x=Math.floor(rnd()*W), y=Math.floor(rnd()*50); s+=R(x,y,1,1,rnd()<.2?'#ffe9a8':'#ffffff',` class="tw" style="animation-delay:${(rnd()*3).toFixed(2)}s"`); }
    const orb=T.sun||T.moon; if(orb){ for(let y=-orb.r;y<=orb.r;y++){ const w=Math.round(Math.sqrt(orb.r*orb.r-y*y)); s+=R(orb.x-w,orb.y+y,w*2+1,1,orb.c); } if(T.moon) s+=R(orb.x+1,orb.y-3,2,2,T.sky[1]); }
    if(T.cloud){ [[110,14],[60,30],[160,26]].forEach(([x,y])=>{ s+=`<g class="cloud">${R(x,y,16,3,T.cloud)}${R(x+3,y-2,9,2,T.cloud)}${R(x+5,y-4,4,2,T.cloud)}</g>`; }); }
    // 먼 빌딩 실루엣
    for(let x=0;x<W;){ const w=4+Math.floor(rnd()*7), h=12+Math.floor(rnd()*16); s+=R(x,74-h,w,h+4,T.far); x+=w; }
    // 남산 언덕 + 남산타워 (오른쪽)
    for(let i=0;i<22;i++) s+=R(128+i*1.5|0,58+Math.abs(i-11)*1.2|0,3,30,T.hill);
    const tx=144; s+=R(tx,30,3,30,T.tower)+R(tx-2,38,7,4,T.tower)+R(tx-3,40,9,2,T.tower)+R(tx+1,18,1,12,T.tower);
    s+=R(tx+1,17,1,1,T.towerLight,' class="blink"')+R(tx-2,40,7,1,T.towerLight);
    if(T.towerGlow) s+=R(tx-1,37,5,1,T.towerGlow)+R(tx-4,41,11,1,T.towerGlow,' class="blink"');
    // 전자상가 빌딩군 (가운데)
    const blds=[[70,40,16],[88,30,18],[108,44,14],[52,50,16],[124,52,12]];
    blds.forEach(([x,top,w],bi)=>{
      s+=R(x,top,w,86-top,T.bld[bi%3]);
      for(let y=top+3;y<84;y+=3) for(let wx=x+2;wx<x+w-1;wx+=3){ const on=rnd()<T.lit; s+=R(wx,y,1,1,on?T.litC:T.win); }
    });
    // 네온 간판 (도트 글자)
    const signs=[['PC',90,33],['GAME',70,43],['BBQ',108,47],['2',125,55],['4',129,55]];
    signs.forEach(([t,x,y],i)=>{ const c=T.neon[i%T.neon.length], on=rnd()<T.neonOn; const w=t.length*4+1;
      s+=R(x-1,y-1,w+1,7,'#0b0b18')+`<g class="${on?'neon':''}" style="animation-delay:${i*.37}s">${text(t,x,y,on?c:'#3a3a52')}</g>`; });
    // 대형 전광판 (픽셀 모니터)
    s+=R(92,22,10,7,'#0b0b18')+`<g class="screen">${R(93,23,8,5,T.neon[1])}${R(94,24,2,1,'#ffffff')}${R(97,26,3,1,'#ffffff')}</g>`;
    // 용산역 (왼쪽 아래, 긴 역사 + 계단 지붕)
    s+=R(8,66,44,20,T.bld[0])+R(10,63,40,3,T.bld[1])+R(14,60,32,3,T.bld[2])+R(20,58,20,2,T.bld[1]);
    for(let x=11;x<50;x+=4) s+=R(x,70,2,5,rnd()<Math.max(T.lit,.3)?T.litC:T.win);
    s+=R(18,62,24,1,T.neon[1],' class="neon"');
    // 지면 + 선로 + 지나가는 열차
    s+=R(0,86,W,4,T.ground)+R(0,88,W,1,'#8a93a6');
    s+=`<g class="train">${R(0,82,30,5,'#e6e9ef')}${R(0,84,30,1,'#3d7bd9')}${[2,8,14,20,26].map(x=>R(x,83,3,1,T.litC)).join('')}${R(28,82,2,3,'#ffd23f')}</g>`;
    // 한강 + 한강철교 (맨 아래)
    s+=R(0,90,W,18,T.river);
    for(let y=93;y<108;y+=3) for(let x=(y%2)*3;x<W;x+=9) s+=R(x,y,3,1,'#ffffff',' opacity=".18"');
    for(let x=0;x<W;x+=16){ s+=R(x,90,16,1,T.bridge)+R(x+7,91,2,6,T.bridge); for(let k=0;k<7;k++) s+=R(x+k,90-Math.min(k,6-k)+0,1,1,T.bridge)+R(x+9+k,90-Math.min(k,6-k),1,1,T.bridge); }
    return s;
  }

  function render(){
    const el=document.getElementById('bg'); if(!el) return;
    const cat=document.body.dataset.cat||'lunch';
    const portrait = innerHeight > innerWidth;
    // 세로 화면은 가운데 128칸만 보이게 잘라 도트를 더 크게, 위쪽은 하늘색으로 채움
    const vw = portrait ? 120 : 192, vx = portrait ? 36 : 0;
    const vh = Math.max(108, Math.ceil(vw*innerHeight/innerWidth));
    const T=THEMES[cat]||THEMES.lunch;
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${108-vh} ${vw} ${vh}" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges" width="100%" height="100%">
      ${R(0,108-vh,192,vh-100,T.sky[0])}${scene(cat)}</svg><div class="scan"></div>`;
  }
  let last='', rt;
  new MutationObserver(()=>{ const c=document.body.dataset.cat; if(c!==last){ last=c; render(); } }).observe(document.body,{attributes:true,attributeFilter:['data-cat']});
  addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(render,150); });
  last=document.body.dataset.cat; render();
})();

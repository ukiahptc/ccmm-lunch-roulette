// 용산 맛집룰렛 로직. data.js 의 window.YS_DATA 를 읽는다. 여의도 app.js 와 별개 파일.
(function(){
  const DATA = (window.YS_DATA||[]).filter(d=>!d.closed);
  const KNOWN = new Set(DATA.map(d=>d.id));
  const CATS = [
    {id:'lunch',  label:'점심',      icon:'🍱'},
    {id:'dinner', label:'저녁',      icon:'🌆'},
    {id:'date',   label:'데이트 맞춤', icon:'💘'},
    {id:'team',   label:'회식 맞춤',  icon:'🍻'}
  ];
  const AREAS = [
    {id:'station',    label:'용산역·전자상가'},
    {id:'sinyongsan', label:'신용산·용리단길'},
    {id:'samgakji',   label:'삼각지·남영'}
  ];
  const LS = { state:'ys.state.v1', hist:'ys.hist.v1', cache:'ys.shared.cache.v1', pending:'ys.pending.v1', who:'kmac.who' };
  const load=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $=id=>document.getElementById(id);

  let state = Object.assign({cat:'lunch', areas:AREAS.map(a=>a.id), skipRecent:false, view:'roulette'}, load(LS.state,{}));
  let hist = load(LS.hist,[]);
  const persist=()=>save(LS.state,state);

  // ---------- 구글 시트 (여의도와 같은 시트, id 가 ys- 로 시작하는 평가만 사용) ----------
  const API = ((window.CONFIG&&window.CONFIG.sheetApi)||'').trim();
  let shared = load(LS.cache,[]), pending = load(LS.pending,[]);
  async function fetchShared(){
    if(!API){ $('sync').textContent='로컬 모드'; return; }
    try{
      const r=await fetch(API+'?action=list&t='+Date.now(),{cache:'no-store'}); const j=await r.json();
      if(!j.ok) throw new Error(j.error||'응답 오류');
      shared=(j.reviews||[]).filter(x=>KNOWN.has(x.id)); save(LS.cache,shared);
      $('sync').textContent=`평가 ${shared.length}건 · 실시간 공유 중`;
    }catch(e){ $('sync').textContent='시트 연결 실패 · 저장된 평가로 표시'; }
    renderAll();
  }
  const reviews = () => { const m=new Map(); shared.forEach(r=>m.set(r.rid,r)); pending.forEach(r=>m.set(r.rid,{...r,pending:true})); return [...m.values()]; };
  // 앱 리뷰의 상황 태그: note 앞에 [점심] [저녁] [데이트] [회식] 형태로 저장된다
  const TAG2CAT = {'점심':'lunch','저녁':'dinner','데이트':'date','회식':'team'};
  const tagCats = r => [...String(r.note||'').matchAll(/\[(점심|저녁|데이트|회식)\]/g)].map(m=>TAG2CAT[m[1]]);
  function summary(id){
    const rs=reviews().filter(r=>r.id===id); if(!rs.length) return null;
    const score=rs.reduce((a,r)=>a+Number(r.taste||0),0)/rs.length;
    const cats={}; rs.forEach(r=>tagCats(r).forEach(c=>cats[c]=(cats[c]||0)+1));
    return {n:rs.length, score, good:rs.filter(r=>r.revisit).length, cats};
  }
  // 카테고리 소속 = 조사 근거(d.cats) + 앱 리뷰 상황 태그
  const inCat = (d,c) => d.cats.includes(c) || !!(summary(d.id)?.cats[c]);

  // ---------- 후보 ----------
  function pool(){
    return DATA.filter(d=>inCat(d,state.cat))
      .filter(d=>!d.areas.length || d.areas.some(a=>state.areas.includes(a)))
      .filter(d=>!state.skipRecent || !hist.slice(0,5).includes(d.id));
  }

  // ---------- 카테고리 탭 ----------
  function renderCats(){
    $('cats').innerHTML = CATS.map(c=>`<button role="tab" data-cat="${c.id}" class="${c.id===state.cat?'on':''}" aria-selected="${c.id===state.cat}"><span>${c.icon}</span>${c.label}</button>`).join('');
    $('cats').querySelectorAll('button').forEach(b=>b.onclick=()=>{ state.cat=b.dataset.cat; persist(); renderAll(); });
    document.body.dataset.cat = state.cat;
  }
  function renderAreas(){
    $('areaChips').innerHTML = AREAS.map(a=>`<button class="chip ${state.areas.includes(a.id)?'on':''}" data-a="${a.id}">${a.label}</button>`).join('');
    $('areaChips').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      const a=b.dataset.a; state.areas = state.areas.includes(a) ? state.areas.filter(x=>x!==a) : [...state.areas,a];
      persist(); renderAll();
    });
    $('skipRecent').checked = state.skipRecent;
  }
  $('skipRecent').onchange = e=>{ state.skipRecent=e.target.checked; persist(); renderAll(); };

  // ---------- 룰렛 ----------
  const cv=$('wheel'), ctx=cv.getContext('2d');
  let angle=0, spinning=false, current=[];
  const css=v=>getComputedStyle(document.body).getPropertyValue(v).trim();
  function drawWheel(items){
    const R=cv.width/2, n=items.length; ctx.clearRect(0,0,cv.width,cv.height);
    if(!n){ ctx.fillStyle=css('--surface-2')||'#eee'; ctx.beginPath(); ctx.arc(R,R,R-6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=css('--muted')||'#888'; ctx.font='700 34px "Noto Sans KR",sans-serif'; ctx.textAlign='center'; ctx.fillText('후보가 없어요',R,R+12); return; }
    const pal=[css('--w1'),css('--w2'),css('--w3'),css('--w4')], step=Math.PI*2/n;
    for(let i=0;i<n;i++){
      const a0=angle+i*step; ctx.beginPath(); ctx.moveTo(R,R); ctx.arc(R,R,R-6,a0,a0+step); ctx.closePath();
      ctx.fillStyle=pal[i%pal.length]; if(n%4===1&&i===n-1) ctx.fillStyle=pal[1]; ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=2; ctx.stroke();
      ctx.save(); ctx.translate(R,R); const mid=a0+step/2, left=Math.cos(mid)<0; ctx.rotate(left?mid+Math.PI:mid);
      ctx.textAlign=left?'left':'right'; ctx.fillStyle=css('--wheel-ink')||'#111';
      const fs=n>40?15:n>28?18:n>18?22:n>8?26:30; ctx.font=`700 ${fs}px "Noto Sans KR",sans-serif`;
      let t=items[i].name; while(ctx.measureText(t).width>R*0.62&&t.length>2) t=t.slice(0,-1); if(t!==items[i].name) t+='…';
      ctx.fillText(t,left?-(R-24):R-24,fs*0.36); ctx.restore();
    }
    ctx.beginPath(); ctx.arc(R,R,46,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
  }
  const pickIndex=n=>{ const step=Math.PI*2/n; const norm=(((-Math.PI/2-angle)%(Math.PI*2))+Math.PI*4)%(Math.PI*2); return Math.floor(norm/step)%n; };
  function spin(){
    if(spinning) return; const items=pool();
    if(!items.length){ toast('조건에 맞는 후보가 없어요. 지역을 더 골라 주세요.'); return; }
    closeSheet(); current=items; spinning=true; $('spin').disabled=true;
    const total=Math.PI*2*(6+Math.random()*3)+Math.random()*Math.PI*2, dur=4000+Math.random()*1000, t0=performance.now(), a0=angle, ease=t=>1-Math.pow(1-t,4);
    (function f(now){ const t=Math.min(1,(now-t0)/dur); angle=a0+total*ease(t); drawWheel(current); if(t<1) requestAnimationFrame(f); else finish(current[pickIndex(current.length)]); })(t0);
  }
  $('spin').onclick=spin;

  // ---------- 지도 ----------
  const mapQuery=d=>d.q || (d.addr ? `${d.name} 용산구 ${d.addr.replace(/\s*(지하\s*)?\d+층.*$/,'')}` : `${d.name} 용산`);
  const naverWeb=d=>d.naverId?`https://map.naver.com/p/entry/place/${d.naverId}`:'https://map.naver.com/p/search/'+encodeURIComponent(mapQuery(d));

  // ---------- 결과 ----------
  function finish(d){
    spinning=false; $('spin').disabled=false;
    hist=[d.id,...hist.filter(x=>x!==d.id)].slice(0,10); save(LS.hist,hist);
    openResult(d);
  }
  function openResult(d){
    const s=summary(d.id), catLabels=CATS.filter(c=>inCat(d,c.id)).map(c=>c.label);
    $('resultBody').innerHTML=`
      <div class="grab"></div>
      <div class="r-head"><div class="r-name">${esc(d.name)}</div><div class="r-menu">${esc(d.menu)}</div></div>
      <div class="r-tags">${catLabels.map(l=>`<span class="tag">${l}</span>`).join('')}${d.dc?`<span class="tag ghost">다이닝코드 ★${d.dc}</span>`:''}${d.note?`<span class="tag warn">${esc(d.note)}</span>`:''}</div>
      <div class="r-addr">${d.addr?esc(d.addr):'주소 확인 필요 · 네이버지도에서 확인해 주세요'}</div>
      <div class="r-score">${s?`직장인 평가 ${s.n}건 · 👍 ${s.good}`:'아직 직장인 평가가 없어요'}</div>
      <div class="r-actions">
        <a class="btn naver" target="_blank" rel="noopener" href="${naverWeb(d)}">네이버지도에서 보기</a>
        <button class="btn" id="again">다시 돌리기</button>
        <button class="btn ghost" id="closeSheet">닫기</button>
      </div>`;
    $('again').onclick=spin; $('closeSheet').onclick=closeSheet;
    $('resultSheet').classList.add('open'); $('resultSheet').setAttribute('aria-hidden','false');
  }
  function closeSheet(){ $('resultSheet').classList.remove('open'); $('resultSheet').setAttribute('aria-hidden','true'); }
  $('resultSheet').addEventListener('click',e=>{ if(e.target.id==='resultSheet') closeSheet(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeSheet(); });

  // ---------- 목록 · 랭킹 ----------
  function renderList(){
    const q=($('q').value||'').trim();
    const items=DATA.filter(d=>inCat(d,state.cat)).filter(d=>!q||(d.name+d.menu).includes(q));
    $('list').innerHTML = items.map(d=>{ const s=summary(d.id);
      return `<li data-id="${d.id}"><div><b>${esc(d.name)}</b><small>${esc(d.menu)}${d.addr?'':' · 주소 확인 필요'}</small></div><span class="meta">${s?`👍 ${s.good}/${s.n}`:''}</span></li>`; }).join('') || '<li class="empty">검색 결과가 없어요</li>';
    $('list').querySelectorAll('li[data-id]').forEach(li=>li.onclick=()=>openResult(DATA.find(d=>d.id===li.dataset.id)));
  }
  $('q').oninput=renderList;
  function renderRank(){
    const rows=DATA.filter(d=>inCat(d,state.cat)).map(d=>({d,s:summary(d.id)})).filter(x=>x.s).sort((a,b)=>b.s.score-a.s.score||b.s.n-a.s.n);
    $('rank').innerHTML = rows.map(({d,s})=>`<li data-id="${d.id}"><div><b>${esc(d.name)}</b><small>${esc(d.menu)}</small></div><span class="meta">${s.score.toFixed(1)} · ${s.n}건</span></li>`).join('') || '<li class="empty">아직 평가가 없어요. 첫 평가를 남겨 주세요!</li>';
    $('rank').querySelectorAll('li[data-id]').forEach(li=>li.onclick=()=>openResult(DATA.find(d=>d.id===li.dataset.id)));
  }

  // ---------- 하단 탭 ----------
  document.querySelectorAll('.tabbar button').forEach(b=>b.onclick=()=>{ state.view=b.dataset.view; persist(); renderView(); });
  function renderView(){
    document.querySelectorAll('.tabbar button').forEach(b=>b.classList.toggle('on',b.dataset.view===state.view));
    ['roulette','list','rank'].forEach(v=>$('view-'+v).hidden = v!==state.view);
  }

  let toastT; function toast(m){ const t=$('toast'); t.textContent=m; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2200); }

  function renderAll(){
    renderCats(); renderAreas(); renderView();
    const p=pool(); current=p; if(!spinning) drawWheel(p);
    const cl=CATS.find(c=>c.id===state.cat).label;
    $('poolInfo').textContent = `${cl} 후보 ${p.length}곳`;
    renderList(); renderRank();
  }
  window.YS = { spin, openResult, toast, summary, reviews, CATS, DATA, state };
  renderAll(); fetchShared();
})();

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
    {id:'station',    label:'용산역 앞·아이파크몰'},
    {id:'sinyongsan', label:'신용산·용리단길'},
    {id:'samgakji',   label:'삼각지역 근처'}
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
  // 후보가 많으면 원판 글자가 안 읽혀서, 돌릴 때마다 무작위 36곳만 원판에 올린다
  const MAXW=36;
  const wheelItems=p=>{ if(p.length<=MAXW) return p; const a=[...p]; for(let i=a.length-1;i>0;i--){ const j=Math.random()*(i+1)|0; [a[i],a[j]]=[a[j],a[i]]; } return a.slice(0,MAXW); };
  function spin(){
    if(spinning) return; const items=wheelItems(pool());
    if(!items.length){ toast('조건에 맞는 후보가 없어요. 지역을 더 골라 주세요.'); return; }
    closeSheet(); current=items; spinning=true; $('spin').disabled=true;
    const total=Math.PI*2*(6+Math.random()*3)+Math.random()*Math.PI*2, dur=4000+Math.random()*1000, t0=performance.now(), a0=angle, ease=t=>1-Math.pow(1-t,4);
    (function f(now){ const t=Math.min(1,(now-t0)/dur); angle=a0+total*ease(t); drawWheel(current); if(t<1) requestAnimationFrame(f); else finish(current[pickIndex(current.length)]); })(t0);
  }
  $('spin').onclick=spin;

  // ---------- 네이버 지도 ----------
  // 검색어: 직접 지정(q) > 상호+도로명 > 상호+용산. 휴대폰은 네이버지도 앱을 먼저 열고, 앱이 없으면 웹으로 넘어간다.
  const mapQuery=d=>d.q || (d.addr ? `${d.name} 용산구 ${d.addr.replace(/\s*(지하\s*)?\d+층.*$/,'').replace(/\s*\d+호.*$/,'')}` : `${d.name} 용산`);
  const naverWeb=d=>d.naverId?`https://map.naver.com/p/entry/place/${d.naverId}`:'https://map.naver.com/p/search/'+encodeURIComponent(mapQuery(d));
  const naverApp=d=>{ const app=encodeURIComponent(location.hostname||'yongsan.roulette');
    return d.naverId?`nmap://place?id=${d.naverId}&appname=${app}`:`nmap://search?query=${encodeURIComponent(mapQuery(d))}&appname=${app}`; };
  // 네이버 리뷰 화면: 장소 번호가 있으면 방문자 리뷰 탭으로 바로, 없으면 검색 결과에서 가게를 눌러 리뷰 탭으로
  const naverReview=d=>d.naverId?`https://m.place.naver.com/restaurant/${d.naverId}/review/visitor`:naverWeb(d);
  const isMobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  function openNaver(d){
    if(!isMobile){ window.open(naverWeb(d),'_blank','noopener'); return; }
    let left=false; const onHide=()=>{ left=true; };
    document.addEventListener('visibilitychange',onHide,{once:true});
    location.href=naverApp(d);
    setTimeout(()=>{ document.removeEventListener('visibilitychange',onHide); if(!left && !document.hidden) location.href=naverWeb(d); },1500);
  }

  // ---------- 메신저 공유 ----------
  function shareText(d){
    const cl=CATS.find(c=>c.id===state.cat).label;
    return `[용산 맛집룰렛 · ${cl}]\n오늘은 ${d.name} 어때요? (${d.menu})\n네이버지도: ${naverWeb(d)}`;
  }
  async function share(d){
    const text=shareText(d);
    if(navigator.share){ try{ await navigator.share({text}); return; }catch(e){ if(e.name==='AbortError') return; } }
    try{ await navigator.clipboard.writeText(text); toast('복사했어요. 메신저 대화방에 붙여 넣으세요.'); }
    catch(e){ prompt('아래 내용을 복사해 메신저에 붙여 넣으세요', text); }
  }

  // ---------- 결과 ----------
  function finish(d){
    spinning=false; $('spin').disabled=false;
    hist=[d.id,...hist.filter(x=>x!==d.id)].slice(0,10); save(LS.hist,hist);
    openResult(d);
  }
  const FEEL = [ {v:5,icon:'👍',label:'좋았어요'}, {v:3,icon:'😐',label:'보통'}, {v:1,icon:'👎',label:'별로'} ];
  const QUICK = ['가성비','빨리 나와요','혼밥 OK','웨이팅 있음','조용해요','단체석','양 많아요'];
  const SIT = [['lunch','점심'],['dinner','저녁'],['date','데이트'],['team','회식']];
  function reviewHtml(d){
    const s=summary(d.id), rs=reviews().filter(r=>r.id===d.id).slice(-3).reverse();
    const sitBadges = s ? SIT.filter(([c])=>s.cats[c]).map(([c,l])=>`${l} ${s.cats[c]}`).join(' · ') : '';
    return `
      <div class="rv-head"><b>직장인 한줄평</b><span>${s?`👍 ${s.good} / ${s.n}건${sitBadges?' · '+sitBadges:''}`:'첫 평가를 남겨 주세요'}</span></div>
      ${rs.map(r=>`<div class="rv-item"><span class="rv-who">${esc(r.who)}</span> ${Number(r.taste)>=4?'👍':Number(r.taste)>=2.5?'😐':'👎'} ${esc(r.note||'').replace(/\[(점심|저녁|데이트|회식)\]/g,'<span class="tag">$1</span>')}${r.pending?' <em>전송 대기</em>':''}</div>`).join('')}
      <div class="rv-form" id="rvForm">
        <div class="rv-q">어땠어요?</div>
        <div class="rv-feel">${FEEL.map(f=>`<button data-feel="${f.v}"><span>${f.icon}</span>${f.label}</button>`).join('')}</div>
        <div class="rv-more" hidden>
          <div class="rv-q">어떤 자리였어요? <small>고른 카테고리에 이 식당이 추가돼요</small></div>
          <div class="chips" id="rvSit">${SIT.map(([c,l])=>`<button class="chip ${c===state.cat?'on':''}" data-sit="${l}">${l}</button>`).join('')}</div>
          <div class="chips" id="rvQuick">${QUICK.map(q=>`<button class="chip" data-q="${q}">${q}</button>`).join('')}</div>
          <div class="rv-row">
            <input id="rvWho" maxlength="20" placeholder="닉네임" value="${esc(load(LS.who,''))}">
            <input id="rvMemo" maxlength="60" placeholder="한마디 (선택)">
          </div>
          <button class="btn primary" id="rvSend" style="width:100%">등록</button>
        </div>
      </div>`;
  }
  function bindReview(d){
    let feel=0; const form=$('rvForm');
    form.querySelectorAll('[data-feel]').forEach(b=>b.onclick=()=>{ feel=Number(b.dataset.feel);
      form.querySelectorAll('[data-feel]').forEach(x=>x.classList.toggle('on',x===b)); form.querySelector('.rv-more').hidden=false; });
    form.querySelectorAll('#rvSit .chip, #rvQuick .chip').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
    $('rvSend').onclick=async()=>{
      const who=$('rvWho').value.trim(); if(!feel){ toast('👍 😐 👎 중에 하나를 골라 주세요'); return; }
      if(!who){ $('rvWho').focus(); toast('닉네임을 적어 주세요 (다음부터는 자동 입력)'); return; }
      save(LS.who,who);
      const sits=[...form.querySelectorAll('#rvSit .on')].map(b=>`[${b.dataset.sit}]`);
      const qs=[...form.querySelectorAll('#rvQuick .on')].map(b=>'#'+b.dataset.q.replace(/\s/g,''));
      const memo=$('rvMemo').value.trim();
      const today=new Date(Date.now()+9*3600e3).toISOString().slice(0,10);
      // 여의도와 같은 시트 열에 맞춘다: 한 번의 선택을 맛·청결·친절·가격 칸에 같은 값으로 저장
      const r={rid:'ys'+Date.now().toString(36)+Math.random().toString(36).slice(2,6), id:d.id, who, taste:feel, clean:feel, kind:feel, price:feel,
        revisit:feel>=4, note:[...sits,...qs,memo].filter(Boolean).join(' ').slice(0,200), dish:'', date:today};
      pending.push(r); save(LS.pending,pending); openResult(d); renderAll();
      if(!API){ toast('로컬 모드라 이 브라우저에만 저장했어요'); return; }
      try{ const res=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'add',review:r})}); const j=await res.json();
        if(!j.ok) throw new Error(j.error||'저장 실패');
        pending=pending.filter(x=>x.rid!==r.rid); save(LS.pending,pending); shared.push(r); save(LS.cache,shared); toast('등록했어요. 고마워요!');
      }catch(e){ if(/하루|올바르지/.test(e.message)){ pending=pending.filter(x=>x.rid!==r.rid); save(LS.pending,pending); toast(e.message); } else toast('잠시 뒤 자동으로 다시 보낼게요'); }
      if($('resultSheet').classList.contains('open')) openResult(d); renderAll();
    };
  }
  async function retryPending(){
    if(!API||!pending.length) return; const rest=[];
    for(const r of pending){ try{ const res=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'add',review:r})}); const j=await res.json(); if(!j.ok) throw 0; shared.push(r); }catch(e){ rest.push(r); } }
    pending=rest; save(LS.pending,pending); save(LS.cache,shared); renderAll();
  }
  function openResult(d){
    const catLabels=CATS.filter(c=>inCat(d,c.id)).map(c=>c.label);
    $('resultBody').innerHTML=`
      <div class="grab"></div>
      <div class="r-head"><div class="r-name">${esc(d.name)}</div><div class="r-menu">${esc(d.menu)}</div></div>
      <div class="r-tags">${catLabels.map(l=>`<span class="tag">${l}</span>`).join('')}${d.dc?`<span class="tag ghost">다이닝코드 ★${d.dc}</span>`:''}${d.note?`<span class="tag warn">${esc(d.note)}</span>`:''}</div>
      <div class="r-addr">📍 ${d.addr?esc(d.addr):'주소 확인 필요 · 네이버지도에서 확인해 주세요'}</div>
      <button class="btn naver big" id="goNaver"><b class="n-logo">N</b> 네이버지도에서 보기</button>
      <div class="r-actions">
        <button class="btn" id="share">💬 메신저로 공유</button>
        <a class="btn" target="_blank" rel="noopener" href="${naverReview(d)}">✍️ 네이버 리뷰 쓰기</a>
        <button class="btn" id="again">🎯 다시 돌리기</button>
        <button class="btn ghost" id="skipToday">오늘은 빼고 다시</button>
      </div>
      <div class="rv">${reviewHtml(d)}</div>
      <button class="btn ghost close-x" id="closeSheet" aria-label="닫기">✕</button>`;
    $('goNaver').onclick=()=>openNaver(d); $('share').onclick=()=>share(d);
    $('again').onclick=spin; $('closeSheet').onclick=closeSheet;
    $('skipToday').onclick=()=>{ hist=[d.id,...hist.filter(x=>x!==d.id)]; save(LS.hist,hist); state.skipRecent=true; persist(); renderAll(); spin(); };
    bindReview(d);
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
    renderCats(); renderAreas(); renderView(); renderRecent();
    $('heroQ').textContent = {lunch:'오늘 점심 뭐 먹지?',dinner:'퇴근하고 저녁 어디서?',date:'오늘 데이트 어디 갈까?',team:'이번 회식 장소는?'}[state.cat];
    $('today').textContent = new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
    const p=pool(); if(!spinning){ current=wheelItems(p); drawWheel(current); }
    const cl=CATS.find(c=>c.id===state.cat).label;
    $('poolInfo').textContent = p.length>MAXW ? `${cl} 후보 ${p.length}곳 · 돌릴 때마다 ${MAXW}곳을 무작위로 원판에 올려요` : `${cl} 후보 ${p.length}곳`;
    renderList(); renderRank();
  }
  function renderRecent(){
    const items=hist.slice(0,5).map(id=>DATA.find(d=>d.id===id)).filter(Boolean);
    $('recent').innerHTML = items.length ? items.map(d=>`<button class="chip" data-id="${d.id}">${esc(d.name)}</button>`).join('') : '<span class="sub">아직 돌린 기록이 없어요</span>';
    $('recent').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>openResult(DATA.find(d=>d.id===b.dataset.id)));
  }
  window.YS = { spin, openResult, toast, summary, reviews, CATS, DATA, state };
  renderAll(); fetchShared().then(retryPending);
})();

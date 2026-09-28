// CCMM 룰렛 공통 로직. 페이지는 window.APP = {key, data, meta, cheerers, lines} 를 정의한 뒤 이 파일을 불러온다.
(function(){
  const APP = window.APP || {};
  const data = APP.data || window.RESTAURANTS || [];
  const meta = APP.meta || window.META || {};
  const P = APP.key && APP.key!=='lunch' ? APP.key+'.' : '';   // 로컬 저장 키 접두어 (점심 페이지는 기존 키 유지)
  const KNOWN = new Set(data.map(d=>d.id));
  const LS = { reviews:P+'kmac.reviews.v1', hist:P+'ccmm.hist.v2', excl:P+'ccmm.excl.v2', filt:P+'ccmm.filt.v2', who:'kmac.who' };
  const load=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $=id=>document.getElementById(id);

  const ZONES = meta.zones || [];
  const CATS = [...new Set(data.map(d=>d.cat))];
  const zl = id => (ZONES.find(z=>z.id===id)||{}).label || id;

  let hist = load(LS.hist,[]);
  let excl = load(LS.excl,{});
  let filt = load(LS.filt,null) || { cats:[...CATS], zones:ZONES.filter(z=>z.inScope!==false).map(z=>z.id) };
  let localReviews = load(LS.reviews,[]);

  // ---------- 구글 시트 동기화 (config.js 의 sheetApi 가 있을 때) ----------
  const API = ((window.CONFIG&&window.CONFIG.sheetApi)||'').trim();
  const LS2 = { cache:P+'kmac.shared.cache.v1', pending:P+'kmac.pending.v1' };
  let sharedReviews = API ? (load(LS2.cache,null) || []) : (window.REVIEWS||[]);
  let pending = API ? load(LS2.pending,[]) : [];
  let syncState = API ? 'loading' : 'local', syncMsg = '';
  async function apiGet(){ const r=await fetch(API+'?action=list&t='+Date.now(),{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); const j=await r.json(); if(!j.ok) throw new Error(j.error||'응답 오류'); return j.reviews||[]; }
  async function apiPost(body){ const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)}); if(!r.ok) throw new Error('HTTP '+r.status); const j=await r.json(); if(!j.ok) throw new Error(j.error||'저장 실패'); return j; }
  async function fetchShared(){
    if(!API) return;
    syncState='loading'; renderSync();
    try{ sharedReviews=(await apiGet()).filter(r=>KNOWN.has(r.id)); save(LS2.cache,sharedReviews); syncState='ok'; syncMsg=''; }
    catch(e){ syncState='error'; syncMsg=String(e.message||e); }
    renderSync(); render();
    if(pending.length) retryPending();
  }
  async function retryPending(){
    if(!API||!pending.length) return;
    const rest=[];
    for(const r of pending){ try{ await apiPost({action:'add',review:r}); if(!sharedReviews.find(x=>x.rid===r.rid)) sharedReviews.push(r); }catch(e){ rest.push(r); } }
    pending=rest; save(LS2.pending,pending); save(LS2.cache,sharedReviews); renderSync(); render();
  }
  function renderSync(){
    const el=$('sync'); if(!el) return;
    if(!API){ el.innerHTML='로컬 모드 · 평가는 이 브라우저에만 저장 (config.js 에 시트 주소를 넣으면 공유)'; return; }
    const n=sharedReviews.length, pend=pending.length?` · <span style="color:#b3261e">미전송 ${pending.length}건</span>`:'';
    el.innerHTML = syncState==='loading' ? '구글 시트 불러오는 중…' :
      syncState==='ok' ? `구글 시트 연결됨 · 공유 평가 ${n}건${pend}` :
      `<span style="color:#b3261e">시트 연결 실패 (${esc(syncMsg)})</span> · 캐시 ${n}건${pend}`;
  }

  // ---------- KMAC 평가 ----------
  const myName = () => load(LS.who,'');
  const allReviews = () => {
    const byId = new Map();
    if (API) {
      for (const r of sharedReviews) byId.set(r.rid, {...r, shared:true, mine: r.who===myName()});
      for (const r of pending) byId.set(r.rid, {...r, pending:true, mine:true});
    } else {
      for (const r of (window.REVIEWS||[])) byId.set(r.rid, {...r, shared:true});
      for (const r of localReviews) byId.set(r.rid, {...r, mine:true});
    }
    return [...byId.values()];
  };
  const summary = id => {
    const rs = allReviews().filter(r=>r.id===id);
    if(!rs.length) return null;
    const avg = k => rs.reduce((a,r)=>a+Number(r[k]||0),0)/rs.length;
    const taste=avg('taste'), clean=avg('clean'), kind=avg('kind');
    const priced = rs.filter(r=>Number(r.price)>0);
    const price = priced.length ? priced.reduce((a,r)=>a+Number(r.price),0)/priced.length : null;
    // 종합 = 각 평가의 항목 평균(가격 항목이 있는 평가는 4개, 없는 옛 평가는 3개)을 다시 평균
    const per = rs.map(r=>{ const ks=['taste','clean','kind'].concat(Number(r.price)>0?['price']:[]); return ks.reduce((a,k)=>a+Number(r[k]||0),0)/ks.length; });
    const overall = per.reduce((a,b)=>a+b,0)/per.length;
    return { n:rs.length, taste, clean, kind, price, overall, revisit: rs.filter(r=>r.revisit).length/rs.length };
  };
  const starText = v => { const full=Math.floor(v), half=v-full>=0.5; return '★'.repeat(full)+(half?'⯪':'')+'☆'.repeat(5-full-(half?1:0)); };
  const kmacBadge = (sm, long=false) => sm ? `<span class="kmac"><span class="st">${starText(Math.round(sm.overall*2)/2)}</span> ${sm.overall.toFixed(1)}${long?` · 맛 ${sm.taste.toFixed(1)} 청결 ${sm.clean.toFixed(1)} 친절 ${sm.kind.toFixed(1)}${sm.price?' 가격 '+sm.price.toFixed(1):''}`:''} · 재방문 ${Math.round(sm.revisit*100)}% · ${sm.n}명</span>` : '<span class="kmac">아직 평가 없음</span>';

  // ---------- 필터 UI ----------
  const catChips=$('catChips');
  function renderChips(){
    catChips.innerHTML='';
    CATS.forEach(c=>{
      const el=document.createElement('span'); el.className='chip'+(filt.cats.includes(c)?' on':''); el.textContent=c;
      el.onclick=()=>{ filt.cats = filt.cats.includes(c) ? filt.cats.filter(x=>x!==c) : [...filt.cats,c]; save(LS.filt,filt); render(); };
      catChips.appendChild(el);
    });
  }
  document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{ filt.cats = b.dataset.cat==='all' ? [...CATS] : []; save(LS.filt,filt); render(); });
  const zoneRow=$('zoneRow');
  function renderZones(){
    zoneRow.innerHTML='';
    ZONES.forEach(z=>{
      const l=document.createElement('label');
      const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=filt.zones.includes(z.id);
      cb.onchange=()=>{ filt.zones = cb.checked ? [...filt.zones,z.id] : filt.zones.filter(x=>x!==z.id); save(LS.filt,filt); render(); };
      l.appendChild(cb); l.append(' '+z.label+(z.inScope===false?' (범위 밖)':''));
      zoneRow.appendChild(l);
    });
  }
  document.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>{
    const m=b.dataset.zone; filt.zones = m==='all' ? ZONES.map(z=>z.id) : m==='scope' ? ZONES.filter(z=>z.inScope!==false).map(z=>z.id) : [];
    save(LS.filt,filt); render();
  });
  ['minKmac','includeUnrated','revisitOnly','skipRecent','skipExcluded','noFranchise','q','sortBy'].forEach(id=>$(id).addEventListener('input',render));

  function pool(){
    const min=parseFloat($('minKmac').value)||0, incUn=$('includeUnrated').checked, rvOnly=$('revisitOnly').checked;
    const skip=$('skipRecent').checked, skipEx=$('skipExcluded').checked, noFr=($('noFranchise')||{}).checked, recent=new Set(hist.slice(0,5));
    return data.filter(d=>{
      if(d.closed) return false;
      if(noFr && d.franchise) return false;
      if(skipEx && excl[d.id]) return false;
      if(!filt.cats.includes(d.cat)) return false;
      if(!filt.zones.includes(d.zone)) return false;
      const sm=summary(d.id);
      if(!sm){ if(!incUn) return false; if(rvOnly) return false; }
      else { if(sm.overall<min) return false; if(rvOnly && sm.revisit<0.5) return false; }
      if(skip && recent.has(d.id)) return false;
      return true;
    });
  }
  function filterText(){
    const parts=[];
    parts.push(filt.cats.length===CATS.length?'분류 전체':filt.cats.length?filt.cats.join('·'):'분류 없음');
    const inScope=ZONES.filter(z=>z.inScope!==false).map(z=>z.id);
    parts.push(filt.zones.length===ZONES.length?'구역 전체':(filt.zones.length===inScope.length&&inScope.every(z=>filt.zones.includes(z)))?'범위 안 구역':filt.zones.length?`구역 ${filt.zones.length}개`:'구역 없음');
    const min=parseFloat($('minKmac').value)||0; if(min) parts.push(`KMAC ${min}↑`);
    if(!$('includeUnrated').checked) parts.push('평가 있는 곳만');
    if($('revisitOnly').checked) parts.push('재방문 50%↑');
    if($('skipRecent').checked) parts.push('최근 5회 제외');
    if(($('noFranchise')||{}).checked) parts.push('프랜차이즈 제외');
    return parts.join(' · ');
  }

  // ---------- 룰렛 ----------
  const cv=$('wheel'), ctx=cv.getContext('2d');
  const colors=['--w1','--w2','--w3','--w4','--w5','--w6','--w7','--w8'].map(v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim());
  let angle=0, spinning=false, current=[];
  function drawWheel(items){
    const n=items.length, R=cv.width/2, cx=R, cy=R;
    ctx.clearRect(0,0,cv.width,cv.height);
    if(!n){ ctx.fillStyle='#ffe6ef'; ctx.beginPath(); ctx.arc(cx,cy,R-4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#a97a90'; ctx.font='bold 34px Noto Sans KR, sans-serif'; ctx.textAlign='center'; ctx.fillText('후보가 없습니다',cx,cy+12); return; }
    const step=Math.PI*2/n;
    for(let i=0;i<n;i++){
      const a0=angle+i*step, a1=a0+step;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R-4,a0,a1); ctx.closePath();
      ctx.fillStyle=colors[i%colors.length]; if(n%colors.length===1 && i===n-1) ctx.fillStyle=colors[(i+3)%colors.length];
      ctx.fill(); ctx.strokeStyle='#ffffff'; ctx.lineWidth=2.5; ctx.stroke();
      ctx.save(); ctx.translate(cx,cy); const mid=a0+step/2, left=Math.cos(mid)<0; ctx.rotate(left?mid+Math.PI:mid); ctx.textAlign=left?'left':'right'; ctx.fillStyle='#5a3648';
      const fs = n>90?11:n>60?13:n>40?15:n>28?18:n>18?22:n>8?26:30; ctx.font=`700 ${fs}px Noto Sans KR, sans-serif`;
      let t=items[i].name; const maxW=R*0.62; while(ctx.measureText(t).width>maxW && t.length>2) t=t.slice(0,-1);
      if(t!==items[i].name) t=t.replace(/\s+$/,'')+'…';
      ctx.fillText(t,left?-(R-26):R-26,fs*0.36); ctx.restore();
    }
  }
  function pickIndex(items){ const n=items.length, step=Math.PI*2/n; const norm=(((-Math.PI/2-angle)%(Math.PI*2))+Math.PI*4)%(Math.PI*2); return Math.floor(norm/step)%n; }
  const spinBtn=$('spin');
  function spin(){
    if(spinning) return;
    const items=pool(); if(!items.length){ toast('조건에 맞는 후보가 없어요. 필터를 풀어 주세요.'); return; }
    closeModals(); current=items; spinning=true; spinBtn.disabled=true;
    const total=Math.PI*2*(6+Math.random()*3)+Math.random()*Math.PI*2;
    const dur=4200+Math.random()*1200, start=performance.now(), a0=angle, ease=t=>1-Math.pow(1-t,4);
    (function frame(now){ const t=Math.min(1,(now-start)/dur); angle=a0+total*ease(t); drawWheel(current); if(t<1) requestAnimationFrame(frame); else finish(current[pickIndex(current)]); })(start);
  }
  spinBtn.onclick=spin;
  const naverUrl=d=>'https://map.naver.com/p/search/'+encodeURIComponent(d.q||(d.name+' 여의도'));
  const kakaoUrl=d=>'https://map.kakao.com/?q='+encodeURIComponent(d.q||(d.name+' 여의도'));
  function finish(d){
    spinning=false; spinBtn.disabled=false;
    hist=[d.id,...hist.filter(x=>x!==d.id)].slice(0,10); save(LS.hist,hist);
    const CH=APP.cheerers||['bunny','bear','cat']; const cheerer=CH[Math.floor(Math.random()*CH.length)];
    const lines=APP.lines||['오늘은 여기!','맛있게 먹고 와~','여기 어때?','고민 끝!','출발~'];
    $('resultBody').innerHTML=`
      <div class="cheer"><svg aria-hidden="true"><use href="#${cheerer}"/></svg><span class="bubble">${lines[Math.floor(Math.random()*lines.length)]}</span></div>
      <div class="name">${esc(d.name)}</div>
      <div class="meta">${esc(d.cat)} · ${esc(d.menu||'')}${d.price?' · '+esc(d.price):''}</div>
      <div class="addr">${esc(d.addr||'')}${d.bldg?' <span class="badge">'+esc(d.bldg)+'</span>':''}<br><span class="badge">${esc(zl(d.zone))}</span>${d.franchise?' <span class="badge">프랜차이즈</span>':''}${d.src?' <span class="badge">'+esc(d.src)+'</span>':''}</div>
      <div>${kmacBadge(summary(d.id),true)}</div>
      <div class="actions">
        <a class="btn" style="background:#03c75a;color:#fff;border-color:#03c75a" target="_blank" rel="noopener" href="${naverUrl(d)}">네이버지도</a>
        <a class="btn" style="background:#fee500;color:#191600;border-color:#fee500" target="_blank" rel="noopener" href="${kakaoUrl(d)}">카카오맵</a>
        <button class="btn primary" id="rateFromResult">KMAC 평가하기</button>
      </div>
      <div class="actions">
        <button class="btn" id="again">다시 돌리기</button>
        <button class="btn ghost" id="skipToday">오늘은 빼고 다시</button>
        <button class="btn ghost" data-close>닫기</button>
      </div>`;
    openModal('resultModal');
    $('again').onclick=spin;
    $('skipToday').onclick=()=>{ excl[d.id]=true; save(LS.excl,excl); render(); spin(); };
    $('rateFromResult').onclick=()=>openRate(d);
    renderHistory();
  }

  // ---------- 팝업 공통 ----------
  function openModal(id){ $(id).classList.add('open'); }
  function closeModals(){ document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open')); }
  document.querySelectorAll('.modal').forEach(m=>{ m.addEventListener('click',e=>{ if(e.target===m || e.target.closest('[data-close]')) closeModals(); }); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModals(); });
  let toastT; function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2200); }

  // ---------- 별점 입력 위젯 (0.5 단위) ----------
  const STAR = '<svg viewBox="0 0 24 24"><defs><linearGradient id="G" x1="0" x2="1"><stop offset="50%" stop-color="#f5a623"/><stop offset="50%" stop-color="#ffe6ef"/></linearGradient></defs><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" stroke="#e8a6c0" stroke-width="1.2"/></svg>';
  let draft={taste:0,clean:0,kind:0,price:0,revisit:null}; let rateTarget=null;
  function buildStars(){
    document.querySelectorAll('#rateModal .stars').forEach(row=>{
      row.innerHTML='';
      for(let i=1;i<=5;i++){
        const st=document.createElement('div'); st.className='star'; st.innerHTML=STAR+`<button class="half l" data-val="${i-0.5}" aria-label="${i-0.5}점"></button><button class="half r" data-val="${i}" aria-label="${i}점"></button>`;
        row.appendChild(st);
      }
      row.onclick=e=>{ const b=e.target.closest('.half'); if(!b) return; const k=row.dataset.key; const v=Number(b.dataset.val); draft[k] = (draft[k]===v && v===0.5) ? 0 : v; paintStars(); };
    });
  }
  function paintStars(){
    document.querySelectorAll('#rateModal .stars').forEach(row=>{
      const v=draft[row.dataset.key]||0;
      row.querySelectorAll('.star').forEach((st,i)=>{ const p=st.querySelector('path'); const idx=i+1; p.setAttribute('fill', v>=idx?'#f5a623': v>=idx-0.5?'url(#G)':'#ffe6ef'); });
      document.querySelector(`[data-v="${row.dataset.key}"]`).textContent=v.toFixed(1);
    });
    document.querySelectorAll('#revisitSeg button').forEach(b=>b.classList.toggle('on', draft.revisit===(b.dataset.rv==='y')));
  }
  document.querySelectorAll('#revisitSeg button').forEach(b=>b.onclick=()=>{ draft.revisit=(b.dataset.rv==='y'); paintStars(); });
  buildStars();
  function openRate(d){
    rateTarget=d; draft={taste:0,clean:0,kind:0,price:0,revisit:null};
    $('rateTitle').textContent=`KMAC 별점 · ${d.name}`;
    $('who').value=load(LS.who,''); $('note').value='';
    paintStars(); renderReviewList(d); closeModals(); openModal('rateModal');
  }
  $('saveRate').onclick=()=>{
    if(!rateTarget) return;
    const who=$('who').value.trim();
    if(!who) return toast('닉네임을 넣어 주세요.');
    if(!draft.taste||!draft.clean||!draft.kind||!draft.price) return toast('맛·청결·친절도·가격 별점을 모두 매겨 주세요.');
    const price=draft.price;
    if(draft.revisit===null) return toast('재방문 의사를 골라 주세요.');
    save(LS.who,who);
    const r={ rid:Date.now().toString(36)+Math.random().toString(36).slice(2,6), id:rateTarget.id, who, taste:draft.taste, clean:draft.clean, kind:draft.kind, revisit:draft.revisit, price, note:$('note').value.trim(), date:new Date().toISOString().slice(0,10) };
    if (API) {
      pending.push(r); save(LS2.pending,pending); renderReviewList(rateTarget); render(); renderSync();
      const target=rateTarget;
      apiPost({action:'add',review:r}).then(()=>{ pending=pending.filter(x=>x.rid!==r.rid); save(LS2.pending,pending); sharedReviews.push(r); save(LS2.cache,sharedReviews); toast('구글 시트에 저장했어요.'); if(rateTarget===target) renderReviewList(target); render(); renderSync(); })
        .catch(e=>{ toast('시트 전송 실패, 임시 보관했어요. 나중에 자동 재시도합니다.'); renderSync(); });
    } else {
      localReviews.push(r); save(LS.reviews,localReviews);
      toast('저장했어요. "평가 내보내기"로 팀과 공유할 수 있어요.');
      renderReviewList(rateTarget); render();
    }
  };
  function renderReviewList(d){
    const rs=allReviews().filter(r=>r.id===d.id).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    const sm=summary(d.id);
    $('reviewList').innerHTML = `<div class="sm" style="font-weight:900;color:var(--muted);font-size:12px">이 식당의 평가 ${rs.length}건 ${sm?'· 평균 '+sm.overall.toFixed(2):''}</div>` +
      rs.map(r=>`<div class="review"><div><span class="who">${esc(r.who)}</span> <span class="sm">${esc(r.date||'')}${r.pending?' · <span style="color:#b3261e">미전송</span>':''}</span><br>
        맛 ${Number(r.taste).toFixed(1)} · 청결 ${Number(r.clean).toFixed(1)} · 친절 ${Number(r.kind).toFixed(1)} ${Number(r.price)>0?' · 가격 '+Number(r.price).toFixed(1):''} · 재방문 ${r.revisit?'Y':'N'}${r.note?'<br><span class="sm">'+esc(r.note)+'</span>':''}</div>
        ${r.mine?`<button data-del="${esc(r.rid)}">삭제</button>`:''}</div>`).join('');
    $('reviewList').querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
      const rid=b.dataset.del;
      if(!confirm('이 평가를 삭제할까요?')) return;
      if (API) {
        if (pending.find(x=>x.rid===rid)) { pending=pending.filter(x=>x.rid!==rid); save(LS2.pending,pending); }
        else { try{ await apiPost({action:'delete',rid,who:myName()}); sharedReviews=sharedReviews.filter(x=>x.rid!==rid); save(LS2.cache,sharedReviews); toast('삭제했어요.'); }catch(e){ return toast('삭제 실패: '+e.message); } }
      } else { localReviews=localReviews.filter(x=>x.rid!==rid); save(LS.reviews,localReviews); }
      renderReviewList(d); render(); renderSync();
    });
  }

  // ---------- 표 ----------
  function renderTable(){
    const q=($('q').value||'').trim().toLowerCase(), sort=$('sortBy').value;
    const tb=document.querySelector('#tbl tbody'); tb.innerHTML='';
    const pset=new Set(pool().map(d=>d.id));
    const zi=id=>ZONES.findIndex(z=>z.id===id);
    const rows=data.slice().sort((a,b)=>{
      if(sort==='kmac'){ const sa=summary(a.id), sb=summary(b.id); return ((sb?sb.overall:-1)-(sa?sa.overall:-1)) || a.name.localeCompare(b.name,'ko'); }
      if(sort==='name') return a.name.localeCompare(b.name,'ko');
      if(sort==='cat') return a.cat.localeCompare(b.cat,'ko') || a.name.localeCompare(b.name,'ko');
      return zi(a.zone)-zi(b.zone) || a.name.localeCompare(b.name,'ko');
    });
    rows.forEach(d=>{
      const hay=[d.name,d.cat,d.menu,d.bldg,d.addr,zl(d.zone),d.src].join(' ').toLowerCase();
      if(q && !hay.includes(q)) return;
      const sm=summary(d.id);
      const tr=document.createElement('tr'); if(!pset.has(d.id)) tr.className='off';
      tr.innerHTML=`
        <td><input type="checkbox" ${excl[d.id]?'':'checked'} title="후보에서 제외/포함"></td>
        <td><div class="nm">${esc(d.name)}${d.franchise?'<span class="badge">프랜차이즈</span>':''}${d.closed?'<span class="badge out">제외</span>':''}</div><div class="sm">${esc(d.bldg||'')}</div></td>
        <td>${esc(d.cat)}<div class="sm">${esc(d.menu||'')}${d.price?' · '+esc(d.price):''}${d.src?'<br>'+esc(d.src):''}</div></td>
        <td class="sm">${esc(zl(d.zone))}<br>${esc(d.addr||'')}</td>
        <td>${kmacBadge(sm)}</td>
        <td class="map"><button class="btn" data-rate>평가</button><br><a target="_blank" rel="noopener" href="${naverUrl(d)}">네이버</a> · <a target="_blank" rel="noopener" href="${kakaoUrl(d)}">카카오</a></td>`;
      tr.querySelector('input[type=checkbox]').onchange=e=>{ if(e.target.checked) delete excl[d.id]; else excl[d.id]=true; save(LS.excl,excl); render(); };
      tr.querySelector('[data-rate]').onclick=()=>openRate(d);
      tb.appendChild(tr);
    });
  }
  function renderHistory(){
    const h=$('history'); h.innerHTML='';
    if(!hist.length) return;
    const lbl=document.createElement('span'); lbl.textContent='최근 당첨'; h.appendChild(lbl);
    hist.slice(0,5).forEach(id=>{ const d=data.find(x=>x.id===id); if(!d) return; const s=document.createElement('span'); s.textContent=d.name; h.appendChild(s); });
  }
  function render(){
    renderChips(); renderZones();
    const p=pool(); current=p; drawWheel(p);
    const rated=data.filter(d=>summary(d.id)).length, nrev=allReviews().length;
    $('poolCount').textContent=`지금 ${p.length}곳`;
    $('poolCnt').textContent=p.length; $('filterText').textContent=filterText();
    $('stats').innerHTML=`전체 후보 <b>${data.length}</b>곳 · KMAC 평가 <b>${rated}</b>곳 (${nrev}건) · 룰렛 대상 <b>${p.length}</b>곳`;
    $('foot').innerHTML=meta.footer||'';
    renderTable(); renderHistory();
  }

  // ---------- 내보내기 / 가져오기 / 초기화 ----------
  $('exportBtn').onclick=()=>{
    const out=allReviews().map(({shared,...r})=>r);
    if(!out.length) return toast('내보낼 평가가 없어요.');
    const blob=new Blob([JSON.stringify(out,null,1)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`kmac-reviews-${new Date().toISOString().slice(0,10)}.json`; a.click();
    toast(`평가 ${out.length}건을 내보냈어요. reviews.js 에 붙여 넣으면 팀 공유!`);
  };
  $('importBtn').onclick=()=>$('importFile').click();
  $('importFile').onchange=async e=>{
    const f=e.target.files[0]; if(!f) return;
    try{ const arr=JSON.parse(await f.text()); if(!Array.isArray(arr)) throw 0;
      const have=new Set(allReviews().map(r=>r.rid)); let n=0;
      for(const r of arr){ if(r&&r.rid&&r.id&&!have.has(r.rid)){ (API?pending:localReviews).push(r); have.add(r.rid); n++; } }
      if(API){ save(LS2.pending,pending); toast(`평가 ${n}건을 시트로 보내는 중…`); retryPending(); } else { save(LS.reviews,localReviews); toast(`평가 ${n}건을 가져왔어요.`); }
      render();
    }catch{ toast('JSON 형식이 아니에요.'); }
    e.target.value='';
  };
  $('resetBtn').onclick=()=>{
    if(!confirm('이 브라우저에 저장된 제외·당첨 기록·필터·닉네임을 지울까요? (구글 시트의 평가는 남습니다)')) return;
    Object.values(LS).forEach(k=>{try{localStorage.removeItem(k)}catch(e){}}); location.reload();
  };
  $('refreshBtn').onclick=()=>{ if(!API) return toast('로컬 모드예요. config.js 에 시트 주소를 넣으면 공유됩니다.'); fetchShared(); };
  render(); renderSync(); fetchShared();
})();

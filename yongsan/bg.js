// 용산 배경 (2안): 낮은 대비의 가는 선 일러스트. 화면 아래쪽에 작게 깔리고, 위쪽은 은은한 그라데이션과 디지털 점 격자.
// 랜드마크: 한강철교 · 용산역 · 전자상가 · 남산타워 (오리지널 선화, 외부 이미지 없음). 카테고리(body[data-cat])마다 색만 바뀐다.
(function(){
  const THEMES = {
    lunch:  { top:'#f4f8ff', bottom:'#e6effc', line:'#b7c7e0', fill:'#eef3fb', accent:'#6f9fe8', orb:'sun' },
    dinner: { top:'#fff6ef', bottom:'#fde4d6', line:'#e2b8a4', fill:'#fdeee5', accent:'#f08a5d', orb:'sun' },
    date:   { top:'#f8f3ff', bottom:'#f2e4f3', line:'#cdb8e2', fill:'#f4ecf8', accent:'#d978aa', orb:'moon' },
    team:   { top:'#eef4f6', bottom:'#dde9ee', line:'#a6bcc7', fill:'#e8f0f3', accent:'#1fa595', orb:'moon' }
  };
  function svg(T){
    const L=`stroke="${T.line}" stroke-width="1.1" fill="${T.fill}" stroke-linejoin="round"`;
    const thin=`stroke="${T.line}" stroke-width=".7" fill="none"`;
    let s='';
    // 먼 스카이라인 (아주 옅게)
    const far=[[0,92,26],[30,86,18],[52,95,30],[300,80,22],[330,88,16],[520,84,24],[548,92,20],[572,78,28]];
    far.forEach(([x,y,w])=>s+=`<rect x="${x}" y="${y}" width="${w}" height="${112-y}" fill="${T.line}" opacity=".18"/>`);
    // 해·달 (작은 외곽선)
    s+= T.orb==='sun' ? `<circle cx="96" cy="34" r="9" fill="none" stroke="${T.accent}" stroke-width="1" opacity=".55"/>`
                      : `<path d="M100 26 a9 9 0 1 0 6 15 a7 7 0 1 1 -6 -15z" fill="none" stroke="${T.accent}" stroke-width="1" opacity=".6"/>`;
    // 한강철교 (왼쪽): 트러스 아치 3칸
    for(let i=0;i<3;i++){ const x=4+i*44;
      s+=`<path d="M${x} 100 Q${x+22} 78 ${x+44} 100" ${thin}/>`;
      for(let k=1;k<6;k++){ const px=x+k*44/6, py=100-Math.sin(Math.PI*k/6)*11; s+=`<line x1="${px}" y1="${py}" x2="${px}" y2="100" ${thin}/>`; }
    }
    s+=`<line x1="0" y1="100" x2="136" y2="100" stroke="${T.line}" stroke-width="1.1"/>`;
    s+=`<g class="train"><rect x="0" y="95.5" width="22" height="4" rx="1.5" fill="${T.accent}" opacity=".7"/></g>`;
    // 용산역 (긴 역사 + 낮은 지붕선)
    s+=`<path d="M144 112 V86 H286 V112" ${L}/><path d="M140 86 L156 76 H274 L290 86" ${L}/>`;
    for(let x=152;x<280;x+=9) s+=`<rect x="${x}" y="92" width="5" height="9" rx="1" ${thin}/>`;
    s+=`<line x1="168" y1="81" x2="262" y2="81" stroke="${T.accent}" stroke-width="1" opacity=".55"/>`;
    // 전자상가 (빌딩 3동 + 작은 전광판)
    [[296,64,26],[326,52,30],[360,70,22]].forEach(([x,y,w])=>{
      s+=`<rect x="${x}" y="${y}" width="${w}" height="${112-y}" ${L}/>`;
      for(let yy=y+6; yy<108; yy+=6) s+=`<line x1="${x+4}" y1="${yy}" x2="${x+w-4}" y2="${yy}" ${thin} opacity=".7"/>`;
    });
    s+=`<rect x="331" y="44" width="20" height="10" rx="1.5" fill="${T.fill}" stroke="${T.line}" stroke-width="1"/><rect class="screen" x="334" y="47" width="14" height="4" rx="1" fill="${T.accent}" opacity=".6"/>`;
    [[300,58],[364,64]].forEach(([x,y],i)=>s+=`<circle class="glint" style="animation-delay:${i*1.3}s" cx="${x}" cy="${y}" r="1.4" fill="${T.accent}"/>`);
    // 남산 + 남산타워
    s+=`<path d="M392 112 Q440 74 470 76 Q500 78 540 112" ${L}/>`;
    s+=`<line x1="468" y1="77" x2="468" y2="44" stroke="${T.line}" stroke-width="2"/><rect x="461" y="40" width="14" height="6" rx="2" ${L}/><rect x="463" y="35" width="10" height="5" rx="1.5" ${L}/><line x1="468" y1="35" x2="468" y2="22" stroke="${T.line}" stroke-width="1"/>`;
    s+=`<circle class="glint" cx="468" cy="21" r="1.4" fill="${T.accent}"/>`;
    // 오른쪽 낮은 건물 + 다리 이어짐
    [[544,96,18],[566,90,14]].forEach(([x,y,w])=>s+=`<rect x="${x}" y="${y}" width="${w}" height="${112-y}" ${L}/>`);
    s+=`<line x1="0" y1="112" x2="600" y2="112" stroke="${T.line}" stroke-width="1.1"/>`;
    // 왼쪽(철교·용산역)과 오른쪽(전자상가·남산타워)을 화면 양끝에 따로 붙여, 가운데 카드 뒤가 비도록 한다
    return `<svg class="l" viewBox="0 0 292 120" style="aspect-ratio:292/120">${s}</svg><svg class="r" viewBox="288 0 312 120" style="aspect-ratio:312/120">${s}</svg>`;
  }
  function render(){
    const el=document.getElementById('bg'); if(!el) return;
    const T=THEMES[document.body.dataset.cat]||THEMES.lunch;
    el.style.setProperty('--bg-top',T.top); el.style.setProperty('--bg-bottom',T.bottom); el.style.setProperty('--bg-dot',T.line);
    el.innerHTML=`<div class="dots"></div><div class="skyline">${svg(T)}</div>`;
  }
  let last='';
  new MutationObserver(()=>{ const c=document.body.dataset.cat; if(c!==last){ last=c; render(); } }).observe(document.body,{attributes:true,attributeFilter:['data-cat']});
  last=document.body.dataset.cat; render();
})();

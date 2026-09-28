// 카카오 로컬 API 로 서여의도 범위 안의 카페(또는 식당)를 전부 뽑아 후보 파일 초안을 만든다.
//
// 준비: https://developers.kakao.com → 내 애플리케이션 → 앱 키 → REST API 키
// 실행 (Windows PowerShell):
//   $env:KAKAO_REST_API_KEY="여기에키"; node scripts/kakao-places.mjs --type cafe
//   $env:KAKAO_REST_API_KEY="여기에키"; node scripts/kakao-places.mjs --type food
// 실행 (mac/Linux):
//   KAKAO_REST_API_KEY=여기에키 node scripts/kakao-places.mjs --type cafe
//
// 결과: cafe/kakao-candidates.js (또는 kakao-candidates.js). data.js 와 같은 형식이라
//       마음에 드는 줄만 골라 data.js / cafe/data.js 에 붙여 넣으면 된다.
// 옵션: --rect minLon,minLat,maxLon,maxLat  (기본값은 서여의도 대략 범위. 지도에서 좌표 확인 후 조정 가능)
//       --out 경로   --all (구역 밖으로 판정된 곳도 파일에 포함)

const KEY = process.env.KAKAO_REST_API_KEY;
if (!KEY) { console.error('KAKAO_REST_API_KEY 환경변수가 필요합니다.'); process.exit(1); }
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const TYPE = opt('--type', 'cafe');                       // cafe | food
const RECT = opt('--rect', '126.9120,37.5215,126.9265,37.5345').split(',').map(Number); // 대략 국회~여의도공원 서측
const OUT  = opt('--out', TYPE === 'cafe' ? 'cafe/kakao-candidates.js' : 'kakao-candidates.js');
const ALL  = args.includes('--all');

const H = { Authorization: `KakaoAK ${KEY}` };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function kakao(path, params) {
  const u = new URL('https://dapi.kakao.com/v2/local/search/' + path);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: H });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}
// 셀 하나에서 최대 45건(15×3페이지)까지만 나오므로, 45건이 꽉 차면 4등분해서 다시 조회한다.
async function collect(params, rect, depth, acc) {
  const [x1, y1, x2, y2] = rect; let total = 0;
  for (let page = 1; page <= 3; page++) {
    const j = await kakao(params.path, { ...params.q, rect: rect.join(','), page, size: 15 });
    for (const d of j.documents) acc.set(d.id, d);
    total = j.meta.pageable_count;
    if (j.meta.is_end) break;
    await sleep(80);
  }
  if (total >= 45 && depth < 4) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    for (const r of [[x1, y1, mx, my], [mx, y1, x2, my], [x1, my, mx, y2], [mx, my, x2, y2]]) await collect(params, r, depth + 1, acc);
  }
}

const found = new Map();
const queries = TYPE === 'cafe'
  ? [{ path: 'category.json', q: { category_group_code: 'CE7' } },
     ...['베이커리', '빵집', '디저트', '빙수', '도넛', '아이스크림', '케이크', '차'].map(k => ({ path: 'keyword.json', q: { query: k, category_group_code: 'CE7' } })),
     ...['베이커리', '빵집'].map(k => ({ path: 'keyword.json', q: { query: k } }))]
  : [{ path: 'category.json', q: { category_group_code: 'FD6' } }];
for (const qq of queries) { process.stdout.write(`조회: ${qq.q.query || qq.q.category_group_code} … `); const before = found.size; await collect(qq, RECT, 0, found); console.log(`+${found.size - before}`); }

// ── 우리 데이터 형식으로 변환
const BRANDS = /스타벅스|투썸|이디야|메가MGC|메가커피|컴포즈|빽다방|파리바게뜨|파리크라상|뚜레쥬르|던킨|배스킨|팀홀튼|아티제|매머드|나이스카페인|에센스커피|텐퍼센트|커피기업|더치앤빈|남대문커피|미켈레|파스쿠찌|커피빈|커피베이|드롭탑|더벤티|브루다|폴바셋|선선10|픽스커피|보헤미안|칠커피|할리스|엔제리너스|탐앤탐스|카페베네|공차|쥬씨|요거프레소|설빙|크리스피|블루샥|하삼동|감성커피|커피에반하다|만랩|달콤|커피스미스|카페게이트|더리터|매머드|엔젤리너스|하이오커피|텐퍼센트|커피명가|셀렉토|토프레소|카페마마스|고디바|노티드|런던베이글|본죽|김밥천국|맘스터치|맥도날드|버거킹|롯데리아|서브웨이|써브웨이|한솥|김가네|역전우동|홍콩반점|새마을식당|백종원|빽보이|더본|채선당|놀부|원할머니|봉추|굽네|BBQ|교촌|BHC|미스터피자|도미노|피자헛|파파존스|본도시락|오니기리|이삭토스트|명륜진사|하남돼지|육전식당|한촌설렁탕|신선설농탕|신전떡볶이|엽기떡볶이|동대문엽기|죠스떡볶이|바르다김선생|고봉민김밥|얌샘김밥|사위식당|김삼보|무공돈까스|순남시래기|바스버거|완뚝|계림닭도리탕|보승회관|한첩|고수타코|소공동뚝배기|동남집|카돈마리|전주본가|이루|비욘드비엣남|에머이|포메인|미분당|역전할머니|한신포차|이화수|유가네|명동칼국수|봉평|온기정|홍대개미|오봉집|육회바른연어|강남불백|연안식당|장수촌|장충동|삼삼|명인만두|북촌손만두|구이구이|삼겹살/;
const catOf = d => {
  const c = d.category_name;
  if (TYPE === 'food') { if (/일식|초밥|돈까스|우동|라멘/.test(c)) return '일식'; if (/중식|중국/.test(c)) return '중식'; if (/양식|이탈리|패스트푸드|햄버거|피자|스테이크|샌드위치/.test(c)) return '양식'; if (/아시아|베트남|태국|인도|멕시코/.test(c)) return '아시안'; if (/한식|분식|국밥|찌개|고기|치킨/.test(c)) return /분식/.test(c) ? '분식·기타' : '한식'; return '분식·기타'; }
  if (/제과|베이커리|빵/.test(c)) return '베이커리'; if (/아이스크림|빙수|요거트/.test(c)) return '빙수·아이스크림'; if (/디저트|도넛|와플|케이크|마카롱/.test(c)) return '디저트'; if (/차|전통찻집|음료|주스/.test(c) && !/커피/.test(c)) return '차·음료'; return '커피';
};
const zoneOf = addr => {
  const m = addr.match(/(국회대로\d+[가-힣]?길|국회대로|은행로|의사당대로|여의공원로|여의서로|국제금융로\d*길?|여의나루로|여의대로)\s*(\d+)/);
  if (!m) return 'unknown';
  const [_, road, no] = m; const n = Number(no);
  if (road === '여의공원로') return n === 101 ? 'ccmm' : (n <= 20 ? 'west' : 'bank');
  if (road === '은행로') return 'bank';
  if (/^국회대로\d+/.test(road)) return 'alley';
  if (road === '국회대로') return n >= 700 ? 'main' : 'unknown';
  if (road === '의사당대로') return n <= 1 ? 'west' : n <= 60 ? 'station' : 'out';
  if (road === '여의서로') return 'alley';
  if (road === '국제금융로') return n <= 30 ? 'station' : 'out';
  return 'out'; // 여의나루로·여의대로·국제금융로 N길 = 여의도공원 동측
};
const rows = [], skipped = [];
for (const d of found.values()) {
  const addr = (d.road_address_name || d.address_name || '').replace(/^서울(특별시)?\s*영등포구\s*/, '');
  if (!/여의도/.test(d.address_name || '')) { skipped.push(d.place_name + ' (' + addr + ')'); continue; }
  const zone = zoneOf(addr);
  if ((zone === 'out') && !ALL) { skipped.push(d.place_name + ' (' + addr + ')'); continue; }
  rows.push({ id: (TYPE === 'cafe' ? 'cafe-k' : 'k') + d.id, name: d.place_name, cat: catOf(d), menu: d.category_name.split(' > ').slice(-1)[0], price: '',
    addr, bldg: '', zone: zone === 'out' ? 'unknown' : zone, src: 'kakao ' + d.place_url, q: d.place_name + ' 여의도', ...(BRANDS.test(d.place_name) ? { franchise: true } : {}) });
}
rows.sort((a, b) => a.zone.localeCompare(b.zone) || a.name.localeCompare(b.name, 'ko'));
const fs = await import('node:fs');
fs.writeFileSync(OUT, `// 카카오 로컬 API 수집 결과 (${new Date().toISOString().slice(0, 10)}, ${TYPE}, rect=${RECT.join(',')})\n// 검토 후 필요한 줄만 data.js 로 옮기세요. zone 이 "unknown" 인 줄은 구역을 직접 정해 주세요.\nwindow.KAKAO_CANDIDATES = [\n${rows.map(r => '  ' + JSON.stringify(r) + ',').join('\n')}\n];\n`);
console.log(`\n총 ${found.size}건 조회 → 후보 ${rows.length}건 저장: ${OUT}`);
console.log(`구역별: ${Object.entries(rows.reduce((a, r) => (a[r.zone] = (a[r.zone] || 0) + 1, a), {})).map(([k, v]) => k + ' ' + v).join(', ')}`);
if (skipped.length) console.log(`범위 밖으로 제외 ${skipped.length}건 (예: ${skipped.slice(0, 5).join(' / ')})  ※ --all 로 전부 포함 가능`);

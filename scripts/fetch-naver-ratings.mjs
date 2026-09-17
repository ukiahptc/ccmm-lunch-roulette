// 네이버지도 별점 자동 수집 → data.js 의 naver 값 갱신
//
// 사용법 (저장소 루트에서):
//   npm run setup                 # 최초 1회: playwright + chromium 설치
//   npm run ratings               # 전체 수집 후 data.js 갱신 (data.js.bak 백업 생성)
//   npm run ratings:dry           # data.js 는 건드리지 않고 결과만 출력
//   node scripts/fetch-naver-ratings.mjs --only jungin,masam   # 일부만
//   node scripts/fetch-naver-ratings.mjs --headful             # 브라우저 창 보면서 실행
//   node scripts/fetch-naver-ratings.mjs --force               # 이미 별점 있는 곳도 다시
//
// 동작: 가게마다 m.place.naver.com 검색 결과(서버가 넣어 주는 __APOLLO_STATE__ JSON)에서
//       여의도 소재 후보를 고르고 visitorReviewScore(별점)·visitorReviewCount(리뷰 수)를 읽는다.
//       검색 결과에 별점이 없으면 가게 홈 페이지를 한 번 더 열어 본다.
//       네이버 별점은 업주가 비공개로 둘 수 있어 값이 없는 가게가 정상적으로 존재한다.
// 주의: 네이버 화면 구조가 바뀌면 파싱이 깨질 수 있다. 그 경우 실패 목록이 report 에 남는다.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data.js');
const REPORT = path.join(ROOT, 'ratings-report.json');
const PROFILE = path.join(ROOT, '.naver-profile');

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const DRY = flag('--dry-run');
const HEADFUL = flag('--headful');
const FORCE = flag('--force');
const ONLY = (opt('--only') || '').split(',').map(s => s.trim()).filter(Boolean);
const DELAY_MS = Number(opt('--delay') || 2000);
const BASE = process.env.NAVER_BASE || 'https://m.place.naver.com'; // 테스트용 오버라이드

// ---------- data.js 읽기 (한 줄 = 가게 하나 인 JSON) ----------
const src = fs.readFileSync(DATA, 'utf8');
const lines = src.split('\n');
const rows = []; // {lineIdx, obj}
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  if (!t.startsWith('{"id"')) continue;
  try { rows.push({ lineIdx: i, obj: JSON.parse(t.replace(/,\s*$/, '')) }); }
  catch (e) { console.warn(`  ! ${i + 1}행 JSON 파싱 실패, 건너뜀`); }
}
console.log(`data.js 에서 ${rows.length}곳 읽음`);

const targets = rows.filter(r =>
  (ONLY.length ? ONLY.includes(r.obj.id) : true) &&
  (FORCE || r.obj.naver == null)
);
console.log(`수집 대상 ${targets.length}곳 (${DRY ? 'dry-run' : 'data.js 갱신'})\n`);

// ---------- 유틸 ----------
const sleep = (ms) => new Promise(r => setTimeout(r, ms + Math.random() * 800));
const norm = (s) => String(s || '').replace(/\s+/g, '').replace(/[()（）·・,.\-‐–—'"`]/g, '').toLowerCase();
const baseName = (s) => String(s || '').replace(/\(.*?\)/g, ' ').replace(/(서여의도점|여의도점|국회의사당점|국회점|KBS점|본점|본관|별관점|여의도KBS점|국회의사당역KBS본점|서여의도 KBS3호점|한국거래소점|서여의도)/g, ' ').trim();
const roadKey = (addr) => (String(addr || '').match(/(국회대로\d*[가-힣]*길|국회대로|은행로|의사당대로|여의공원로|여의나루로|국제금융로\d*길|국제금융로)\s*(\d+)?/) || []).slice(1, 3).join(' ').trim();

function pickCandidate(row, list) {
  const nameN = norm(row.name), baseN = norm(baseName(row.name));
  const myRoad = roadKey(row.addr);
  let best = null, bestScore = -1;
  for (const c of list) {
    const cn = norm(c.name);
    const addr = `${c.roadAddress || ''} ${c.address || ''}`;
    let s = 0;
    if (!/여의도|영등포/.test(addr)) continue;                 // 여의도 밖은 제외
    if (cn === nameN) s += 6; else if (cn.includes(baseN) || baseN.includes(cn)) s += 4; else if (cn.slice(0, 2) === baseN.slice(0, 2)) s += 1; else continue;
    if (myRoad && addr.replace(/\s+/g, ' ').includes(myRoad)) s += 3;
    else if (myRoad && addr.includes(myRoad.split(' ')[0])) s += 1;
    if (c.visitorReviewScore) s += 0.5;
    if (s > bestScore) { bestScore = s; best = c; }
  }
  return bestScore >= 4 ? best : null;
}

function extractApollo(html) {
  const m = html.match(/window\.__APOLLO_STATE__\s*=\s*(\{[\s\S]*?\});\s*(?:<\/script>|window\.)/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

function listFromApollo(state) {
  const out = [];
  for (const [k, v] of Object.entries(state || {})) {
    if (!v || typeof v !== 'object') continue;
    if (/^(RestaurantListSummary|PlaceSummary|RestaurantSummary)/.test(k) || (v.__typename && /Summary$/.test(v.__typename) && v.name)) {
      out.push({
        id: v.id, name: v.name, category: v.category,
        roadAddress: v.roadAddress || v.fullRoadAddress, address: v.address || v.fullAddress,
        visitorReviewScore: v.visitorReviewScore ?? null,
        visitorReviewCount: v.visitorReviewCount ?? null,
      });
    }
  }
  return out;
}

async function fetchHomeScore(page, placeId) {
  // 검색 결과에 별점이 없을 때 홈 페이지에서 한 번 더 시도
  const url = `${BASE}/restaurant/${placeId}/home`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1200);
  const html = await page.content();
  let score = null, count = null;
  const st = extractApollo(html);
  if (st) for (const v of Object.values(st)) {
    if (v && typeof v === 'object' && (v.visitorReviewScore || v.visitorReviewsScore)) {
      score = v.visitorReviewScore || v.visitorReviewsScore; count = v.visitorReviewCount ?? v.visitorReviewsTotal ?? count; break;
    }
  }
  if (!score) {
    const m = html.match(/"visitorReviewScore"\s*:\s*"?(\d\.\d{1,2})"?/) || html.match(/별점\s*(\d\.\d{1,2})/);
    if (m) score = m[1];
  }
  if (!count) { const m = html.match(/"visitorReviewCount"\s*:\s*"?(\d[\d,]*)"?/); if (m) count = m[1]; }
  return { score, count, url };
}

// ---------- 메인 ----------
const browser = await chromium.launchPersistentContext(PROFILE, {
  headless: !HEADFUL,
  locale: 'ko-KR',
  viewport: { width: 420, height: 900 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await browser.newPage();
const report = { ranAt: new Date().toISOString(), updated: [], noScore: [], notFound: [], failed: [] };

for (const [i, r] of targets.entries()) {
  const d = r.obj;
  const query = d.q || `${baseName(d.name)} 여의도`;
  const url = `${BASE}/restaurant/list?query=${encodeURIComponent(query)}`;
  process.stdout.write(`[${i + 1}/${targets.length}] ${d.name} … `);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1200);
    let html = await page.content();
    if (/captcha|보안\s*인증|자동입력\s*방지/i.test(html)) {
      console.log('캡차 감지. --headful 로 실행해 직접 풀고 다시 시도하세요.');
      report.failed.push({ id: d.id, name: d.name, reason: 'captcha', url });
      if (!HEADFUL) break;
      await page.waitForFunction(() => !/captcha|보안 인증/i.test(document.body.innerText), null, { timeout: 180000 }).catch(() => {});
      html = await page.content();
    }
    const state = extractApollo(html);
    const list = state ? listFromApollo(state) : [];
    const c = pickCandidate(d, list);
    if (!c) {
      console.log(`후보 못 찾음 (검색 결과 ${list.length}건)`);
      report.notFound.push({ id: d.id, name: d.name, query, url, seen: list.slice(0, 5).map(x => `${x.name} | ${x.roadAddress || x.address || ''}`) });
      await sleep(DELAY_MS); continue;
    }
    let score = c.visitorReviewScore, count = c.visitorReviewCount, from = 'list';
    if (!score && c.id) { const h = await fetchHomeScore(page, c.id); score = h.score; count = h.count ?? count; from = 'home'; }
    const placeUrl = c.id ? `https://m.place.naver.com/restaurant/${c.id}/home` : url;
    if (score) {
      const val = Math.round(parseFloat(score) * 100) / 100;
      Object.assign(d, { naver: val, naverCount: count ? Number(String(count).replace(/,/g, '')) : d.naverCount ?? null,
        naverName: c.name, naverId: c.id ? String(c.id) : d.naverId, naverAt: new Date().toISOString().slice(0, 10) });
      report.updated.push({ id: d.id, name: d.name, matched: c.name, addr: c.roadAddress || c.address, naver: val, count: d.naverCount, from, placeUrl });
      console.log(`★${val} (리뷰 ${d.naverCount ?? '?'}) ← ${c.name}`);
    } else {
      Object.assign(d, { naverName: c.name, naverId: c.id ? String(c.id) : d.naverId, naverAt: new Date().toISOString().slice(0, 10) });
      report.noScore.push({ id: d.id, name: d.name, matched: c.name, addr: c.roadAddress || c.address, placeUrl });
      console.log(`별점 비공개/없음 ← ${c.name}`);
    }
  } catch (e) {
    console.log(`실패: ${e.message.split('\n')[0]}`);
    report.failed.push({ id: d.id, name: d.name, reason: e.message.split('\n')[0], url });
  }
  await sleep(DELAY_MS);
}
await browser.close();

// ---------- 결과 저장 ----------
fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
console.log(`\n갱신 ${report.updated.length} · 별점 없음 ${report.noScore.length} · 못 찾음 ${report.notFound.length} · 실패 ${report.failed.length}`);
console.log(`상세: ${path.relative(process.cwd(), REPORT)}`);

if (DRY) { console.log('dry-run 이라 data.js 는 그대로 둡니다.'); process.exit(0); }
if (!report.updated.length && !report.noScore.length) { console.log('바뀐 값이 없어 data.js 를 건드리지 않습니다.'); process.exit(0); }

fs.copyFileSync(DATA, DATA + '.bak');
for (const r of rows) lines[r.lineIdx] = '  ' + JSON.stringify(r.obj) + ',';
fs.writeFileSync(DATA, lines.join('\n'));
console.log('data.js 갱신 완료 (백업: data.js.bak). git add data.js && git commit && git push 로 반영하세요.');

/**
 * CCMM 점심 룰렛 · KMAC 평가 저장용 Apps Script 웹앱
 *
 * 설치: 구글 시트 → 확장 프로그램 → Apps Script → 이 파일 내용을 Code.gs 에 붙여넣기
 *       → 배포 → 새 배포 → 유형 "웹 앱" → 실행 계정 "나" → 액세스 "모든 사용자" → 배포
 *       → 웹 앱 URL 을 저장소의 config.js 에 넣는다.
 *
 * 시트: 첫 시트에 아래 헤더가 자동으로 만들어진다.
 *   rid | id | who | taste | clean | kind | revisit | note | date | created_at | deleted | price | dish
 *   (price = 가격 만족도 별점 0.5~5, 금액 아님 / dish = 추천 메뉴)
 *
 * 관리자 삭제: 아래 ADMIN_KEY 를 아무 문자열로 바꾸고, 페이지 주소 뒤에 ?admin=그문자열 을 붙여 한 번 열면
 *             그 브라우저에서 모든 평가를 지울 수 있다.
 */
var SHEET_NAME = 'reviews';
var HEADER = ['rid', 'id', 'who', 'taste', 'clean', 'kind', 'revisit', 'note', 'date', 'created_at', 'deleted', 'price', 'dish'];
var ADMIN_KEY = '';   // 예: 'ccmm-2026' (비워 두면 관리자 삭제 비활성)
var DAILY_LIMIT = 5;  // 닉네임당 하루 평가 건수 상한

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (sh.getName() !== SHEET_NAME && ss.getSheetByName(SHEET_NAME) == null) sh.setName(SHEET_NAME);
  var first = sh.getRange(1, 1, 1, HEADER.length).getValues()[0];
  if (first[0] !== 'rid') {
    sh.insertRowBefore(1);
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]).setFontWeight('bold');
    sh.setFrozenRows(1);
  } else {
    // 나중에 추가된 열(price 등)이 헤더에 없으면 채워 넣는다
    for (var c = 0; c < HEADER.length; c++) {
      if (first[c] !== HEADER[c]) sh.getRange(1, c + 1).setValue(HEADER[c]).setFontWeight('bold');
    }
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function listReviews_() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var rows = sh.getRange(2, 1, last - 1, HEADER.length).getValues();
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0] || r[10] === true || r[10] === 'TRUE') continue;
    out.push({
      rid: String(r[0]), id: String(r[1]), who: String(r[2]),
      taste: Number(r[3]), clean: Number(r[4]), kind: Number(r[5]),
      revisit: r[6] === true || r[6] === 'TRUE' || r[6] === 'Y',
      note: String(r[7] || ''), date: r[8] instanceof Date ? Utilities.formatDate(r[8], 'Asia/Seoul', 'yyyy-MM-dd') : String(r[8] || ''),
      price: Number(r[11]) > 0 ? Number(r[11]) : null,
      dish: String(r[12] || '')
    });
  }
  return out;
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'list';
  if (action === 'ping') return json_({ ok: true, ts: new Date().toISOString() });
  return json_({ ok: true, reviews: listReviews_() });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var sh = getSheet_();
    if (body.action === 'add') {
      var r = body.review || {};
      if (!r.rid || !r.id || !r.who) return json_({ ok: false, error: 'rid/id/who 필요' });
      // 같은 rid 가 이미 있으면 중복 저장하지 않는다 (재시도 안전)
      var last0 = sh.getLastRow();
      var rows0 = last0 > 1 ? sh.getRange(2, 1, last0 - 1, HEADER.length).getValues() : [];
      var today = String(r.date || Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd'));
      var sameDay = 0;
      for (var k = 0; k < rows0.length; k++) {
        if (String(rows0[k][0]) === String(r.rid)) return json_({ ok: true, dup: true });
        var d0 = rows0[k][8] instanceof Date ? Utilities.formatDate(rows0[k][8], 'Asia/Seoul', 'yyyy-MM-dd') : String(rows0[k][8] || '');
        if (String(rows0[k][2]) === String(r.who) && d0 === today && !(rows0[k][10] === true || rows0[k][10] === 'TRUE')) sameDay++;
      }
      if (sameDay >= DAILY_LIMIT) return json_({ ok: false, error: '하루 ' + DAILY_LIMIT + '곳까지만 평가할 수 있어요' });
      var score = function (v) { v = Number(v); return (v >= 0.5 && v <= 5) ? v : 0; };
      if (!score(r.taste) || !score(r.clean) || !score(r.kind)) return json_({ ok: false, error: '별점 값이 올바르지 않아요' });
      sh.appendRow([String(r.rid), String(r.id), String(r.who).slice(0, 20), Number(r.taste), Number(r.clean), Number(r.kind),
        r.revisit ? 'Y' : 'N', String(r.note || '').slice(0, 200), today,
        new Date(), false, score(r.price) || '', String(r.dish || '').slice(0, 30)]);
      return json_({ ok: true });
    }
    if (body.action === 'delete') {
      var rid = String(body.rid || ''), who = String(body.who || '');
      var last = sh.getLastRow();
      if (last < 2) return json_({ ok: false, error: '없음' });
      var vals = sh.getRange(2, 1, last - 1, 3).getValues();
      for (var i = 0; i < vals.length; i++) {
        if (String(vals[i][0]) === rid) {
          var isAdmin = ADMIN_KEY && String(body.adminKey || '') === ADMIN_KEY;
          if (String(vals[i][2]) !== who && !isAdmin) return json_({ ok: false, error: '본인 평가만 삭제할 수 있어요' });
          sh.getRange(i + 2, 11).setValue(true); // 실제로 지우지 않고 deleted 표시
          return json_({ ok: true });
        }
      }
      return json_({ ok: false, error: '해당 평가를 찾지 못했어요' });
    }
    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

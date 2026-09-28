/**
 * CCMM 점심 룰렛 · KMAC 평가 저장용 Apps Script 웹앱
 *
 * 설치: 구글 시트 → 확장 프로그램 → Apps Script → 이 파일 내용을 Code.gs 에 붙여넣기
 *       → 배포 → 새 배포 → 유형 "웹 앱" → 실행 계정 "나" → 액세스 "모든 사용자" → 배포
 *       → 웹 앱 URL 을 저장소의 config.js 에 넣는다.
 *
 * 시트: 첫 시트에 아래 헤더가 자동으로 만들어진다.
 *   rid | id | who | taste | clean | kind | revisit | note | date | created_at | deleted
 */
var SHEET_NAME = 'reviews';
var HEADER = ['rid', 'id', 'who', 'taste', 'clean', 'kind', 'revisit', 'note', 'date', 'created_at', 'deleted'];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (sh.getName() !== SHEET_NAME && ss.getSheetByName(SHEET_NAME) == null) sh.setName(SHEET_NAME);
  var first = sh.getRange(1, 1, 1, HEADER.length).getValues()[0];
  if (first[0] !== 'rid') {
    sh.insertRowBefore(1);
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]).setFontWeight('bold');
    sh.setFrozenRows(1);
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
      note: String(r[7] || ''), date: r[8] instanceof Date ? Utilities.formatDate(r[8], 'Asia/Seoul', 'yyyy-MM-dd') : String(r[8] || '')
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
      var ids = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(function (x) { return String(x[0]); }) : [];
      if (ids.indexOf(String(r.rid)) >= 0) return json_({ ok: true, dup: true });
      sh.appendRow([String(r.rid), String(r.id), String(r.who).slice(0, 20), Number(r.taste), Number(r.clean), Number(r.kind),
        r.revisit ? 'Y' : 'N', String(r.note || '').slice(0, 300), String(r.date || Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd')),
        new Date(), false]);
      return json_({ ok: true });
    }
    if (body.action === 'delete') {
      var rid = String(body.rid || ''), who = String(body.who || '');
      var last = sh.getLastRow();
      if (last < 2) return json_({ ok: false, error: '없음' });
      var vals = sh.getRange(2, 1, last - 1, 3).getValues();
      for (var i = 0; i < vals.length; i++) {
        if (String(vals[i][0]) === rid) {
          if (String(vals[i][2]) !== who) return json_({ ok: false, error: '본인 평가만 삭제할 수 있어요' });
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

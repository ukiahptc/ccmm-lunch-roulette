# CCMM 점심 룰렛

여의도 CCMM빌딩(여의공원로 101) 주변, **여의도공원을 건너지 않고 국회의사당역까지** 범위의
점심 후보를 룰렛으로 뽑는 정적 웹페이지. 서버 없이 `index.html` + `data.js` 두 파일로 동작한다.

## 열어 보기

- 로컬: `index.html` 을 브라우저로 더블클릭.
- GitHub Pages: 저장소 Settings → Pages → Branch 를 main 으로 지정하면
  `https://ukiahptc.github.io/ccmm-lunch-roulette/` 에서 열린다.

## 기능

- 룰렛: 필터를 통과한 후보만 원판에 올라간다. 당첨 결과에서 네이버지도·카카오맵 검색 링크로 바로 이동.
- 필터: 분류(한식·일식·중식·양식·아시안·분식/기타), 구역, 네이버 별점 기준(기본 4.5), 최근 5회 당첨 제외.
- "오늘은 빼고 다시": 그 가게를 후보에서 뺀 채 즉시 재추첨.
- 후보 표: 별점 칸을 직접 고치면 브라우저(localStorage)에 저장되고 룰렛에 바로 반영된다.
  "JSON 내보내기"로 팀원과 공유하거나 `data.js` 에 반영할 수 있다.

## 데이터 (`data.js`)

```js
{ id:'jungin', name:'정인면옥', cat:'한식', menu:'평양냉면', price:'1.5만~',
  addr:'국회대로76길 10', bldg:'', zone:'alley', naver:null, src:'', q:'정인면옥 여의도' }
```

- `naver`: 네이버지도 별점. **확인된 값만** 숫자로, 모르면 `null`. 수집 스크립트가 `naverCount`(리뷰 수)·`naverName`(매칭된 상호)·`naverId`·`naverAt`(수집일)을 함께 채운다.
- `zone`: `META.zones` 의 id. `inScope:false` 인 구역(국회의사당역 건너편 KBS·국회 앞)은 기본 제외.
- `q`: 지도 검색어. 비우면 `상호 + 여의도` 로 검색.
- `closed:true` 를 주면 목록에 남기되 룰렛에서 뺀다.

## 네이버 별점 자동 수집 (`scripts/fetch-naver-ratings.mjs`)

Node.js 18 이상이 설치된 PC에서 실행한다 (네이버 접속이 되는 환경이어야 함).

```bash
npm run setup          # 최초 1회: playwright 설치 + chromium 다운로드(약 150MB)
npm run ratings:dry    # 먼저 결과만 확인 (data.js 안 건드림)
npm run ratings        # data.js 의 naver 값 갱신, 원본은 data.js.bak 으로 백업
git add data.js && git commit -m "네이버 별점 갱신" && git push   # 페이지에 반영
```

옵션:

| 옵션 | 뜻 |
|---|---|
| `--only jungin,masam` | 지정한 id 만 수집 |
| `--force` | 이미 별점이 있는 가게도 다시 수집 (기본은 `naver:null` 인 곳만) |
| `--headful` | 브라우저 창을 띄워서 실행. 캡차가 뜨면 이 모드로 직접 풀고 진행 |
| `--delay 3000` | 가게 사이 대기(ms). 기본 2000 |

동작: 가게마다 `m.place.naver.com` 검색 → 여의도 소재 + 상호·도로명이 맞는 후보를 고름 → 별점(`visitorReviewScore`)·리뷰 수를 읽어 `naver`, `naverCount`, `naverName`, `naverId`, `naverAt` 에 기록.
결과 요약은 `ratings-report.json` 에 남는다 (`notFound` 는 검색어를 `q` 필드에 직접 넣어 주면 해결되는 경우가 많다).
네이버가 화면 구조를 바꾸면 파싱이 깨질 수 있는데, 그때는 `--headful` 로 열어 보고 스크립트의 선택자를 손보면 된다.

## 별점 데이터에 대한 주의

네이버지도는 2021년 별점을 없앴다가 2026년 7월부터 다시 공개하기 시작했고,
**업주가 노출 여부를 선택**할 수 있어 별점이 아예 안 보이는 가게가 있다.
이 목록을 만든 환경에서는 네이버·카카오 접속이 막혀 있어 별점을 직접 대조하지 못했다.
`data.js` 의 `naver` 값이 `null` 인 가게는 네이버지도에서 확인한 뒤 표에서 입력하거나 `data.js` 를 고치면 된다.

// CCMM 점심 룰렛 후보 데이터 (index.html 이 읽음)
// naver : 네이버지도 별점(5점 만점). 확인된 값만 숫자로, 미확인은 null.
// zone  : META.zones 의 id. inScope:false 인 구역은 기본으로 룰렛에서 빠진다.
// closed: true 로 두면 목록에는 남고 룰렛에서만 빠진다.
window.META = {
  "zones": [
    {
      "id": "ccmm",
      "label": "CCMM빌딩 안"
    },
    {
      "id": "bank",
      "label": "은행로 (중기중앙회·정우/안원빌딩)"
    },
    {
      "id": "alley",
      "label": "국회대로 62~76길 골목 (순복음교회 뒤)"
    },
    {
      "id": "main",
      "label": "국회대로 본선 (LG에클라트·금산빌딩·파라곤)"
    },
    {
      "id": "station",
      "label": "국회의사당역 3~6번 출구 (익스콘·더샵아일랜드파크)"
    },
    {
      "id": "krx",
      "label": "한국거래소 주변"
    },
    {
      "id": "west",
      "label": "국회 경내",
      "inScope": false
    }
  ],
  "note": "<b>별점 안내</b> 네이버지도는 2021년 별점을 없앴다가 2026년 7월 9일부터 다시 공개 중이며, 업주가 노출 여부를 고를 수 있어 별점이 없는 가게도 있습니다. 이 목록은 네이버·카카오 접속이 차단된 환경에서 만들어져 <b>네이버 별점을 한 곳도 직접 대조하지 못했습니다.</b> 그래서 지금은 \"별점 미확인도 포함\"이 켜진 상태로 전체 후보를 돌리고, 표에서 별점을 채워 넣으면 그때부터 4.5 기준이 적용됩니다. 비고 칸의 다이닝코드 점수는 참고용입니다.",
  "footer": "범위: 여의도공원 서측(여의공원로 기준) ~ 국회의사당역 출구 앞. 국회 경내는 \"범위 밖\"으로 기본 제외. 동여의도(IFC·더현대·여의도역·오투타워·샛강역 쪽)는 후보에서 뺐습니다. 주소·가격은 2023~2026년 공개 자료 기준이라 현재와 다를 수 있습니다. 데이터 수정은 같은 폴더의 data.js 를 고치면 됩니다."
};

window.RESTAURANTS = [
  // ── CCMM빌딩 안
  {"id": "hemil", "name": "헤밀파스타", "cat": "양식", "menu": "파스타·리조또 (샐러드·식전빵 제공)", "price": "", "addr": "여의공원로 101 B106호", "bldg": "CCMM빌딩 지하 아케이드", "zone": "ccmm", "naver": null, "src": "토 휴무", "q": ""},
  {"id": "kisoya", "name": "기소야 서여의도점", "cat": "일식", "menu": "냄비돈까스정식·김치우동", "price": "1.2만~1.6만", "addr": "여의공원로 101 지하1층", "bldg": "CCMM빌딩 지하 아케이드", "zone": "ccmm", "naver": null, "src": "토 휴무", "q": ""},
  {"id": "gaya", "name": "가야분식", "cat": "분식·기타", "menu": "분식", "price": "", "addr": "여의공원로 101 지하1층", "bldg": "CCMM빌딩 지하 아케이드", "zone": "ccmm", "naver": null, "src": "", "q": ""},
  {"id": "ttukbaegi", "name": "여의도뚝배기", "cat": "한식", "menu": "뚝배기 정식", "price": "", "addr": "여의공원로 101 지하1층", "bldg": "CCMM빌딩 지하 아케이드", "zone": "ccmm", "naver": null, "src": "", "q": ""},
  // ── 은행로 (중기중앙회·정우/안원빌딩)
  {"id": "bonavetti", "name": "보나베띠 여의도점", "cat": "양식", "menu": "화덕피자·파스타", "price": "", "addr": "은행로 30 1층", "bldg": "중소기업중앙회 신관", "zone": "bank", "naver": null, "src": "", "q": ""},
  {"id": "sanjeong", "name": "산정", "cat": "한식", "menu": "한식 정식", "price": "", "addr": "은행로 29 지하1층 56호", "bldg": "정우빌딩", "zone": "bank", "naver": null, "src": "주말 휴무", "q": ""},
  {"id": "jungwoo", "name": "정우칼국수보쌈", "cat": "한식", "menu": "칼국수·보쌈", "price": "", "addr": "은행로 29 지하1층", "bldg": "정우빌딩", "zone": "bank", "naver": null, "src": "", "q": ""},
  {"id": "haru", "name": "하루순대국밥", "cat": "한식", "menu": "순대국밥·밀면", "price": "", "addr": "은행로 29 지하1층 50호", "bldg": "정우빌딩", "zone": "bank", "naver": null, "src": "일 휴무", "q": ""},
  {"id": "dwipuri", "name": "뒤푸리", "cat": "한식", "menu": "반건조 대구 해장국", "price": "", "addr": "은행로 29", "bldg": "정우빌딩", "zone": "bank", "naver": null, "src": "", "q": ""},
  // ── 국회대로 62~76길 골목 (순복음교회 뒤)
  {"id": "jungin", "name": "정인면옥", "cat": "한식", "menu": "평양냉면·만두", "price": "1.5만~1.7만", "addr": "국회대로76길 10 1층", "bldg": "기독교침례회총회빌딩", "zone": "alley", "naver": null, "src": "미쉐린 빕구르망 · 다이닝코드 ★4.0", "q": ""},
  {"id": "hohwa", "name": "호화대반점", "cat": "중식", "menu": "노포 짜장·탕수육", "price": "1만원 안팎", "addr": "국회대로76길 18 지하1층", "bldg": "", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "shanghao", "name": "샹하오", "cat": "중식", "menu": "호텔 중식 런치세트", "price": "1만~2만 (런치)", "addr": "국회대로76길 16 2층", "bldg": "켄싱턴호텔 여의도", "zone": "alley", "naver": null, "src": "일 휴무", "q": ""},
  {"id": "seolyeon", "name": "설연향", "cat": "중식", "menu": "차돌짬뽕·유니짜장", "price": "", "addr": "국회대로76길 33 지하1층", "bldg": "중앙보훈회관", "zone": "alley", "naver": null, "src": "다이닝코드 58점", "q": ""},
  {"id": "ri153", "name": "리153", "cat": "중식", "menu": "중식뷔페 (평일 11~14시, 100인 한정)", "price": "1만", "addr": "국회대로76가길 11 지하1층 5호", "bldg": "초원상가", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "eommason", "name": "엄마손분식", "cat": "분식·기타", "menu": "백반", "price": "", "addr": "국회대로76가길 11", "bldg": "초원상가", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "masam", "name": "마삼계탕", "cat": "한식", "menu": "부추오리주물럭·마삼계탕", "price": "1.5만", "addr": "국회대로74길 9 지하1층 107호", "bldg": "삼보빌딩", "zone": "alley", "naver": null, "src": "다이닝코드 74~77점", "q": ""},
  {"id": "carnival", "name": "카니발피자 서여의도점", "cat": "양식", "menu": "피자·파스타", "price": "", "addr": "국회대로74길 9 206호", "bldg": "삼보빌딩", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "eommakal", "name": "엄마손칼국수", "cat": "한식", "menu": "칼국수·콩국수", "price": "", "addr": "국회대로74길 12", "bldg": "", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "kwak", "name": "곽수산", "cat": "한식", "menu": "회덮밥·물회·생대구탕", "price": "1.2만~1.8만", "addr": "국회대로74길 19 지하1층", "bldg": "동우국제빌딩", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "dongwoo", "name": "동우북어국(동우황태)", "cat": "한식", "menu": "황태해장국 (06:00~15:00)", "price": "", "addr": "국회대로74길 19", "bldg": "동우국제빌딩", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "yangmani", "name": "양마니 여의도점", "cat": "한식", "menu": "양곰탕·양밥", "price": "1.4만", "addr": "국회대로74길 20 2층", "bldg": "맨하탄21상가", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "gyerim", "name": "종로계림닭도리탕원조 국회의사당점", "cat": "한식", "menu": "마늘닭도리탕", "price": "", "addr": "국회대로74길 20 2층", "bldg": "맨하탄21상가", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "oebaek", "name": "외백 여의도점", "cat": "중식", "menu": "룸 중식 (고급)", "price": "", "addr": "국회대로72길 17 301~311호", "bldg": "KCC파크타운", "zone": "alley", "naver": null, "src": "가격 미확인(고급 가능성, 확인 필요)", "q": ""},
  {"id": "suage", "name": "스아게 여의도점", "cat": "일식", "menu": "삿포로식 스프카레", "price": "", "addr": "국회대로72길 17 203호", "bldg": "KCC파크타운", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "eomnamu", "name": "엄나무집", "cat": "한식", "menu": "닭갈비·볶음밥", "price": "", "addr": "국회대로72길 17 208-1호", "bldg": "KCC파크타운", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "jinjin", "name": "진진만두 국회점", "cat": "한식", "menu": "만두국·어복쟁반", "price": "", "addr": "국회대로72길 11", "bldg": "프린스텔", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "yangji", "name": "여의도양지탕 본관", "cat": "한식", "menu": "양지탕 (44년 노포, 육수·밥 무한)", "price": "특탕 1.4만", "addr": "국회대로70길 7", "bldg": "", "zone": "alley", "naver": null, "src": "다이닝코드 71점", "q": ""},
  {"id": "dokto", "name": "독토", "cat": "한식", "menu": "김치·된장·곱창전골·제육쌈밥", "price": "", "addr": "국회대로70길 7 지하", "bldg": "동아빌딩", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "kimmyeongja", "name": "김명자굴국밥", "cat": "한식", "menu": "굴국밥·굴떡국 (06:00~)", "price": "1만~1.4만", "addr": "국회대로70길 15-1 지하1층", "bldg": "극동VIP빌딩", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "mugong", "name": "무공돈까스 서여의도점", "cat": "일식", "menu": "돈까스·코돈부르", "price": "1.2만~", "addr": "국회대로70길 18 지하1층 1·2호", "bldg": "한양빌딩", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "kadonmari", "name": "카돈마리 여의도점", "cat": "일식", "menu": "돈까스+쌀국수", "price": "", "addr": "국회대로70길 18 303호", "bldg": "한양빌딩", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "boseung", "name": "보승회관 여의도국회의사당점", "cat": "한식", "menu": "순대국", "price": "", "addr": "국회대로70길 18 지하 (추정)", "bldg": "한양빌딩", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "daeboreum", "name": "대보름", "cat": "한식", "menu": "남도음식 정식 (이모카세)", "price": "1.5만", "addr": "국회대로70길 22 지하1층", "bldg": "금강빌딩", "zone": "alley", "naver": null, "src": "다이닝코드 맛5.0", "q": ""},
  {"id": "siena", "name": "시에나프리모", "cat": "양식", "menu": "파스타·피자·리소토", "price": "", "addr": "국회대로70길 19 B106호", "bldg": "대하빌딩", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "sogong", "name": "소공동뚝배기집 여의도점", "cat": "한식", "menu": "제육볶음·뚝배기 (07:00~)", "price": "", "addr": "국회대로68길 23 1층", "bldg": "정원빌딩", "zone": "alley", "naver": null, "src": "다이닝코드 맛4.5", "q": ""},
  {"id": "homerest", "name": "홈레스토랑", "cat": "양식", "menu": "퓨전 양식", "price": "", "addr": "국회대로68길 23", "bldg": "정원빌딩", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "ido", "name": "이도식당", "cat": "한식", "menu": "해물샤브·해물칼국수·국수전골", "price": "1.8만/인", "addr": "국회대로68길 11", "bldg": "", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "seyang", "name": "세양원", "cat": "중식", "menu": "점심특선·마파두부", "price": "점심특선 저가", "addr": "국회대로68길 18", "bldg": "금영빌딩", "zone": "alley", "naver": null, "src": "", "q": ""},
  {"id": "jeongdong", "name": "정동각", "cat": "중식", "menu": "짜장·짬뽕·볶음밥 (지하, 반주 가능)", "price": "5천~7천 (구정보)", "addr": "국회대로62길 14 지하1층", "bldg": "한국스카우트연맹빌딩", "zone": "alley", "naver": null, "src": "다이닝코드 31점", "q": ""},
  {"id": "bongtaemin", "name": "봉태민", "cat": "한식", "menu": "요일 백반 (닭볶음 메인)", "price": "9천", "addr": "국회대로62길 14 지하1층", "bldg": "한국스카우트연맹빌딩", "zone": "alley", "naver": null, "src": "다이닝코드 47점", "q": ""},
  {"id": "somong", "name": "소몽", "cat": "일식", "menu": "소바·고등어덮밥·성게알덮밥", "price": "1.5만~1.8만", "addr": "여의나루로 113 2층 212·213호", "bldg": "공작상가 (순복음교회 앞)", "zone": "alley", "naver": null, "src": "", "q": ""},
  // ── 국회대로 본선 (LG에클라트·금산빌딩·파라곤)
  {"id": "basburger", "name": "바스버거 국회의사당점", "cat": "양식", "menu": "수제버거·감자칩", "price": "", "addr": "국회대로 780 지하1층", "bldg": "LG여의도에클라트", "zone": "main", "naver": null, "src": "다이닝코드 ★4.5 · 1번 출구 2분", "q": ""},
  {"id": "sunnam", "name": "순남시래기 서여의도점", "cat": "한식", "menu": "시래기국·수육정식", "price": "8천~1.3만", "addr": "국회대로 780 지하1층", "bldg": "LG여의도에클라트", "zone": "main", "naver": null, "src": "", "q": ""},
  {"id": "kimsambo", "name": "김삼보 여의도점", "cat": "한식", "menu": "1인 김치찌개·솥밥 (24시)", "price": "", "addr": "국회대로 780 1층", "bldg": "LG여의도에클라트", "zone": "main", "naver": null, "src": "1번 출구 156m", "q": ""},
  {"id": "wanttuk", "name": "완뚝순두부 여의도점", "cat": "한식", "menu": "순두부·돌솥밥 (24시)", "price": "", "addr": "국회대로 800 1층", "bldg": "여의도파라곤", "zone": "main", "naver": null, "src": "", "q": ""},
  {"id": "dongnam", "name": "동남집 여의도점", "cat": "한식", "menu": "양지곰탕", "price": "", "addr": "국회대로 750 1층", "bldg": "금산빌딩", "zone": "main", "naver": null, "src": "", "q": ""},
  {"id": "samdo", "name": "삼도일식", "cat": "일식", "menu": "일식 정식·대구탕 (룸)", "price": "", "addr": "국회대로 750 지하1층", "bldg": "금산빌딩 (국회 정문 맞은편)", "zone": "main", "naver": null, "src": "가격 미확인(고급 가능성, 확인 필요)", "q": ""},
  {"id": "jeonjujip", "name": "전주집", "cat": "한식", "menu": "김치찌개·김치전골·계란말이", "price": "", "addr": "국회대로 750 1층 (동명 타점포 가능성, 확인 필요)", "bldg": "금산빌딩", "zone": "main", "naver": null, "src": "", "q": ""},
  // ── 국회의사당역 3~6번 출구 (익스콘·더샵아일랜드파크)
  {"id": "bulls", "name": "불스버거", "cat": "양식", "menu": "수제버거 (B.T.D·클래식치즈)", "price": "1만~1.2만", "addr": "은행로 3 지하1층 B113호", "bldg": "익스콘벤처타워", "zone": "station", "naver": null, "src": "3번 출구 앞", "q": ""},
  {"id": "gwibin", "name": "귀빈밥상", "cat": "한식", "menu": "9첩 백반", "price": "", "addr": "은행로 3 지하 식당가", "bldg": "익스콘벤처타워", "zone": "station", "naver": null, "src": "", "q": ""},
  {"id": "beyond", "name": "비욘드비엣남 국회의사당점", "cat": "아시안", "menu": "쌀국수", "price": "", "addr": "의사당대로 26 107호", "bldg": "", "zone": "station", "naver": null, "src": "4번 출구 2분 · 다이닝코드 맛4.8", "q": ""},
  {"id": "jeonjubonga", "name": "전주본가 콩나물국밥", "cat": "한식", "menu": "전주콩나물국밥 (08:00~)", "price": "9천", "addr": "의사당대로 26 지하1층", "bldg": "스타벅스 빌딩 지하", "zone": "station", "naver": null, "src": "다이닝코드 ★4.0", "q": ""},
  {"id": "mucheong", "name": "무청감자탕 국회의사당점", "cat": "한식", "menu": "감자탕·뼈해장국", "price": "", "addr": "의사당대로 26 지하1층 B113호", "bldg": "", "zone": "station", "naver": null, "src": "4번 출구 97m", "q": ""},
  {"id": "lishan", "name": "리샨 여의도점", "cat": "중식", "menu": "차돌짬뽕·삼선짬뽕·런치코스", "price": "1.2만~3.2만", "addr": "의사당대로 38", "bldg": "더샵아일랜드파크", "zone": "station", "naver": null, "src": "다이닝코드 73점", "q": ""},
  {"id": "iru", "name": "이루 KBS서여의도점", "cat": "중식", "menu": "화교 3대 중식 (짜장·간짜장·새우교자)", "price": "8천~1.1만", "addr": "의사당대로 38 102동 124호", "bldg": "더샵아일랜드파크", "zone": "station", "naver": null, "src": "다이닝코드 53점", "q": ""},
  {"id": "haedamon", "name": "해담온", "cat": "일식", "menu": "제주흑돼지 돈가스·연어덮밥", "price": "1.4만~1.7만", "addr": "의사당대로 38 103동 1층 104호", "bldg": "더샵아일랜드파크", "zone": "station", "naver": null, "src": "다이닝코드 68~70점", "q": ""},
  {"id": "hancheop", "name": "한첩 순대국밥 서여의도 KBS본점", "cat": "한식", "menu": "보양순대국밥·만두", "price": "1.1만", "addr": "의사당대로 38 101동 1층 103호", "bldg": "더샵아일랜드파크", "zone": "station", "naver": null, "src": "4번 출구 앞", "q": ""},
  {"id": "gosutaco", "name": "고수타코 여의도KBS점", "cat": "아시안", "menu": "타코·부리또", "price": "", "addr": "의사당대로 38 102동 107호", "bldg": "더샵아일랜드파크", "zone": "station", "naver": null, "src": "다이닝코드 ★4.3", "q": ""},
  {"id": "haebim", "name": "해빔 여의도점", "cat": "한식", "menu": "꽃게살비빔밥·꽃게탕", "price": "", "addr": "의사당대로 38 101동 111호", "bldg": "더샵아일랜드파크", "zone": "station", "naver": null, "src": "", "q": ""},
  {"id": "gradimon", "name": "그라디몬버거", "cat": "양식", "menu": "수제버거", "price": "", "addr": "의사당대로 38 109호", "bldg": "더샵아일랜드파크", "zone": "station", "naver": null, "src": "", "q": ""},
  {"id": "halong", "name": "하롱베이의하루", "cat": "아시안", "menu": "베트남 쌀국수", "price": "", "addr": "의사당대로 38", "bldg": "더샵아일랜드파크", "zone": "station", "naver": null, "src": "", "q": ""},
  {"id": "sobaudon", "name": "여의도소바우동", "cat": "일식", "menu": "소바·우동", "price": "", "addr": "의사당대로 38 1층", "bldg": "더샵아일랜드파크 (KBS본관 앞)", "zone": "station", "naver": null, "src": "", "q": ""},
  {"id": "sawi", "name": "사위식당 여의도점", "cat": "한식", "menu": "낙곱새·손만두", "price": "", "addr": "주소 미확인 (건물 2층)", "bldg": "", "zone": "station", "naver": null, "src": "다이닝코드 ★4.7", "q": ""},
  {"id": "yugane", "name": "유가네손맛", "cat": "한식", "menu": "회덮밥·바지락칼국수·제육 (포장마차식)", "price": "", "addr": "KBS본관 맞은편 지하1층 (주소 미확인)", "bldg": "", "zone": "station", "naver": null, "src": "", "q": ""},
  {"id": "jeongdam", "name": "정담긴 추어탕", "cat": "한식", "menu": "추어탕", "price": "", "addr": "KBS 인근 (주소 미확인)", "bldg": "", "zone": "station", "naver": null, "src": "", "q": ""},
];

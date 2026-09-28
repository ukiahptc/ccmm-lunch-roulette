// CCMM 디저트 룰렛 후보 데이터 (cafe/index.html 이 읽음)
// id 는 반드시 "cafe-" 로 시작 (점심 룰렛과 같은 구글 시트를 쓰므로 겹치지 않게)
// cat : 커피 · 디저트 · 베이커리 · 빙수·아이스크림 · 차·음료
window.META = {
  "zones": [
    {"id": "ccmm", "label": "CCMM빌딩 안·앞"},
    {"id": "bank", "label": "은행로 (중기중앙회·KDB·정우/안원빌딩)"},
    {"id": "alley", "label": "국회대로 62~76길 골목 (순복음교회 뒤)"},
    {"id": "main", "label": "국회대로 본선 (LG에클라트·금산빌딩·파라곤)"},
    {"id": "station", "label": "국회의사당역 출구 앞 (익스콘·더샵아일랜드파크)"},
    {"id": "krx", "label": "한국거래소 주변"},
    {"id": "west", "label": "국회 경내·KBS", "inScope": false}
  ],
  "footer": "범위: 여의도공원 서측(여의공원로 기준) ~ 국회의사당역 출구 앞. 국회 경내·KBS는 기본 제외. 주소는 2024~2026년 공개 자료 기준이라 폐점·교체가 있을 수 있습니다(비고에 표시). 목록 수정은 cafe/data.js."
};

window.RESTAURANTS = [
  // ── CCMM빌딩 안·앞
  {"id": "cafe-sbux-park", "name": "스타벅스 여의도공원R점", "cat": "커피", "menu": "리저브 원두 커피", "price": "", "addr": "여의공원로 101 1층", "bldg": "CCMM빌딩", "zone": "ccmm", "src": "월~목 06:30~22:00", "q": ""},
  // ── 은행로 (중기중앙회·KDB·정우/안원빌딩)
  {"id": "cafe-artisee", "name": "아티제 여의도공원점", "cat": "베이커리", "menu": "인절미 팥빙수·생크림 케이크·크로아상", "price": "", "addr": "은행로 30 신관 1층", "bldg": "중소기업중앙회", "zone": "bank", "src": "07:00~21:30", "q": ""},
  {"id": "cafe-coffeegiup", "name": "커피기업 여의도직영점", "cat": "커피", "menu": "아인슈페너·스노우비엔나", "price": "", "addr": "은행로 29 1층 13호", "bldg": "정우빌딩", "zone": "bank", "src": "텐퍼센트커피와 같은 주소로 검색됨 · 영업 확인 필요", "q": ""},
  {"id": "cafe-tenpercent", "name": "텐퍼센트커피 서여의도점", "cat": "커피", "menu": "스페셜티 아메리카노", "price": "", "addr": "은행로 29", "bldg": "정우빌딩", "zone": "bank", "src": "커피기업과 같은 주소로 검색됨 · 영업 확인 필요", "q": ""},
  {"id": "cafe-sweetcharging", "name": "스윗차징", "cat": "베이커리", "menu": "빵", "price": "", "addr": "은행로 29 1층 21호", "bldg": "정우빌딩", "zone": "bank", "src": "매일 07:00~20:00 · 다이닝코드 ★5.0", "q": ""},
  {"id": "cafe-dutchnbean", "name": "더치앤빈 여의도공원점", "cat": "커피", "menu": "흑당카페라떼·더치커피", "price": "", "addr": "은행로 54 1층 105호", "bldg": "", "zone": "bank", "src": "평일 07:00~17:00 · 토 휴무", "q": ""},
  // ── 국회대로 62~76길 골목 (순복음교회 뒤)
  {"id": "cafe-sbux-uisadang", "name": "스타벅스 여의도의사당점", "cat": "커피", "menu": "아메리카노·라떼", "price": "", "addr": "국회대로74길 12", "bldg": "남중빌딩 (켄싱턴호텔 옆)", "zone": "alley", "src": "커피빈과 같은 주소로 검색됨 · 영업 확인 필요", "q": ""},
  {"id": "cafe-pariscroissant", "name": "파리크라상 여의도2호점", "cat": "베이커리", "menu": "딸기 레어치즈 타르트·케이크", "price": "", "addr": "국회대로74길 12 1층", "bldg": "남중빌딩", "zone": "alley", "src": "", "q": ""},
  {"id": "cafe-nicecaffeine", "name": "나이스카페인클럽 서여의도점", "cat": "디저트", "menu": "쿠키·브라우니·커피", "price": "", "addr": "국회대로74길 20 1층 103-2호", "bldg": "맨하탄21상가", "zone": "alley", "src": "평일 07:30~17:00 · 토 휴무", "q": ""},
  {"id": "cafe-essence", "name": "에센스커피 서여의도점", "cat": "디저트", "menu": "파운드케이크 6종·커피", "price": "쿼터 2.5천 / 홀 1만", "addr": "국회대로74길 20 1층 109호", "bldg": "맨하탄21상가", "zone": "alley", "src": "평일 07:00~17:00 · 주말 휴무", "q": ""},
  {"id": "cafe-mammoth", "name": "매머드익스프레스 서여의도점", "cat": "커피", "menu": "대용량 아메리카노", "price": "", "addr": "국회대로76길 18 1층 4호", "bldg": "순복음교회 맞은편", "zone": "alley", "src": "평일 07:00~18:00 · 토 휴무", "q": ""},
  {"id": "cafe-timhortons", "name": "팀홀튼 여의도 켄싱턴점", "cat": "디저트", "menu": "도넛·팀빗·커피", "price": "", "addr": "국회대로76길 16", "bldg": "켄싱턴호텔 여의도", "zone": "alley", "src": "", "q": ""},
  {"id": "cafe-chillcoffee", "name": "칠커피바 국회의사당역점", "cat": "커피", "menu": "스페셜티 커피·두쫀쿠", "price": "", "addr": "국회대로66길 11-4", "bldg": "", "zone": "alley", "src": "", "q": ""},
  {"id": "cafe-twosome-seo", "name": "투썸플레이스 서여의도점", "cat": "디저트", "menu": "케이크·커피", "price": "", "addr": "국회대로70길 15-1 1층", "bldg": "", "zone": "alley", "src": "", "q": ""},
  {"id": "cafe-pascucci", "name": "파스쿠찌 서여의도점", "cat": "디저트", "menu": "티라미수·커피", "price": "", "addr": "주소 미확인", "bldg": "", "zone": "alley", "src": "다이닝코드 등재만 확인", "q": ""},
  {"id": "cafe-kongjaru", "name": "콩자루", "cat": "커피", "menu": "커피", "price": "", "addr": "여의나루로 113 112호", "bldg": "공작상가 (순복음교회 앞)", "zone": "alley", "src": "", "q": ""},
  {"id": "cafe-gourmetbread", "name": "고메브레드", "cat": "베이커리", "menu": "빵", "price": "", "addr": "여의나루로 113 (호수 미확인)", "bldg": "공작상가", "zone": "alley", "src": "", "q": ""},
  // ── 국회대로 본선 (LG에클라트·금산빌딩·파라곤)
  {"id": "cafe-sbux-gukhoe", "name": "스타벅스 국회대로점", "cat": "커피", "menu": "아메리카노·프라푸치노", "price": "", "addr": "국회대로 786", "bldg": "", "zone": "main", "src": "1번 출구 도보 4분 · 06:30~20:00", "q": ""},
  {"id": "cafe-namdaemun", "name": "남대문커피 여의도점", "cat": "커피", "menu": "아메리카노", "price": "", "addr": "국회대로 780 1층", "bldg": "LG여의도에클라트", "zone": "main", "src": "평일 07:00~20:00", "q": ""},
  // ── 국회의사당역 출구 앞 (익스콘·더샵아일랜드파크)
  {"id": "cafe-twosome-station", "name": "투썸플레이스 국회의사당역점", "cat": "디저트", "menu": "케이크·커피", "price": "", "addr": "의사당대로 21 1층", "bldg": "한국평가데이터", "zone": "station", "src": "", "q": ""},
  {"id": "cafe-ediya", "name": "이디야커피 국회의사당역점", "cat": "커피", "menu": "아메리카노·토피넛라떼", "price": "3.2천~4.5천", "addr": "의사당대로 22 1층", "bldg": "이룸센터 (4번 출구 앞)", "zone": "station", "src": "07:30~20:30", "q": ""},
  {"id": "cafe-rollpi", "name": "롤피", "cat": "차·음료", "menu": "수제청 음료·커피", "price": "", "addr": "의사당대로 22", "bldg": "이룸센터", "zone": "station", "src": "", "q": ""},
  {"id": "cafe-sbux-kbs", "name": "스타벅스 여의도KBS점", "cat": "커피", "menu": "아메리카노·라떼", "price": "", "addr": "의사당대로 26", "bldg": "", "zone": "station", "src": "", "q": ""},
  {"id": "cafe-pb-kbs", "name": "파리바게뜨 KBS여의도점", "cat": "베이커리", "menu": "케이크·빵", "price": "", "addr": "의사당대로 26", "bldg": "", "zone": "station", "src": "07:00~23:00", "q": ""},
  {"id": "cafe-mega", "name": "메가MGC커피 여의도KBS점", "cat": "커피", "menu": "저가 커피·에이드", "price": "", "addr": "의사당대로 38 102동 1층 116호", "bldg": "더샵아일랜드파크", "zone": "station", "src": "", "q": ""},
  {"id": "cafe-compose", "name": "컴포즈커피 여의도KBS점", "cat": "커피", "menu": "저가 커피", "price": "", "addr": "의사당대로 38 102동 108호", "bldg": "더샵아일랜드파크", "zone": "station", "src": "", "q": ""},
  {"id": "cafe-michele", "name": "미켈레커피 여의도점", "cat": "커피", "menu": "에스프레소·라떼", "price": "", "addr": "의사당대로 38 101동 107~108호", "bldg": "더샵아일랜드파크", "zone": "station", "src": "다이닝코드 ★3.8", "q": ""},
  {"id": "cafe-gotonly", "name": "곳온니플레이스 PARK SIDE", "cat": "디저트", "menu": "아인슈페너·디저트", "price": "", "addr": "의사당대로 38 103동 107호", "bldg": "더샵아일랜드파크", "zone": "station", "src": "평일 08:00~22:30", "q": ""},
  // ── 한국거래소 주변
  {"id": "cafe-dailybrown", "name": "데일리브라운 한국거래소점", "cat": "커피", "menu": "로스터리 커피", "price": "", "addr": "여의나루로 76 신관 9층", "bldg": "한국거래소", "zone": "krx", "src": "사내카페 · 외부인 출입 미확인 · 주중 07:30~19:00", "q": ""},
  {"id": "cafe-coffeequest", "name": "커피퀘스트", "cat": "차·음료", "menu": "커피·히비스커스 티", "price": "", "addr": "여의나루로 76", "bldg": "한국거래소", "zone": "krx", "src": "", "q": ""},
  // ── 국회 경내·KBS
  {"id": "cafe-gangbyeon", "name": "강변서재", "cat": "디저트", "menu": "북카페 · 음료·베이커리 (한강뷰)", "price": "", "addr": "의사당대로 1 사랑재 옆 2층", "bldg": "국회 경내", "zone": "west", "src": "일반인 이용 가능 · 다이닝코드 ★4.4 · 평일 08:30~19:00", "q": ""},
  {"id": "cafe-bohemian", "name": "보헤미안박이추커피 KBS점", "cat": "커피", "menu": "핸드드립 커피", "price": "", "addr": "여의공원로 13 신관 2층 로비", "bldg": "KBS 신관", "zone": "west", "src": "매일 08:00~20:00", "q": ""},
];

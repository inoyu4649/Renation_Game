import csv
import json
import math
import os
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

# Haversine formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

# Country metadata mapping: Korean names, continent, tier, stats, positive/negative reviews
COUNTRY_METADATA = {
    "Afghanistan": {"ko": "아프가니스탄", "tier": "지옥", "tier_code": "F", "continent": "아시아", "homicide": 6.7, "gini": 37.8, "gdp_capita": 516,
        "pro": "천년 역사의 힌두쿠시 산맥과 굳건한 전통 공동체의 유대가 살아있습니다.",
        "con": "극심한 정세 불안과 탈레반 치하의 인권·교육 제약 속에서 생존 자체가 도전입니다."},
    "Albania": {"ko": "알바니아", "tier": "보통", "tier_code": "C", "continent": "유럽", "homicide": 2.3, "gini": 30.8, "gdp_capita": 8200,
        "pro": "지중해의 숨은 보석 같은 에메랄드빛 해변과 저렴한 물가가 매력적입니다.",
        "con": "유럽 내에서 상대적으로 낙후된 인프라와 청년층의 높은 해외 유출률이 아쉽습니다."},
    "Algeria": {"ko": "알제리", "tier": "하드", "tier_code": "D", "continent": "아프리카", "homicide": 1.3, "gini": 27.6, "gdp_capita": 4900,
        "pro": "사하라 사막의 장엄한 풍경과 풍부한 천연자원을 바탕으로 한 무상 복지가 있습니다.",
        "con": "석유 의존형 경제 구조와 보수적인 사회 규범, 높은 청년 실업률이 존재합니다."},
    "Andorra": {"ko": "안도라", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 0.0, "gini": 27.2, "gdp_capita": 46500,
        "pro": "피레네 산맥의 환상적인 스키 리조트와 세금 없는 고소득 낙원입니다.",
        "con": "공항과 기차가 없어 이동이 불편하고 물가가 매우 비쌉니다."},
    "Angola": {"ko": "앙골라", "tier": "지옥", "tier_code": "F", "continent": "아프리카", "homicide": 4.8, "gini": 51.3, "gdp_capita": 2400,
        "pro": "아프리카 2위의 산유국으로 무한한 경제적 잠재력과 활기찬 음악 문화가 있습니다.",
        "con": "극심한 빈부격차와 수도 루안다의 살인적인 물가, 열악한 보건 인프라가 발목을 잡습니다."},
    "Argentina": {"ko": "아르헨티나", "tier": "보통", "tier_code": "C", "continent": "남아메리카", "homicide": 4.3, "gini": 42.0, "gdp_capita": 13700,
        "pro": "세계 최고의 축구 열정, 환상적인 소고기와 와인, 유럽풍의 아름다운 거리 풍경을 즐길 수 있습니다.",
        "con": "끝나지 않는 살인적인 인플레이션과 경제 불안정으로 화폐 가치가 요동칩니다."},
    "Armenia": {"ko": "아르메니아", "tier": "하드", "tier_code": "D", "continent": "아시아", "homicide": 2.1, "gini": 27.9, "gdp_capita": 8200,
        "pro": "세계 최초의 기독교 공인 국가다운 유구한 역사 유적과 코카서스의 비경이 아름답습니다.",
        "con": "주변국과의 끊임없는 영토 분쟁과 지정학적 위기 속의 긴장감이 높습니다."},
    "Australia": {"ko": "호주", "tier": "천국", "tier_code": "S", "continent": "오세아니아", "homicide": 0.8, "gini": 34.3, "gdp_capita": 65000,
        "pro": "최상위급 소득과 복지, 청정한 자연과 워라밸이 보장되는 이민자들의 천국입니다.",
        "con": "치명적인 독충·야생동물들과 살인적인 주거비, 강렬한 자외선이 위협적입니다."},
    "Austria": {"ko": "오스트리아", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 0.7, "gini": 29.8, "gdp_capita": 56000,
        "pro": "세계에서 가장 살기 좋은 도시 빈과 알프스의 클래식한 예술·복지 낙원입니다.",
        "con": "보수적인 행정 시스템과 비싼 세금, 주말 상점 셧다운이 답답할 수 있습니다."},
    "Azerbaijan": {"ko": "아제르바이잔", "tier": "보통", "tier_code": "C", "continent": "아시아", "homicide": 2.1, "gini": 26.6, "gdp_capita": 7500,
        "pro": "카스피해의 석유 자본으로 건설된 현대적인 바쿠의 야경과 풍부한 먹거리가 있습니다.",
        "con": "장기 집권 체제와 제한된 언론의 자유, 주변국과의 국경 갈등이 있습니다."},
    "Bahamas": {"ko": "바하마", "tier": "이지", "tier_code": "B", "continent": "북아메리카", "homicide": 31.2, "gini": 41.4, "gdp_capita": 34000,
        "pro": "카리브해 최고의 휴양지와 카지노, 높은 1인당 소득을 누릴 수 있습니다.",
        "con": "높은 총기 강력범죄율과 매년 찾아오는 강력한 허리케인 피해가 문제입니다."},
    "Bahrain": {"ko": "바레인", "tier": "이지", "tier_code": "B", "continent": "아시아", "homicide": 0.5, "gini": 32.0, "gdp_capita": 28000,
        "pro": "걸프 국가 중 가장 개방적인 문화와 탄탄한 복지 혜택을 제공합니다.",
        "con": "여름철 50도를 육박하는 극심한 폭염과 자원 고갈 우려가 있습니다."},
    "Bangladesh": {"ko": "방글라데시", "tier": "하드", "tier_code": "D", "continent": "아시아", "homicide": 2.3, "gini": 39.9, "gdp_capita": 2700,
        "pro": "따뜻하고 정 많은 순박한 사람들과 전 세계 의류 산업을 이끄는 역동성이 있습니다.",
        "con": "세계 최고의 인구밀도, 숨 막히는 수도 다카의 교통체증, 몬순 홍수 피해가 극심합니다."},
    "Belgium": {"ko": "벨기에", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 1.1, "gini": 26.0, "gdp_capita": 53000,
        "pro": "EU 본부가 위치한 유럽의 심장이자 최고급 초콜릿과 맥주, 높은 사회보장제도를 자랑합니다.",
        "con": "세계 최고 수준의 소득세율과 플랑드르-왈롱 간의 언어·지역 갈등이 있습니다."},
    "Bolivia": {"ko": "볼리비아", "tier": "하드", "tier_code": "D", "continent": "남아메리카", "homicide": 4.1, "gini": 40.9, "gdp_capita": 3800,
        "pro": "신비로운 우유니 소금사막과 안데스의 순수한 원주민 전통문화를 간직하고 있습니다.",
        "con": "남미 최빈국 수준의 경제와 해양이 없는 내륙국의 한계, 잦은 정정 불안이 있습니다."},
    "Brazil": {"ko": "브라질", "tier": "보통", "tier_code": "C", "continent": "남아메리카", "homicide": 19.3, "gini": 52.0, "gdp_capita": 10400,
        "pro": "삼바와 축구, 아마존과 광활한 대자연, 세계에서 가장 유쾌하고 열정적인 사람들입니다.",
        "con": "파벨라로 대표되는 높은 치안 위험과 극심한 소득 양극화, 부패 문제가 있습니다."},
    "Bulgaria": {"ko": "불가리아", "tier": "보통", "tier_code": "C", "continent": "유럽", "homicide": 1.0, "gini": 39.0, "gdp_capita": 15800,
        "pro": "저렴한 물가와 흑해의 휴양지, EU 시민권 혜택을 누릴 수 있습니다.",
        "con": "유럽 최악의 인구 소멸 속도와 관료주의, 낙후된 지방 인프라가 단점입니다."},
    "Cambodia": {"ko": "캄보디아", "tier": "하드", "tier_code": "D", "continent": "아시아", "homicide": 1.8, "gini": 36.0, "gdp_capita": 1900,
        "pro": "앙코르와트의 위대한 유산과 미소가 아름다운 친절한 국민들이 반겨줍니다.",
        "con": "취약한 의료 시스템과 부정부패, 킬링필드의 아픔이 남아있는 빈곤이 지속됩니다."},
    "Canada": {"ko": "캐나다", "tier": "천국", "tier_code": "S", "continent": "북아메리카", "homicide": 2.1, "gini": 31.7, "gdp_capita": 54000,
        "pro": "광활한 웅장한 대자연과 최고 수준의 무상의료·공교육, 다문화 포용 정책을 갖췄습니다.",
        "con": "영하 30도를 밑도는 살인적인 혹한과 밴쿠버·토론토의 극심한 주택난이 버겁습니다."},
    "Chile": {"ko": "칠레", "tier": "이지", "tier_code": "B", "continent": "남아메리카", "homicide": 4.5, "gini": 44.9, "gdp_capita": 17000,
        "pro": "남미에서 가장 치안이 안정적이고 경제가 발전한 모범 국가이자 와인의 본고장입니다.",
        "con": "환태평양 조산대의 잦은 대지진 위험과 높은 사교육비·양극화 갈등이 큽니다."},
    "China": {"ko": "중국", "tier": "보통", "tier_code": "C", "continent": "아시아", "homicide": 0.5, "gini": 38.2, "gdp_capita": 13100,
        "pro": "세계 2위의 거대한 경제 규모, 눈부신 IT 인프라와 배달·모바일 결제 편의성을 자랑합니다.",
        "con": "엄격한 인터넷 검열(만리방화벽), 치열한 학업·취업 경쟁, 대기오염 문제가 있습니다."},
    "Colombia": {"ko": "콜롬비아", "tier": "하드", "tier_code": "D", "continent": "남아메리카", "homicide": 25.4, "gini": 54.8, "gdp_capita": 6900,
        "pro": "세계 최고의 향긋한 커피와 카리브해의 살사 리듬, 사계절 봄 날씨의 메데인이 매력적입니다.",
        "con": "마약 카르텔과 게릴라 역사가 남긴 치안 불안, 높은 강력범죄 노출 위험이 있습니다."},
    "Congo (Kinshasa)": {"ko": "콩고민주공화국", "tier": "지옥", "tier_code": "F", "continent": "아프리카", "homicide": 13.5, "gini": 42.1, "gdp_capita": 650,
        "pro": "코발트와 다이아몬드 등 전 세계 첨단산업에 필수적인 막대한 광물 자원을 품고 있습니다.",
        "con": "끝나지 않는 동부 내전과 극심한 기아, 세계 최하위 수준의 인간개발지수가 고통스럽습니다."},
    "Costa Rica": {"ko": "코스타리카", "tier": "이지", "tier_code": "B", "continent": "북아메리카", "homicide": 16.6, "gini": 48.7, "gdp_capita": 16000,
        "pro": "군대가 없는 평화로운 친환경 생태 낙원이자 '푸라 비다(Pura Vida)'의 여유가 넘칩니다.",
        "con": "중남미 국가 치고 물가가 매우 비싸고 최근 마약 밀매로 인한 치안 악화가 우려됩니다."},
    "Cote d'Ivoire": {"ko": "코트디부아르", "tier": "하드", "tier_code": "D", "continent": "아프리카", "homicide": 11.2, "gini": 41.5, "gdp_capita": 2700,
        "pro": "세계 1위의 카카오 생산국이자 서아프리카의 경제 허브로 급성장 중입니다.",
        "con": "취약한 기초 보건과 아동 노동 문제, 빈부격차가 심각합니다."},
    "Croatia": {"ko": "크로아티아", "tier": "이지", "tier_code": "B", "continent": "유럽", "homicide": 0.8, "gini": 29.7, "gdp_capita": 21000,
        "pro": "두브로브니크와 플리트비체 등 눈부신 아드리아해의 천혜 휴양지이자 높은 치안을 자랑합니다.",
        "con": "관광산업 편중으로 인한 계절적 일자리 불안과 청년층의 독일·오스트리아 이주가 많습니다."},
    "Cuba": {"ko": "쿠바", "tier": "하드", "tier_code": "D", "continent": "북아메리카", "homicide": 5.0, "gini": 38.0, "gdp_capita": 9500,
        "pro": "클래식카와 살사 음악, 세계 최고 수준의 기초 예방의학과 높은 교육 수준을 갖췄습니다.",
        "con": "만성적인 생필품 부족, 정전 사태, 미국의 경제 봉쇄와 통제로 인한 생활고가 심합니다."},
    "Czechia": {"ko": "체코", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 0.7, "gini": 25.3, "gdp_capita": 31000,
        "pro": "동화 같은 프라하의 고풍스러운 경관, 세계 1위의 필스너 맥주 소비국이자 안전한 치안을 자랑합니다.",
        "con": "서유럽 대비 다소 낮은 실질 임금 수준과 보수적인 관공서 행정이 단점입니다."},
    "Denmark": {"ko": "덴마크", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 0.8, "gini": 27.7, "gdp_capita": 68000,
        "pro": "세계에서 가장 행복한 '휘게(Hygge)' 라이프, 완벽한 요람에서 무덤까지의 복지 천국입니다.",
        "con": "세계 최고 수준의 살인적인 세금(최대 55%)과 겨울철의 어둡고 우울한 날씨가 힘듭니다."},
    "Egypt": {"ko": "이집트", "tier": "하드", "tier_code": "D", "continent": "아프리카", "homicide": 1.3, "gini": 31.5, "gdp_capita": 3700,
        "pro": "피라미드와 나일강 등 5천 년 인류 문명의 위대한 보고이자 아랍 문화의 중심지입니다.",
        "con": "심각한 화폐 가치 폭락과 경제난, 카이로의 살인적인 매연과 호객 행위가 극심합니다."},
    "Ethiopia": {"ko": "에티오피아", "tier": "지옥", "tier_code": "F", "continent": "아프리카", "homicide": 8.0, "gini": 35.0, "gdp_capita": 1200,
        "pro": "커피의 발상지로서의 자부심과 아프리카에서 식민 지배를 이겨낸 유서 깊은 독립 역사를 지녔습니다.",
        "con": "티그라이 등 만성적인 부족 갈등과 내전, 가뭄과 기아 위기가 끊이지 않습니다."},
    "Finland": {"ko": "핀란드", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 1.2, "gini": 27.7, "gdp_capita": 54000,
        "pro": "수년 연속 세계 행복지수 1위, 세계 최고 수준의 공교육과 사우나 문화의 천국입니다.",
        "con": "반년 동안 해가 뜨지 않는 혹독한 극야와 추위, 높은 자살률이 그늘입니다."},
    "France": {"ko": "프랑스", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 1.2, "gini": 31.5, "gdp_capita": 44000,
        "pro": "미식, 패션, 예술의 글로벌 수도이자 주 35시간 근무와 풍부한 연금 복지를 누립니다.",
        "con": "파리의 소매치기와 악명 높은 잦은 대중교통 파업, 비싼 파리 물가가 불편합니다."},
    "Germany": {"ko": "독일", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 0.8, "gini": 31.7, "gdp_capita": 53000,
        "pro": "유럽 최대의 경제 대국, 무상 대학교육과 탄탄한 제조업·사회보장망을 보유하고 있습니다.",
        "con": "답답할 정도로 느린 아날로그 관료제와 비싼 에너지 요금, 주말 상점 휴무가 답답합니다."},
    "Ghana": {"ko": "가나", "tier": "하드", "tier_code": "D", "continent": "아프리카", "homicide": 2.1, "gini": 43.5, "gdp_capita": 2200,
        "pro": "서아프리카에서 가장 민주주의와 치안이 안정적이며 친절한 환대의 나라입니다.",
        "con": "최근 겪은 극심한 국가부도 위기와 인플레이션, 열악한 전력 공급이 단점입니다."},
    "Greece": {"ko": "그리스", "tier": "이지", "tier_code": "B", "continent": "유럽", "homicide": 0.8, "gini": 31.4, "gdp_capita": 23000,
        "pro": "지중해의 눈부신 산토리니 섬과 고대 철학·민주주의의 발상지다운 따스한 햇살을 만끽합니다.",
        "con": "높은 청년 실업률과 여전히 회복 중인 국가 채무, 낮은 임금 수준이 고민입니다."},
    "Guatemala": {"ko": "과테말라", "tier": "지옥", "tier_code": "F", "continent": "북아메리카", "homicide": 17.5, "gini": 48.3, "gdp_capita": 5400,
        "pro": "아름다운 아티틀란 호수와 안티구아의 화려한 마야 문화 축제가 살아 숨쉽니다.",
        "con": "만연한 갱단 폭력과 극심한 영양실조, 높은 빈곤율로 미국 이민 행렬이 끊이지 않습니다."},
    "Haiti": {"ko": "아이티", "tier": "불지옥", "tier_code": "F", "continent": "북아메리카", "homicide": 40.9, "gini": 41.1, "gdp_capita": 1700,
        "pro": "카리브해 흑인 독립혁명의 유서 깊은 자긍심과 독창적인 부두 예술이 있습니다.",
        "con": "정부 기능 마비와 갱단의 수도 장악, 잦은 대지진과 콜레라로 국가 붕괴 위기입니다."},
    "Honduras": {"ko": "온두라스", "tier": "지옥", "tier_code": "F", "continent": "북아메리카", "homicide": 35.1, "gini": 48.2, "gdp_capita": 3200,
        "pro": "다이빙의 명소 로아탄 섬과 푸른 카리브해의 자연 경관을 품고 있습니다.",
        "con": "세계 최고 수준의 살인율과 갱단 갈취, 만연한 부패로 일상적 안전이 위협받습니다."},
    "Hong Kong": {"ko": "홍콩", "tier": "천국", "tier_code": "S", "continent": "아시아", "homicide": 0.3, "gini": 53.9, "gdp_capita": 50000,
        "pro": "세계 최고 수준의 대중교통 편의성, 환상적인 빅토리아 하버 야경과 미식의 천국입니다.",
        "con": "세계에서 가장 숨 막히는 아파트 주거비와 좁은 주거공간, 정치적 자유 축소가 아쉽습니다."},
    "Hungary": {"ko": "헝가리", "tier": "보통", "tier_code": "C", "continent": "유럽", "homicide": 0.8, "gini": 29.2, "gdp_capita": 22000,
        "pro": "부다페스트의 야경과 온천 문화, 풍부한 파프리카 요리와 저렴한 생활비가 좋습니다.",
        "con": "서유럽 대비 낮은 급여와 높은 인플레이션, 권위주의적 정치 환경이 지적받습니다."},
    "Iceland": {"ko": "아이슬란드", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 0.3, "gini": 26.1, "gdp_capita": 78000,
        "pro": "세계 평화지수 1위의 무범죄 청정국가, 빙하와 오로라, 지열 온천의 신비로운 낙원입니다.",
        "con": "살인적인 외식 물가와 좁은 인간관계, 수시로 분화하는 화산 폭발 불안이 있습니다."},
    "India": {"ko": "인도", "tier": "하드", "tier_code": "D", "continent": "아시아", "homicide": 2.9, "gini": 35.7, "gdp_capita": 2600,
        "pro": "세계 1위의 인구와 급부상하는 글로벌 IT 강국, 무한한 영적·문화적 다양성이 있습니다.",
        "con": "대도시의 극심한 대기오염, 카스트 잔재와 빈부격차, 혼란스러운 위생 상태가 힘듭니다."},
    "Indonesia": {"ko": "인도네시아", "tier": "보통", "tier_code": "C", "continent": "아시아", "homicide": 0.6, "gini": 37.9, "gdp_capita": 4900,
        "pro": "발리 등 1만 7천 개 섬의 환상적인 휴양지와 순박한 사람들, 니켈 기반의 고성장 경제를 누립니다.",
        "con": "자카르타의 침수 및 지옥 같은 교통체증, 잦은 지진·화산 자연재해가 빈번합니다."},
    "Iran": {"ko": "이란", "tier": "하드", "tier_code": "D", "continent": "아시아", "homicide": 2.2, "gini": 40.9, "gdp_capita": 4600,
        "pro": "페르시아 3천 년의 찬란한 문화유산과 손님을 극진히 대접하는 타아로프 문화가 있습니다.",
        "con": "국제 제재로 인한 경제 고립, 엄격한 이슬람 종교 율법과 여성 인권 제약이 큽니다."},
    "Iraq": {"ko": "이라크", "tier": "지옥", "tier_code": "F", "continent": "아시아", "homicide": 10.1, "gini": 29.5, "gdp_capita": 5800,
        "pro": "메소포타미아 인류 문명의 요람이자 막대한 석유 자원을 보유하고 있습니다.",
        "con": "수십 년간의 전쟁과 테러 여파, 극심한 사막화와 정치적 불안정이 일상을 짓누릅니다."},
    "Ireland": {"ko": "아일랜드", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 0.7, "gini": 28.5, "gdp_capita": 103000,
        "pro": "글로벌 빅테크의 유럽 거점이자 높은 1인당 GDP, 따뜻한 펍 문화와 기네스 맥주의 나라입니다.",
        "con": "더블린의 살인적인 월세와 주택 공급난, 일 년 내내 비가 내리는 날씨가 힘듭니다."},
    "Israel": {"ko": "이스라엘", "tier": "보통", "tier_code": "C", "continent": "아시아", "homicide": 1.5, "gini": 38.6, "gdp_capita": 55000,
        "pro": "나스닥 상장 기업 수 세계 상위권의 첨단 스타트업 국가이자 높은 1인당 소득을 자랑합니다.",
        "con": "상시적인 로켓 공격 및 전쟁 위협, 높은 물가와 안식일 종교 규제가 있습니다."},
    "Italy": {"ko": "이탈리아", "tier": "이지", "tier_code": "B", "continent": "유럽", "homicide": 0.5, "gini": 35.2, "gdp_capita": 37000,
        "pro": "세계 최다 유네스코 세계유산, 환상적인 지중해 요리와 에스프레소의 여유로운 삶을 누립니다.",
        "con": "남북 간의 심각한 경제 격차, 청년 일자리 부족과 느린 관공서 행정이 답답합니다."},
    "Jamaica": {"ko": "자메이카", "tier": "하드", "tier_code": "D", "continent": "북아메리카", "homicide": 52.9, "gini": 35.0, "gdp_capita": 6000,
        "pro": "레게 음악과 우사인 볼트의 나라, 아름다운 카리브해 해변과 긍정적인 라이프스타일이 있습니다.",
        "con": "세계 최상위권의 살인율과 갱단 범죄, 취약한 경제 구조가 문제입니다."},
    "Japan": {"ko": "일본", "tier": "천국", "tier_code": "S", "continent": "아시아", "homicide": 0.2, "gini": 32.9, "gdp_capita": 34000,
        "pro": "세계 최고 수준의 치안과 깨끗한 거리, 완벽한 편의점 인프라와 애니·미식 문화가 뛰어납니다.",
        "con": "초고령화와 아날로그 도장 문화, 지진 및 태풍 등 잦은 자연재해의 공포가 상존합니다."},
    "Jordan": {"ko": "요르단", "tier": "보통", "tier_code": "C", "continent": "아시아", "homicide": 1.0, "gini": 33.7, "gdp_capita": 4400,
        "pro": "페트라와 사해 등 신비로운 유적과 중동에서 가장 온건하고 안전한 치안을 유지합니다.",
        "con": "석유가 나지 않는 자원 빈국으로 물 부족과 높은 청년 실업률이 심각합니다."},
    "Kazakhstan": {"ko": "카자흐스탄", "tier": "보통", "tier_code": "C", "continent": "아시아", "homicide": 3.2, "gini": 27.8, "gdp_capita": 13000,
        "pro": "중앙아시아 최대의 경제 대국이자 광활한 대초원, 다양한 민족이 평화롭게 공존합니다.",
        "con": "겨울철 영하 40도의 아스타나 혹한과 권위주의적 정치 체제가 단점입니다."},
    "Kenya": {"ko": "케냐", "tier": "하드", "tier_code": "D", "continent": "아프리카", "homicide": 5.3, "gini": 40.8, "gdp_capita": 2100,
        "pro": "마사이마라 사파리의 대자연과 모바일 핀테크(M-Pesa)가 선도하는 동아프리카의 실리콘 사바나입니다.",
        "con": "나이로비의 빈민가 치안 불안과 극심한 부패, 최근의 세금 폭탄 시위 갈등이 있습니다."},
    "Korea, South": {"ko": "대한민국", "tier": "천국", "tier_code": "S", "continent": "아시아", "homicide": 0.5, "gini": 31.4, "gdp_capita": 34000,
        "pro": "밤 12시에도 안전한 세계 최강 치안, 초고속 인터넷과 쿠팡 로켓배송, K-컬처의 본진입니다.",
        "con": "극심한 학벌·취업·외모 비교 경쟁, 살인적인 저출산과 잦은 야근 피로가 무겁습니다."},
    "Kuwait": {"ko": "쿠웨이트", "tier": "이지", "tier_code": "B", "continent": "아시아", "homicide": 1.0, "gini": 30.0, "gdp_capita": 37000,
        "pro": "세계 최고 가치의 화폐(쿠웨이트 디나르)와 국민들에게 제공되는 막대한 오일머니 복지가 있습니다.",
        "con": "외국인에 대한 폐쇄적인 제도와 여름철 50도를 넘나드는 지옥 같은 사막 열기입니다."},
    "Laos": {"ko": "라오스", "tier": "하드", "tier_code": "D", "continent": "아시아", "homicide": 7.0, "gini": 38.8, "gdp_capita": 1900,
        "pro": "루앙프라방의 고요한 불교 탁발과 때 묻지 않은 에메랄드빛 방비엥 자연이 힐링을 줍니다.",
        "con": "높은 대중국 국가 부채와 인플레이션, 낙후된 의료·교통 시설이 불편합니다."},
    "Malaysia": {"ko": "말레이시아", "tier": "이지", "tier_code": "B", "continent": "아시아", "homicide": 1.9, "gini": 41.1, "gdp_capita": 13000,
        "pro": "저렴한 물가와 영어 통용, 다민족의 풍성한 미식과 동남아 최고 수준의 인프라를 갖췄습니다.",
        "con": "부미푸트라(말레이계 우대) 정책으로 인한 민족 간 갈등과 습한 열대 기후가 있습니다."},
    "Mexico": {"ko": "멕시코", "tier": "보통", "tier_code": "C", "continent": "북아메리카", "homicide": 25.2, "gini": 45.4, "gdp_capita": 13800,
        "pro": "타코와 칸쿤 휴양지, 친절하고 흥이 넘치는 국민성과 북미 니어쇼어링 경제 호황입니다.",
        "con": "악명 높은 마약 카르텔 폭력과 높은 살인율, 특정 지역의 극심한 치안 불안이 문제입니다."},
    "Mongolia": {"ko": "몽골", "tier": "보통", "tier_code": "C", "continent": "아시아", "homicide": 5.6, "gini": 32.7, "gdp_capita": 5800,
        "pro": "쏟아지는 은하수와 끝없는 푸른 초원, 유목민의 자유로운 영혼을 품은 대자연입니다.",
        "con": "세계에서 가장 추운 수도 울란바토르의 겨울 매연과 게르촌 난방 공해가 심합니다."},
    "Morocco": {"ko": "모로코", "tier": "보통", "tier_code": "C", "continent": "아프리카", "homicide": 1.3, "gini": 39.5, "gdp_capita": 3900,
        "pro": "사하라 사막과 푸른 도시 셰프샤우엔, 아라비안나이트의 이국적인 매력이 가득합니다.",
        "con": "관광지의 극성스러운 호객꾼과 사기, 여성 혼자 여행하기에 부담스러운 시선이 있습니다."},
    "Netherlands": {"ko": "네덜란드", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 0.6, "gini": 25.7, "gdp_capita": 63000,
        "pro": "자전거 천국이자 개방적이고 실용적인 사회, 높은 영어 구사율과 탄탄한 복지가 있습니다.",
        "con": "해수면보다 낮은 국토의 기후변화 위협과 암스테르담의 살인적인 주택난이 심각합니다."},
    "New Zealand": {"ko": "뉴질랜드", "tier": "천국", "tier_code": "S", "continent": "오세아니아", "homicide": 1.1, "gini": 33.9, "gdp_capita": 48000,
        "pro": "반지의 제왕 촬영지의 환상적인 자연, 청정 공기와 평화로운 라이프스타일을 자랑합니다.",
        "con": "지리적 고립으로 인한 비싼 수입품 물가와 잦은 지진, 심심한 밤문화가 단점입니다."},
    "Nigeria": {"ko": "나이지리아", "tier": "하드", "tier_code": "D", "continent": "아프리카", "homicide": 21.7, "gini": 35.1, "gdp_capita": 1600,
        "pro": "아프리카 최대의 인구와 놀리우드 영화 산업, 폭발적인 엔터테인먼트 에너지가 넘칩니다.",
        "con": "라고스의 극심한 교통지옥과 보코하람 테러 위협, 잦은 정전과 나이라화 폭락이 고통스럽습니다."},
    "Norway": {"ko": "노르웨이", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 0.5, "gini": 27.7, "gdp_capita": 89000,
        "pro": "세계 최대의 국부펀드를 가진 부유한 복지 낙원, 피오르드의 환상적인 대자연입니다.",
        "con": "외식 한 끼에 수만 원이 깨지는 극악의 물가와 춥고 긴 겨울 어둠이 힘듭니다."},
    "Pakistan": {"ko": "파키스탄", "tier": "하드", "tier_code": "D", "continent": "아시아", "homicide": 4.2, "gini": 29.6, "gdp_capita": 1500,
        "pro": "K2를 비롯한 카라코람산맥의 웅장한 봉우리들과 따뜻한 무슬림 환대 문화가 있습니다.",
        "con": "만성적인 외환위기, 극심한 인플레이션과 정치적 혼란, 테러 위험이 상존합니다."},
    "Peru": {"ko": "페루", "tier": "보통", "tier_code": "C", "continent": "남아메리카", "homicide": 4.3, "gini": 40.3, "gdp_capita": 7800,
        "pro": "마추픽추의 신비와 남미 최고의 미식(세비체) 천국, 풍부한 잉카 문명을 품고 있습니다.",
        "con": "리마의 잦은 안개와 정치적 대통령 탄핵 정국, 대도시 소매치기 치안 문제가 있습니다."},
    "Philippines": {"ko": "필리핀", "tier": "하드", "tier_code": "D", "continent": "아시아", "homicide": 4.3, "gini": 40.7, "gdp_capita": 3800,
        "pro": "보라카이·세부의 눈부신 휴양지와 뛰어난 영어 실력, 언제나 노래하고 웃는 밝은 사람들입니다.",
        "con": "매년 국토를 강타하는 태풍과 홍수, 마닐라의 극심한 빈부격차와 치안 사각지대가 있습니다."},
    "Poland": {"ko": "폴란드", "tier": "이지", "tier_code": "B", "continent": "유럽", "homicide": 0.7, "gini": 28.5, "gdp_capita": 22000,
        "pro": "유럽에서 가장 빠르게 성장하는 경제와 안전한 치안, 저렴한 물가와 탄탄한 제조업이 있습니다.",
        "con": "우크라이나 전쟁 인접국으로서의 안보 불안과 보수적인 사회 분위기가 존재합니다."},
    "Portugal": {"ko": "포르투갈", "tier": "이지", "tier_code": "B", "continent": "유럽", "homicide": 0.8, "gini": 34.6, "gdp_capita": 26000,
        "pro": "연중 온화한 지중해 날씨, 친절한 국민성과 저렴한 에그타르트·와인, 매우 안전한 치안입니다.",
        "con": "서유럽 대비 낮은 임금 수준과 디지털 노마드 유입으로 인한 리스본 집값 폭등이 문제입니다."},
    "Russia": {"ko": "러시아", "tier": "지옥", "tier_code": "F", "continent": "유럽", "homicide": 6.8, "gini": 36.0, "gdp_capita": 14000,
        "pro": "세계에서 가장 넓은 영토와 톨스토이·차이콥스키의 찬란한 문화예술, 풍부한 천연자원을 지녔습니다.",
        "con": "우크라이나 침공으로 인한 가혹한 국제 제재, 무차별 강제 징집과 전사 위험, 엄격한 감시 사회입니다."},
    "Saudi Arabia": {"ko": "사우디아라비아", "tier": "이지", "tier_code": "B", "continent": "아시아", "homicide": 1.3, "gini": 45.9, "gdp_capita": 33000,
        "pro": "세금 없는 높은 소득과 비전 2030 메가 프로젝트, 풍부한 오일머니 혜택을 누립니다.",
        "con": "여름철 45도가 넘는 극심한 사막 더위와 엄격한 왕정 체제 및 음주 금지 규율이 있습니다."},
    "Singapore": {"ko": "싱가포르", "tier": "천국", "tier_code": "S", "continent": "아시아", "homicide": 0.1, "gini": 45.2, "gdp_capita": 88000,
        "pro": "세계 1위급 초특급 치안과 청결함, 아시아 금융의 허브이자 편리한 도시 인프라를 누립니다.",
        "con": "껌도 함부로 못 뱉는 가혹한 벌금과 태형, 살인적인 자동차 구입비 및 주거비가 듭니다."},
    "Somalia": {"ko": "소말리아", "tier": "불지옥", "tier_code": "F", "continent": "아프리카", "homicide": 18.0, "gini": 36.8, "gdp_capita": 550,
        "pro": "아프리카의 뿔에 위치한 길고 아름다운 인도양 해안선과 유서 깊은 유목민 전통이 있습니다.",
        "con": "수십 년간 이어진 참혹한 내전과 알샤바브 테러, 정부 통제력 상실과 극심한 기근으로 생존 자체가 기적입니다."},
    "South Africa": {"ko": "남아프리카공화국", "tier": "하드", "tier_code": "D", "continent": "아프리카", "homicide": 41.9, "gini": 63.0, "gdp_capita": 6200,
        "pro": "케이프타운의 환상적인 풍경과 다양한 인종이 어우러진 '무지개 나라'의 매력이 넘칩니다.",
        "con": "세계 최고 수준의 불평등과 살인율, 매일 반복되는 순환 단전(로드셰딩)이 일상입니다."},
    "South Sudan": {"ko": "남수단", "tier": "불지옥", "tier_code": "F", "continent": "아프리카", "homicide": 14.2, "gini": 44.1, "gdp_capita": 490,
        "pro": "나일강 상류의 광활한 늪지대와 독특한 전통 부족 문화를 간직하고 있습니다.",
        "con": "독립 이후 끊이지 않는 참혹한 부족 간 내전과 만성적인 대기근, 세계 최악 수준의 의료 붕괴를 겪고 있습니다."},
    "Spain": {"ko": "스페인", "tier": "이지", "tier_code": "B", "continent": "유럽", "homicide": 0.6, "gini": 33.9, "gdp_capita": 33000,
        "pro": "시에스타와 타파스, 일 년 내내 따뜻한 태양과 세계적인 축구 리그의 낭만이 넘칩니다.",
        "con": "높은 청년 실업률과 대도시의 소매치기, 여름철 극심한 남부 폭염이 단점입니다."},
    "Sudan": {"ko": "수단", "tier": "불지옥", "tier_code": "F", "continent": "아프리카", "homicide": 12.0, "gini": 34.2, "gdp_capita": 750,
        "pro": "나일강이 합류하는 유서 깊은 고대 누비아 피라미드 문명과 풍부한 농업 잠재력을 지녔습니다.",
        "con": "정부군과 RSF 반군 간의 참혹한 전면 내전으로 전국적인 학살, 약탈, 수백만 난민 대참사가 벌어지고 있습니다."},
    "Sweden": {"ko": "스웨덴", "tier": "천국", "tier_code": "S", "continent": "유럽", "homicide": 1.1, "gini": 28.9, "gdp_capita": 56000,
        "pro": "이케아와 스포티파이의 혁신국가, 평등하고 체계적인 육아휴직과 복지 시스템을 갖췄습니다.",
        "con": "최근 증가한 이민자 갱단 총격 사건과 길고 어두운 겨울 날씨가 부담입니다."},
    "Switzerland": {"ko": "스위스", "tier": "천국", "tier_code": "SSS", "continent": "유럽", "homicide": 0.5, "gini": 33.1, "gdp_capita": 99000,
        "pro": "동화 같은 알프스 만년설, 세계 최고 수준의 평균 연봉과 완벽한 치안을 보장합니다.",
        "con": "빅맥 세트 하나에 2만 원이 넘는 천문학적 물가와 엄격한 이웃 소음 규제가 있습니다."},
    "Syria": {"ko": "시리아", "tier": "불지옥", "tier_code": "F", "continent": "아시아", "homicide": 8.5, "gini": 35.8, "gdp_capita": 800,
        "pro": "인류 최고(最古)의 도시 다마스쿠스와 찬란했던 고대 오리엔트 문명의 발자취가 남아있습니다.",
        "con": "10년 넘는 처참한 내전과 공습 폭격으로 국토의 절반 이상이 초토화되었고 피난민 위기가 지속됩니다."},
    "Taiwan": {"ko": "대만", "tier": "천국", "tier_code": "S", "continent": "아시아", "homicide": 0.8, "gini": 34.0, "gdp_capita": 33000,
        "pro": "TSMC로 대표되는 반도체 강국, 안전한 치안과 야시장 미식, 친절한 국민성이 돋보입니다.",
        "con": "중국의 군사적 침공 위협과 잦은 지진, 습하고 무더운 여름이 힘듭니다."},
    "Thailand": {"ko": "태국", "tier": "보통", "tier_code": "C", "continent": "아시아", "homicide": 2.6, "gini": 35.1, "gdp_capita": 7300,
        "pro": "미소의 나라, 팟타이와 똠얌꿍 등 저렴하고 풍성한 길거리 음식과 마사지 천국입니다.",
        "con": "방콕의 극심한 매연과 트래픽잼, 잦은 군부 쿠데타와 정치적 격변이 변수입니다."},
    "Turkey": {"ko": "튀르키예", "tier": "보통", "tier_code": "C", "continent": "유럽", "homicide": 2.5, "gini": 44.4, "gdp_capita": 13000,
        "pro": "동서양 문명이 교차하는 이스탄불의 장엄함, 케밥 미식과 열정적인 환대 문화가 있습니다.",
        "con": "리라화 폭락과 살인적인 인플레이션, 지진 단층대 위의 불안감이 상존합니다."},
    "Ukraine": {"ko": "우크라이나", "tier": "불지옥", "tier_code": "F", "continent": "유럽", "homicide": 5.0, "gini": 25.6, "gdp_capita": 4700,
        "pro": "비옥한 흑토 지대의 풍요로움과 독립을 지키기 위한 강인한 국민적 단결력이 있습니다.",
        "con": "러시아의 전면 침공으로 인한 전쟁 참화, 미사일 폭격과 전력망 파괴, 상시적인 징집 공포와 생존 위기입니다."},
    "United Arab Emirates": {"ko": "아랍에미리트", "tier": "천국", "tier_code": "S", "continent": "아시아", "homicide": 0.5, "gini": 26.0, "gdp_capita": 49000,
        "pro": "두바이의 초호화 미래 도시 인프라, 무세금 혜택과 세계 최고 수준의 치안을 누립니다.",
        "con": "여름철 50도에 육박하는 살인적 더위와 높은 거주 비용, 엄격한 법률이 있습니다."},
    "United Kingdom": {"ko": "영국", "tier": "이지", "tier_code": "B", "continent": "유럽", "homicide": 1.0, "gini": 35.1, "gdp_capita": 48000,
        "pro": "프리미어리그와 록 음악, 세계적인 대학과 글로벌 금융 수도 런던의 문화적 깊이가 있습니다.",
        "con": "브렉시트 이후의 경제 침체, 무너져가는 NHS 공공의료 대기시간, 우울한 날씨가 아쉽습니다."},
    "United States": {"ko": "미국", "tier": "천국", "tier_code": "S", "continent": "북아메리카", "homicide": 6.3, "gini": 39.8, "gdp_capita": 80000,
        "pro": "세계 최강의 패권국이자 기회의 땅, 압도적인 소득과 실리콘밸리·할리우드의 혁신이 넘칩니다.",
        "con": "언제 터질지 모르는 일상적 총기 난사 공포와 파산으로 이어지는 무시무시한 병원비가 도사립니다."},
    "Uruguay": {"ko": "우루과이", "tier": "이지", "tier_code": "B", "continent": "남아메리카", "homicide": 8.9, "gini": 40.2, "gdp_capita": 21000,
        "pro": "남미의 스위스로 불리는 높은 복지와 안정된 민주주의, 평화로운 마테차 문화가 있습니다.",
        "con": "남미에서 가장 비싼 생활 물가와 다소 높은 청년 실업률이 걸림돌입니다."},
    "Uzbekistan": {"ko": "우즈베키스탄", "tier": "보통", "tier_code": "C", "continent": "아시아", "homicide": 1.2, "gini": 31.2, "gdp_capita": 2500,
        "pro": "실크로드의 푸른 오아시스 사마르칸트와 맛있는 샤슬릭, 순박하고 정 많은 사람들이 있습니다.",
        "con": "한여름 폭염과 혹한, 관료주의와 다소 낙후된 지방 인프라가 단점입니다."},
    "Venezuela": {"ko": "베네수엘라", "tier": "불지옥", "tier_code": "F", "continent": "남아메리카", "homicide": 40.4, "gini": 44.8, "gdp_capita": 3500,
        "pro": "세계 1위의 석유 매장량과 엔젤 폭포 등 압도적인 카리브해 천연자원을 지녔습니다.",
        "con": "초인플레이션과 국가 경제 파탄, 식량·의약품 부족으로 수백만 명이 탈출한 비극의 땅입니다."},
    "Vietnam": {"ko": "베트남", "tier": "보통", "tier_code": "C", "continent": "아시아", "homicide": 1.5, "gini": 36.8, "gdp_capita": 4300,
        "pro": "쌀국수와 분짜 등 맛있는 미식, 활기찬 청년 인구와 급성장하는 세계의 공장입니다.",
        "con": "하노이·호치민의 오토바이 매연과 교통 혼잡, 권위주의적 당정 체제가 있습니다."},
    "West Bank and Gaza": {"ko": "팔레스타인", "tier": "불지옥", "tier_code": "F", "continent": "아시아", "homicide": 6.2, "gini": 33.7, "gdp_capita": 3200,
        "pro": "올리브 나무와 오랜 역사 유적, 고난 속에서도 꺾이지 않는 민족적 연대감이 있습니다.",
        "con": "가자지구 전면전과 지속되는 폭격 참화, 국경 봉쇄와 식량·식수 부족으로 일상이 파괴되었습니다."},
    "Yemen": {"ko": "예멘", "tier": "불지옥", "tier_code": "F", "continent": "아시아", "homicide": 6.8, "gini": 36.7, "gdp_capita": 650,
        "pro": "사막의 맨해튼 시밤과 모카 커피의 발상지로서의 깊은 아라비아 유산이 있습니다.",
        "con": "후티 반군과 정부군 간의 오랜 내전, 공습과 극심한 기아 위기로 현대사 최악의 인도주의 참사를 겪고 있습니다."},
    "Myanmar": {"ko": "미얀마", "tier": "불지옥", "tier_code": "F", "continent": "아시아", "homicide": 8.7, "gini": 30.7, "gdp_capita": 1200,
        "pro": "바간의 수천 개 황금 파고다와 친절하고 순박한 불교 문화의 정취가 있습니다.",
        "con": "군부 쿠데타 이후 전국적인 내전과 무차별 공습, 강제 징집과 반군 교전으로 청년들의 삶이 파괴되었습니다."},
    "Lebanon": {"ko": "레바논", "tier": "지옥", "tier_code": "F", "continent": "아시아", "homicide": 3.9, "gini": 31.8, "gdp_capita": 3800,
        "pro": "중동의 파리로 불리던 찬란한 지중해 문화와 맛있는 레바논 미식이 있습니다.",
        "con": "이스라엘-헤즈볼라 간의 폭격과 무력 충돌, 국가 부도와 파탄 난 화폐 가치로 삶이 무너졌습니다."},
    "Mali": {"ko": "말리", "tier": "불지옥", "tier_code": "F", "continent": "아프리카", "homicide": 10.9, "gini": 36.1, "gdp_capita": 890,
        "pro": "팀북투와 서아프리카 고대 황금 제국의 유서 깊은 음악과 문화가 숨 쉽니다.",
        "con": "군부 쿠데타와 이슬람 무장 반군의 잦은 테러, 바그너 용병 개입과 치안 붕괴로 극도로 위험합니다."},
    "Burkina Faso": {"ko": "부르키나파소", "tier": "불지옥", "tier_code": "F", "continent": "아프리카", "homicide": 11.5, "gini": 35.3, "gdp_capita": 830,
        "pro": "'정직한 사람들의 땅'이라는 이름처럼 순수하고 따뜻한 공동체 문화가 있습니다.",
        "con": "국토의 상당 부분을 장악한 테러 조직의 학살과 잦은 쿠데타, 수백만 국내 피난민이 발생했습니다."},
    "Central African Republic": {"ko": "중앙아프리카공화국", "tier": "불지옥", "tier_code": "F", "continent": "아프리카", "homicide": 19.8, "gini": 56.2, "gdp_capita": 510,
        "pro": "울창한 열대우림과 야생동물, 풍부한 다이아몬드와 목재 자원을 품고 있습니다.",
        "con": "끝나지 않는 군벌 간의 종교·민족 내전과 잔혹한 학살, 세계 최하위 수준의 인간개발지수를 기록 중입니다."},
    "Libya": {"ko": "리비아", "tier": "지옥", "tier_code": "F", "continent": "아프리카", "homicide": 15.6, "gini": 30.2, "gdp_capita": 6200,
        "pro": "아프리카 최대의 석유 매장량과 찬란한 고대 로마 유적을 보유하고 있습니다.",
        "con": "동서 정부와 군벌 간의 분열, 외국 용병 개입과 잦은 무력 충돌로 국가 통치 기능이 분열되었습니다."},
    "Korea, North": {"ko": "북한", "tier": "불지옥", "tier_code": "F", "continent": "아시아", "homicide": 15.0, "gini": 35.0, "gdp_capita": 1700,
        "pro": "백두산과 금강산 등 수려한 자연 풍광, 높은 교육 수준과 국가 의료 서비스가 존재합니다.",
        "con": "세계 최악의 전체주의 독재 체제 아래 외부 세계와 완전 단절, 집단 수용소와 처형이 일상화된 인권 말살 국가입니다."},
    "Eritrea": {"ko": "에리트레아", "tier": "불지옥", "tier_code": "F", "continent": "아프리카", "homicide": 7.5, "gini": 35.0, "gdp_capita": 660,
        "pro": "홍해 연안의 아름다운 풍경과 이탈리아 식민지 시대의 독특한 건축 문화가 있습니다.",
        "con": "아프리카의 북한으로 불리는 세계 최악의 철권 독재 체제, 무기한 강제 군복무와 탈출 시 사살 명령이 있습니다."},
    "Belarus": {"ko": "벨라루스", "tier": "지옥", "tier_code": "F", "continent": "유럽", "homicide": 3.8, "gini": 24.4, "gdp_capita": 7600,
        "pro": "구소련 시대의 탄탄한 제조업 인프라와 아름다운 숲과 호수, 저렴한 물가가 있습니다.",
        "con": "루카셴코 독재 정권 아래 반정부 시위대 대규모 학살, 야당 탄압과 감시 사회, 러시아에 종속된 위성국가 신세입니다."},
    "Zimbabwe": {"ko": "짐바브웨", "tier": "지옥", "tier_code": "F", "continent": "아프리카", "homicide": 6.7, "gini": 50.3, "gdp_capita": 1100,
        "pro": "빅토리아 폭포와 웅장한 야생동물 사파리, 아름다운 하라레의 도시 경관이 있습니다.",
        "con": "세계 최고 수준의 초인플레이션 역사와 경제 붕괴, 30년 독재 여파로 무너진 공공 인프라가 여전합니다."},
    "Nicaragua": {"ko": "니카라과", "tier": "지옥", "tier_code": "F", "continent": "북아메리카", "homicide": 7.9, "gini": 46.2, "gdp_capita": 2200,
        "pro": "오메테페 섬의 화산 자연과 중미의 저렴한 물가, 전통 생활 방식이 남아있습니다.",
        "con": "오르테가 독재 정권의 강권 탄압과 반대파 투옥, 교회 탄압, 수십만 명이 탈출한 정치 공포 국가입니다."},
    "Chad": {"ko": "차드", "tier": "불지옥", "tier_code": "F", "continent": "아프리카", "homicide": 9.5, "gini": 37.4, "gdp_capita": 700,
        "pro": "사하라 이남 아프리카의 광활한 사막과 호수, 다양한 유목 민족의 고유한 전통이 있습니다.",
        "con": "끊임없는 군사 쿠데타와 부족 간 분쟁, 극심한 기아와 세계 최하위권의 생활 환경 속에서 생존을 다퉈야 합니다."},
    "Niger": {"ko": "니제르", "tier": "불지옥", "tier_code": "F", "continent": "아프리카", "homicide": 5.5, "gini": 34.3, "gdp_capita": 560,
        "pro": "서아프리카 이슬람 문명의 유서 깊은 중심지 아가데스와 사막의 낙타 교역 문화가 있습니다.",
        "con": "잇따른 군사 쿠데타와 이슬람 무장 단체의 국경 테러, 세계 최빈국 수준의 영양실조와 물 부족이 만연합니다."},
    "Mozambique": {"ko": "모잠비크", "tier": "지옥", "tier_code": "F", "continent": "아프리카", "homicide": 3.4, "gini": 54.0, "gdp_capita": 500,
        "pro": "인도양의 아름다운 해안선과 마푸투의 포르투갈 식민지 시대 건축이 인상적입니다.",
        "con": "이슬람 무장 단체의 북부 테러와 학살, 세계 최악의 사이클론 피해와 극심한 빈곤이 발목을 잡습니다."},
    # Simplemaps uses "Burma" instead of "Myanmar"
    "Burma": {"ko": "미얀마", "tier": "불지옥", "tier_code": "F", "continent": "아시아", "homicide": 8.7, "gini": 30.7, "gdp_capita": 1200,
        "pro": "바간의 수천 개 황금 파고다와 친절하고 순박한 불교 문화의 정취가 있습니다.",
        "con": "군부 쿠데타 이후 전국적인 내전과 무차별 공습, 강제 징집과 반군 교전으로 청년들의 삶이 파괴되었습니다."},
    # Simplemaps splits Palestine into "Gaza Strip" and "West Bank"
    "Gaza Strip": {"ko": "가자지구", "tier": "불지옥", "tier_code": "F", "continent": "아시아", "homicide": 8.0, "gini": 33.7, "gdp_capita": 1500,
        "pro": "지중해 연안의 오래된 역사 유적과 고난 속에서도 꺾이지 않는 민족적 연대감이 있습니다.",
        "con": "이스라엘의 전면 공격과 지속되는 폭격 참화, 완전한 봉쇄와 식량·식수·전력 부족으로 인류 최악의 인도주의 참사가 벌어지고 있습니다."},
    "West Bank": {"ko": "요르단강 서안", "tier": "불지옥", "tier_code": "F", "continent": "아시아", "homicide": 5.0, "gini": 33.7, "gdp_capita": 3500,
        "pro": "올리브 나무와 오랜 역사 유적, 고난 속에서도 꺾이지 않는 민족적 연대감이 있습니다.",
        "con": "군사 점령과 정착촌 확대, 검문소 통제와 잦은 무력 충돌로 일상적인 이동의 자유조차 빼앗겼습니다."}
}

def main():
    print("--- 1. Processing UN Birth Data ---")
    # Read UN birth count data
    # Priority: 2025 -> 2024 -> 2023 -> latest with Area=Total, Month=Total
    un_country_births = {}
    with open('UNdata_Export_20260823_101341609.csv', mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            c = (row.get('Country or Area') or '').strip()
            yr = (row.get('Year') or '').strip()
            area = (row.get('Area') or '').strip()
            month = (row.get('Month') or '').strip()
            val = (row.get('Value') or '').strip()
            
            if not c or not yr.isdigit() or not val:
                continue
            
            # Condition: Area == 'Total' and Month == 'Total'
            if area == 'Total' and month == 'Total':
                try:
                    val_clean = int(float(val.replace(',', '')))
                    year_int = int(yr)
                    if c not in un_country_births:
                        un_country_births[c] = {'year': year_int, 'births': val_clean}
                    else:
                        # Prioritize 2025, then newer years
                        curr = un_country_births[c]
                        if curr['year'] != 2025 and (year_int == 2025 or year_int > curr['year']):
                            un_country_births[c] = {'year': year_int, 'births': val_clean}
                except Exception:
                    pass

    print(f"UN birth data loaded for {len(un_country_births)} countries/areas.")

    print("\n--- 2. Processing World Cities Data ---")
    cities_by_country = {}
    all_cities = []
    
    with open('worldcities.csv', mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            country = row['country'].strip()
            iso2 = row['iso2'].strip().upper()
            iso3 = row['iso3'].strip().upper()
            city = row['city'].strip()
            city_ascii = row['city_ascii'].strip()
            lat = float(row['lat'])
            lng = float(row['lng'])
            admin_name = row['admin_name'].strip()
            capital = row['capital'].strip() # 'primary', 'admin', 'minor', ''
            pop_str = row['population'].strip()
            pop = int(float(pop_str)) if pop_str else 1000
            
            city_obj = {
                "name": city,
                "name_ascii": city_ascii,
                "lat": lat,
                "lng": lng,
                "country": country,
                "iso2": iso2,
                "iso3": iso3,
                "admin": admin_name,
                "capital": capital,
                "population": pop,
                "weight": max(pop, 500) # Ensure positive weight for random drawing
            }
            all_cities.append(city_obj)
            if iso2 not in cities_by_country:
                cities_by_country[iso2] = []
            cities_by_country[iso2].append(city_obj)

    print(f"Total cities loaded: {len(all_cities)} across {len(cities_by_country)} countries (ISO2).")

    print("\n--- 3. Computing Nearest Major City for each of the 50,250 cities ---")
    # For each country, find major cities
    for iso2, c_list in cities_by_country.items():
        # Determine major cities in this country
        # Criteria: primary capital OR population >= 1,000,000 OR (for smaller countries, top largest city)
        major_dict = {}
        for c in c_list:
            if c['capital'] == 'primary' or c['population'] >= 1000000:
                major_dict[c['name_ascii']] = c
        
        c_list_sorted = sorted(c_list, key=lambda x: x['population'], reverse=True)
        # If no city met the >=1M or primary capital threshold, pick the top 1 largest city as the primary anchor
        if not major_dict and c_list_sorted:
            major_dict[c_list_sorted[0]['name_ascii']] = c_list_sorted[0]
            
        major_list = list(major_dict.values())

        # Determine the country's single largest city
        largest_city_name = c_list_sorted[0]['name_ascii'] if c_list_sorted else ""

        # Precalculate nearest major city for each city in this country
        for rank, c in enumerate(c_list_sorted):
            is_cap = (c['capital'] == 'primary')
            is_largest = (c['name_ascii'] == largest_city_name)
            
            # Check if this city is ALREADY a major city (e.g. London, Seoul, Tokyo, New York, etc.)
            is_already_major = (
                is_cap or
                is_largest or
                c['name_ascii'] in major_dict or
                c['population'] >= 1000000
            )

            c['is_capital'] = is_cap
            c['is_largest_city'] = is_largest
            c['is_major_city'] = is_already_major
            c['city_rank'] = rank + 1

            if is_already_major:
                # If already a big/major city, DO NOT assign a nearest major city
                c['nearest_major_city'] = None
            else:
                # Find the nearest major anchor in the country
                best_major = None
                min_dist = float('inf')
                for m in major_list:
                    d = haversine(c['lat'], c['lng'], m['lat'], m['lng'])
                    if d < min_dist:
                        min_dist = d
                        best_major = m
                
                if best_major:
                    c['nearest_major_city'] = {
                        "name": best_major['name'],
                        "lat": best_major['lat'],
                        "lng": best_major['lng'],
                        "population": best_major['population'],
                        "distance_km": round(min_dist, 1)
                    }
                else:
                    c['nearest_major_city'] = None

            # Generate dynamic regional soul reviews (선평 1줄, 악평 1줄)
            city_pro = ""
            city_con = ""
            if is_cap and is_largest:
                city_pro = f"국가 수도이자 최대도시로 정치·경제·문화의 모든 인프라와 기회가 완벽히 집결되어 있습니다."
                city_con = f"치열한 생존 경쟁과 살인적인 주거비, 숨 막히는 출퇴근 교통체증을 견뎌야 합니다."
            elif is_cap:
                city_pro = f"국가의 심장부인 수도(Capital)로서 행정·외교의 중심이자 높은 공공 인프라 혜택을 누립니다."
                city_con = f"수도 특유의 높은 생활 물가와 관료적 분위기, 주거 비용 부담이 있습니다."
            elif is_largest:
                city_pro = f"국가 최대의 인구와 경제력을 지닌 제1의 메트로폴리스로 무한한 상업적 기회가 열려있습니다."
                city_con = f"거대한 메가시티다운 복잡한 소음과 치안 격차, 비싼 주거비가 부담됩니다."
            elif c['population'] >= 1000000:
                city_pro = f"인구 100만 이상의 거점 대도시로 풍부한 상권과 탄탄한 도시 인프라를 누립니다."
                city_con = f"수도권 대비 전문 문화 인프라가 다소 부족하고 도심부 교통 혼잡이 있습니다."
            elif c['population'] >= 100000:
                city_pro = f"생활 편의시설과 여유가 균형을 이루는 쾌적한 중견 지역 거점 도시입니다."
                city_con = f"대기업 및 전문 일자리가 제한적이며 대형 문화 행사 접근성이 아쉽습니다."
            else:
                city_pro = f"번잡함 없는 청정한 자연과 평화롭고 고요한 슬로우 라이프가 펼쳐집니다."
                city_con = f"병원과 대형 상업 인프라가 부족하여 주요 대도시까지 장거리 이동이 필요합니다."

            c['pro'] = city_pro
            c['con'] = city_con

    print("Completed nearest major city calculations.")

    print("\n--- 4. Building Country Profiles and Weight Distribution ---")
    # Calculate country total population and link birth data
    country_summary_list = []
    
    # UN Country name aliases to match worldcities
    ALIASES = {
        "United States of America": "United States",
        "Republic of Korea": "Korea, South",
        "Democratic People's Republic of Korea": "Korea, North",
        "Russian Federation": "Russia",
        "Viet Nam": "Vietnam",
        "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
        "Iran (Islamic Republic of)": "Iran",
        "Syrian Arab Republic": "Syria",
        "Lao People's Democratic Republic": "Laos",
        "Bolivia (Plurinational State of)": "Bolivia",
        "Venezuela (Bolivarian Republic of)": "Venezuela",
        "United Republic of Tanzania": "Tanzania",
        "Democratic Republic of the Congo": "Congo (Kinshasa)",
        "Congo": "Congo (Brazzaville)",
        "China, Hong Kong SAR": "Hong Kong",
        "China, Macao SAR": "Macau",
        "Czech Republic": "Czechia",
        "Republic of Moldova": "Moldova",
        "State of Palestine": "West Bank and Gaza",
        "Türkiye": "Turkey"
    }

    # Invert alias mapping
    UN_CLEAN = {}
    for un_c, info in un_country_births.items():
        matched_name = ALIASES.get(un_c, un_c)
        UN_CLEAN[matched_name] = info

    total_world_births = 0
    total_world_population = 0

    for iso2, c_list in cities_by_country.items():
        c_name = c_list[0]['country']
        iso3 = c_list[0]['iso3']
        country_pop = sum(c['population'] for c in c_list)
        
        # Determine birth count
        birth_info = UN_CLEAN.get(c_name)
        births = 0
        source_year = 2025
        
        if birth_info:
            births = birth_info['births']
            source_year = birth_info['year']
        else:
            # Fallback estimation based on global crude birth rate (~17 per 1,000 people or regional multiplier)
            # This ensures countries with unlisted UN CSV rows still have realistic birth counts
            births = max(int(country_pop * 0.018), 100)
            source_year = 2025

        meta = COUNTRY_METADATA.get(c_name, {
            "ko": c_name,
            "tier": "보통",
            "tier_code": "C",
            "continent": "기타",
            "homicide": 3.0,
            "gini": 35.0,
            "gdp_capita": 10000,
            "pro": f"{c_name} 고유의 아름다운 문화와 평화로운 삶이 펼쳐집니다.",
            "con": f"{c_name}의 지역적 과제와 기후 환경에 적응해야 합니다."
        })

        # Calculate bounding box / center
        lats = [c['lat'] for c in c_list]
        lngs = [c['lng'] for c in c_list]
        center_lat = sum(lats) / len(lats)
        center_lng = sum(lngs) / len(lngs)

        country_profile = {
            "country": c_name,
            "country_ko": meta["ko"],
            "iso2": iso2,
            "iso3": iso3,
            "continent": meta["continent"],
            "tier": meta["tier"],
            "tier_code": meta["tier_code"],
            "births": births,
            "source_year": source_year,
            "population": max(country_pop, 5000),
            "homicide": meta["homicide"],
            "gini": meta["gini"],
            "gdp_capita": meta["gdp_capita"],
            "center": [round(center_lat, 4), round(center_lng, 4)],
            "city_count": len(c_list),
            "pro": meta["pro"],
            "con": meta["con"]
        }
        country_summary_list.append(country_profile)
        total_world_births += births
        total_world_population += country_profile['population']

    # Sort countries by births descending
    country_summary_list.sort(key=lambda x: x['births'], reverse=True)

    # Calculate probabilities
    for c in country_summary_list:
        c['birth_share_pct'] = round((c['births'] / total_world_births) * 100, 3)
        c['pop_share_pct'] = round((c['population'] / total_world_population) * 100, 3)

    print(f"Total World Births (Annual): {total_world_births:,}")
    print(f"Total World Population in dataset: {total_world_population:,}")

    # Output directory
    os.makedirs('public/data', exist_ok=True)
    os.makedirs('public/data/cities', exist_ok=True)

    # Write countries.json with clean formatting for Notepad editing
    countries_output = {
        "metadata": {
            "title": "전 세계 국가별 환생 확률 및 출생아 데이터",
            "description": "메모장으로 쉽게 수정할 수 있습니다. births(출생아 수), population(인구), pro(선평), con(악평), tier(난이도 등급) 등을 직접 변경할 수 있습니다.",
            "total_world_births": total_world_births,
            "total_world_population": total_world_population,
            "updated_at": "2026-08-23"
        },
        "countries": country_summary_list
    }

    with open('public/data/countries.json', 'w', encoding='utf-8') as f:
        json.dump(countries_output, f, ensure_ascii=False, indent=2)

    print("Saved public/data/countries.json.")

    # Write cities per country in public/data/cities/[iso2].json
    for iso2, c_list in cities_by_country.items():
        with open(f'public/data/cities/{iso2}.json', 'w', encoding='utf-8') as f:
            json.dump({
                "country": c_list[0]['country'],
                "iso2": iso2,
                "city_count": len(c_list),
                "cities": c_list
            }, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(cities_by_country)} country city files into public/data/cities/")

if __name__ == '__main__':
    main()



DataForSEO API를 활용하여 특정 주제에 대한 사용자 검색어를 알아보는 방법을 알려드립니다. DataForSEO는 키워드 리서치, 경쟁사 분석 등 다양한 SEO 관련 데이터를 제공하는 강력한 API입니다.

### 1. 어떤 DataForSEO API를 사용해야 할까요?

원하는 주제와 관련된 검색어를 조회하기 위해서는 **DataForSEO Labs API**를 사용하는 것이 가장 적합합니다. 이 API는 키워드 리서치, 시장 분석, 경쟁사 인텔리전스를 위해 설계되었습니다. DataForSEO Labs API 내에서도 다음과 같은 엔드포인트(Endpoint)를 활용할 수 있습니다.

*   **Keyword Suggestions:** 특정 핵심 키워드를 포함하는 검색어 목록을 제공합니다. 예를 들어 '키워드 리서치'를 입력하면 '구글 키워드 리서치', '키워드 리서치 방법' 등 연관된 롱테일 키워드를 얻을 수 있습니다.
*   **Keyword Ideas:** 지정된 키워드의 제품 또는 서비스 카테고리와 관련된 검색어를 제공합니다. 이를 통해 더 폭넓은 아이디어를 얻을 수 있습니다.

이 가이드에서는 더 직접적으로 연관된 검색어를 찾아주는 **Keyword Suggestions**를 중심으로 설명합니다.

### 2. DataForSEO API 사용 방법 (Python 예제)

Python을 사용하여 DataForSEO API를 호출하고 검색어 데이터를 가져오는 단계는 다음과 같습니다.

#### 1단계: DataForSEO Python 클라이언트 설치

먼저, DataForSEO에서 공식적으로 제공하는 Python 클라이언트를 설치해야 합니다. 터미널 또는 명령 프롬프트에 다음 명령어를 입력하여 설치합니다.

```bash
pip install dataforseo-client
```

#### 2단계: API 인증 정보 확인

DataForSEO 웹사이트에 가입하고 로그인한 후, 'API Access' 대시보드에서 본인의 API 로그인(login)과 비밀번호(password)를 확인해야 합니다.

#### 3단계: Python 코드로 검색어 조회하기

아래는 특정 주제어(seed keyword)에 대한 검색어를 조회하는 Python 코드 예제입니다.

```python
from dataforseo_client import RestClient

def get_keyword_suggestions(login, password, keyword):
    """
    DataForSEO Labs API의 Keyword Suggestions 엔드포인트를 사용하여
    특정 키워드에 대한 연관 검색어를 조회합니다.
    """
    client = RestClient(login, password)
    post_data = dict()
    # 한 번의 요청으로 여러 키워드를 조회할 수 있습니다.
    post_data[len(post_data)] = dict(
        keyword=keyword,
        language_name="Korean",  # 언어 설정 (예: English, Korean)
        location_code=2410      # 지역 코드 (예: 2840 for United States, 2410 for South Korea)
    )

    try:
        response = client.post("/v3/dataforseo_labs/google/keyword_suggestions/live", post_data)
        # 응답 상태 코드가 20000 (성공)인 경우 결과 반환
        if response["status_code"] == 20000:
            return response
        else:
            print("API 호출 오류가 발생했습니다: %s" % response["status_message"])
            return None
    except Exception as e:
        print("예외가 발생했습니다: %s" % e)
        return None

if __name__ == '__main__':
    # 본인의 DataForSEO API 로그인 및 비밀번호를 입력하세요.
    api_login = "YOUR_LOGIN"
    api_password = "YOUR_PASSWORD"
    
    # 조회하고 싶은 주제어를 입력하세요.
    topic_keyword = "인공지능"

    suggestions_data = get_keyword_suggestions(api_login, api_password, topic_keyword)

    if suggestions_data and suggestions_data['tasks_count'] > 0:
        results = suggestions_data['tasks'][0]['result']
        if results:
            print(f"'{topic_keyword}'에 대한 연관 검색어 (상위 10개):")
            for item in results[:10]:
                print(f"- {item['keyword']} (월간 검색량: {item['keyword_info']['search_volume']})")
        else:
            print("조회된 연관 검색어가 없습니다.")

```

**코드 설명:**

1.  `dataforseo_client` 라이브러리에서 `RestClient`를 가져옵니다.
2.  `get_keyword_suggestions` 함수는 API 로그인, 비밀번호, 그리고 조회할 키워드를 인자로 받습니다.
3.  `RestClient` 객체를 생성하고, `post` 메소드를 사용하여 `/v3/dataforseo_labs/google/keyword_suggestions/live` 엔드포인트에 요청을 보냅니다.
4.  `post_data`에는 조회할 키워드, 언어, 지역 코드를 설정합니다. 언어와 지역은 필요에 맞게 변경할 수 있습니다.
5.  API 호출이 성공하면(status_code: 20000), 반환된 JSON 데이터에서 검색어와 월간 검색량 등의 정보를 추출하여 출력합니다.

### 3. 결과 해석

위 코드를 실행하면 다음과 같이 원하는 주제에 대한 사람들의 검색어와 월간 평균 검색량 정보를 얻을 수 있습니다.

```
'인공지능'에 대한 연관 검색어 (상위 10개):
- 인공지능 관련주 (월간 검색량: 33100)
- 인공지능 그림 (월간 검색량: 22200)
- 인공지능 윤리 (월간 검색량: 14800)
...
```

이 외에도 API 응답에는 CPC(클릭당 비용), 경쟁 수준 등 다양한 데이터가 포함되어 있어 SEO 및 마케팅 전략 수립에 유용하게 활용할 수 있습니다.

더 넓은 범위의 아이디어를 얻고 싶다면 `keyword_suggestions` 대신 `keyword_ideas` 엔드포인트를 사용해 볼 수도 있습니다.

이 코드는 두 부분으로 나뉩니다.
1.  **API Route 코드**: Next.js의 백엔드 역할을 하며, 클라이언트의 요청을 받아 안전하게 DataForSEO API를 호출합니다.
2.  **UI 컴포넌트 코드**: 사용자가 키워드를 입력하고 결과를 볼 수 있는 프론트엔드 UI입니다.

---

### **1. API 인증 정보 설정**

프로젝트의 루트 디렉터리에 `.env.local` 파일을 생성하고 아래 내용을 추가하세요. API 키가 코드에 직접 노출되는 것을 막기 위함입니다.

```
# .env.local

DATAFORSEO_LOGIN=YOUR_DATAFORSEO_LOGIN
DATAFORSEO_PASSWORD=YOUR_DATAFORSEO_PASSWORD
```

---

### **2. 백엔드: API Route 코드**

Next.js의 API 라우트 파일에 아래 코드를 붙여넣으세요. 이 코드는 클라이언트로부터 키워드를 받아 DataForSEO API에 데이터를 요청합니다.

```javascript
// 파일 경로 예시: /pages/api/search.js

export default async function handler(req, res) {
  // 서버 측에서는 POST 요청만 처리하도록 제한합니다.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 클라이언트가 보낸 요청 본문에서 키워드를 추출합니다.
  const { keyword } = req.body;

  // 키워드가 없는 경우 에러를 반환합니다.
  if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
    return res.status(400).json({ message: 'A valid keyword is required.' });
  }

  // .env.local 파일에 저장된 민감한 인증 정보를 안전하게 불러옵니다.
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  // Basic 인증 헤더를 생성합니다.
  const headers = new Headers();
  headers.append('Authorization', 'Basic ' + Buffer.from(login + ':' + password).toString('base64'));
  headers.append('Content-Type', 'application/json');

  // DataForSEO API에 보낼 요청 데이터를 구성합니다.
  const postData = [{
    keyword: keyword,
    language_name: "Korean",    // 필요에 따라 언어 변경 (예: "English")
    location_code: 2410,        // 대한민국 국가 코드 (미국은 2840)
    limit: 15                   // 받아올 추천 검색어 개수
  }];

  try {
    // DataForSEO API 엔드포인트에 POST 요청을 보냅니다.
    const apiResponse = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postData)
    });

    const data = await apiResponse.json();

    // DataForSEO API로부터 받은 응답이 정상이 아닐 경우 에러를 처리합니다.
    if (!apiResponse.ok || data.status_code !== 20000) {
      console.error('DataForSEO API Error:', data.status_message);
      return res.status(apiResponse.status).json({ message: data.status_message || 'Failed to fetch data from DataForSEO.' });
    }

    // 성공적인 결과를 클라이언트에 전달합니다.
    res.status(200).json(data);

  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}
```

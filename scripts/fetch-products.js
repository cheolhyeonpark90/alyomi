// scripts/fetch-products.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const fetch = require('node-fetch');

// API 기본 정보
const API_GATEWAY_URL = 'https://api-sg.aliexpress.com/sync';
const APP_KEY = process.env.ALIEXPRESS_APP_KEY;
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET;
const TRACKING_ID = 'default';

// 💡 검색 키워드, 페이지 수, 딜레이 설정
const SEARCH_KEYWORDS = [
    "산리오", "헬로키티", "마이멜로디", "쿠로미", "폼폼푸린", "포차코", "리틀트윈스타", "한교동", "케로피", "농담곰",
    "마이 스위트 피아노", "우사하나", "구데타마", "하나마루오바케", "디즈니", "치이카와", "하치와레", "우사기", "도라에몽",
    "포켓몬", "토토로", "리락쿠마", "카카오프렌즈", "춘식이", "라인프렌즈", "잔망루피", "미피", "무민", "스누피", "짱구",
    "윌레스와 그로밋", "캐릭터"
];
const PAGES_PER_QUERY = 1; // 각 키워드당 1페이지씩만 수집
const API_DELAY_MS = 3500; // API 호출 간 딜레이 (3.5초)

const SEARCH_CATEGORIES = [
    "완구 및 취미",
    "전화 및 통신 액세서리",
    "홈 & 가든",
    "주얼리 및 액세서리",
    "사무실 및 학교 용품",
    "여성 의류",
    "컴퓨터 및 오피스",
    "가방 및 캐리어",
    "뷰티 & 헬스",
    "남성 의류",
    "스포츠 & 엔터테인먼트",
    "소비자 가전"
];

/**
 * 딜레이를 주는 함수
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * AliExpress API 요청을 위한 서명(sign)을 생성하는 함수
 */
function generateSign(params, appSecret) {
    const sortedKeys = Object.keys(params).sort();
    const canonicalString = sortedKeys.map(key => `${key}${params[key]}`).join('');
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(canonicalString);
    return hmac.digest('hex').toUpperCase();
}

/**
 * 단일 페이지 상품 데이터를 가져오는 함수
 */
async function fetchProductPage(baseParams, pageNo) {
    let params = {
        ...baseParams,
        page_no: pageNo.toString(),
        timestamp: Date.now(),
    };
    params.sign = generateSign(params, APP_SECRET);

    try {
        const response = await fetch(API_GATEWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
            body: new URLSearchParams(params).toString()
        });
        const data = await response.json();

        if (data.error_response) {
            console.error(`❌ API Error for keyword "${baseParams.keywords}":`, data.error_response.msg);
            return [];
        }

        const result = data.aliexpress_affiliate_product_query_response?.resp_result?.result;
        return result?.products?.product || [];

    } catch (error) {
        console.error(`❌ Network error for keyword "${baseParams.keywords}":`, error);
        return [];
    }
}

/**
 * 메인 실행 함수
 */
async function main() {
    console.log('🚀 Starting Alyomi product data fetch...');
    const allProducts = new Map(); // 중복 제거 및 키워드 축적을 위해 Map 사용

    for (const keyword of SEARCH_KEYWORDS) {
        let baseParams = {
            app_key: APP_KEY,
            sign_method: 'sha256',
            method: 'aliexpress.affiliate.product.query',
            tracking_id: TRACKING_ID,
            sort: 'LAST_VOLUME_DESC',
            target_currency: 'KRW',
            target_language: 'KO',
            ship_to_country: 'KR',
            page_size: '50',
            keywords: keyword,
            delivery_days: 5
        };

        console.log(`\n🔎 Fetching for keyword: "${keyword}"...`);

        for (let page = 1; page <= PAGES_PER_QUERY; page++) {
            const products = await fetchProductPage(baseParams, page);

            if (products.length === 0) {
                console.log(`- No products found for this keyword.`);
                break;
            }

            // 💡 중복 확인 및 keywords 필드 추가/업데이트
            products.forEach(product => {
                // 평가 점수가 93 미만이면 무시
                if (Number(product.evaluate_rate) < 93) return;

                // 카테고리가 허용 목록에 없으면 무시
                if (!SEARCH_CATEGORIES.includes(product.first_level_category_name)) return;

                if (allProducts.has(product.product_id)) {
                    // 이미 수집된 상품이면 keywords 배열에 현재 키워드만 추가
                    const existingProduct = allProducts.get(product.product_id);
                    existingProduct.keywords.push(keyword);
                } else {
                    // 처음 수집되는 상품이면 keywords 필드를 생성하고 상품 정보 저장
                    product.keywords = [keyword];
                    allProducts.set(product.product_id, product);
                }
            });

            console.log(`- Fetched ${products.length} items. Total unique items: ${allProducts.size}`);

            // 마지막 키워드가 아니면 딜레이 적용
            if (SEARCH_KEYWORDS.indexOf(keyword) < SEARCH_KEYWORDS.length - 1) {
                await delay(API_DELAY_MS);
            }
        }
    }

    if (allProducts.size > 0) {
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const outputPath = path.join(dataDir, 'products.json');
        const finalProducts = Array.from(allProducts.values());

        fs.writeFileSync(outputPath, JSON.stringify(finalProducts, null, 2));
        console.log(`\n✅ Success! Saved ${finalProducts.length} unique items to ${outputPath}`);
    } else {
        console.log('\n🤷 No products were saved.');
    }
}

main();
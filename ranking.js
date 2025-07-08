/**
 * 문자열에서 숫자만 추출하여 반환하는 헬퍼 함수
 * @param {string | number} str
 * @returns {number}
 */
const parseNumber = (str) => {
    if (typeof str === 'number') return str;
    if (typeof str === 'string') {
        return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    }
    return 0;
};

/**
 * '성과 점수'(판매량+평점)만으로 상품 목록을 정렬하는 함수
 * @param {Array<object>} products - 정렬할 상품 배열
 * @returns {Array<object>} - 정렬된 상품 배열
 */
export function sortProductsByRank(products) {
    if (!products || products.length === 0) {
        return [];
    }
    
    products.forEach(p => {
        const performanceScore = Math.log(parseNumber(p.lastest_volume) + 1) + (parseNumber(p.evaluate_rate) / 100);
        p.finalScore = performanceScore;
    });

    return [...products].sort((a, b) => b.finalScore - a.finalScore);
}
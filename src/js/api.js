/**
 * products.json 데이터를 가져오는 함수
 * @returns {Promise<Array>} 상품 데이터 배열
 */
export async function getProducts() {
    try {
      // data 폴더는 루트에 있으므로 /data/ 경로 사용
      const response = await fetch('/data/products.json'); 
      if (!response.ok) throw new Error('Network response was not ok.');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  }
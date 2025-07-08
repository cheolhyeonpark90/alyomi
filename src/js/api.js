// src/js/api.js

/**
 * products.json 데이터를 가져오는 함수
 * @returns {Promise<Array>} 상품 데이터 배열
 */
export async function getProducts() {
    try {
      // 수정: /data/products.json -> data/products.json
      const response = await fetch('data/products.json'); 
      if (!response.ok) throw new Error('Network response was not ok.');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  }
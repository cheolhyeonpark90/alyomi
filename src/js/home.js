import { getProducts } from './api.js';
import { createProductCard } from './ui.js';
import { sortProductsByRank } from './ranking.js'; // ✅ 정렬 모듈 import

// DOM이 준비되면 스크립트 실행
document.addEventListener('DOMContentLoaded', () => {
  
  const hamburgerButton = document.getElementById('hamburger-button');
  const mobileNav = document.getElementById('mobile-nav');
  hamburgerButton.addEventListener('click', () => {
    mobileNav.classList.toggle('hidden');
  });
  
  const renderProducts = async () => {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '<p class="col-span-full text-center">귀요미들을 불러오는 중...</p>';
    
    // 1. 데이터 가져오기
    const products = await getProducts();

    if (!products || products.length === 0) {
      productGrid.innerHTML = '<p class="col-span-full text-center">상품을 불러오는 데 실패했어요. 😢</p>';
      return;
    }

    // ✅ 2. 가져온 데이터를 랭킹 알고리즘으로 정렬하기
    const sortedProducts = sortProductsByRank(products);

    // 3. 정렬된 상품 중 상위 50개만 선택
    const top50Products = sortedProducts.slice(0, 50);

    // 4. 화면에 렌더링
    productGrid.innerHTML = top50Products.map(createProductCard).join('');
  };

  renderProducts();
});
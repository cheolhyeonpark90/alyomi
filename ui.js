const PRODUCTS_PER_PAGE = 50;

/**
 * 상품 카드 HTML을 생성하는 함수
 * @param {object} product - 개별 상품 객체
 * @returns {string} HTML 문자열
 */
export function createProductCard(product) {
  const displayPrice = product.target_sale_price || product.sale_price;
  const originalPrice = product.target_original_price || product.original_price;
  
  const discountValue = parseInt(product.discount, 10);
  const hasDiscount = !isNaN(discountValue) && discountValue > 0;

  let ratingHtml = '';
  const ratingPercent = parseFloat(product.evaluate_rate);

  if (!isNaN(ratingPercent) && ratingPercent > 0) {
    const ratingOnFive = (ratingPercent / 100) * 5;
    const formattedRating = ratingOnFive.toFixed(1);

    ratingHtml = `
      <div class="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-100 mt-auto">
        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        <span class="ml-1 font-bold text-gray-700">${formattedRating}</span>
        <span class="mx-1.5 text-gray-300">|</span>
        <span class="truncate">${product.lastest_volume}개 판매</span>
      </div>
    `;
  }

  return `
    <div class="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col" onclick="window.location.hash='product=${product.product_id}'">
      <div class="aspect-square bg-gray-50 overflow-hidden">
        <img 
          src="${product.product_main_image_url}" 
          alt="${product.product_title}" 
          loading="lazy" 
          referrerpolicy="no-referrer"  
          class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        >
      </div>
      <div class="p-4 flex flex-col flex-grow">
        <h3 class="font-bold text-sm text-gray-800 line-clamp-2">${product.product_title}</h3>
        <div class="mt-2 mb-3">
          ${hasDiscount ? `
            <div class="flex items-baseline justify-between">
              <div>
                <span class="text-xs text-gray-400 line-through">${originalPrice}원</span>
                <span class="font-extrabold text-base text-red-600 ml-1">${displayPrice}원</span>
              </div>
              <span class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">${discountValue}%</span>
            </div>
          ` : `
            <p class="font-extrabold text-base text-gray-900">${displayPrice}원</p>
          `}
        </div>
        ${ratingHtml}
      </div>
    </div>
  `;
}

/**
 * 카테고리 필터 UI를 렌더링하는 함수
 * @param {Array<object>} products - 전체 상품 배열
 * @param {string|null} currentCategory - 현재 선택된 카테고리
 */
export function renderCategories(products, currentCategory) {
    const filterContainer = document.getElementById('category-filter');
    filterContainer.className = 'flex items-center gap-3 overflow-x-auto whitespace-nowrap no-scrollbar pb-4 mb-6';

    const categories = ['전체', ...new Set(products.map(p => p.first_level_category_name).filter(Boolean))];
    
    filterContainer.innerHTML = categories.map(cat => {
        const isActive = (!currentCategory && cat === '전체') || currentCategory === cat;
        const activeClass = isActive 
            ? 'bg-alyomi-pink text-white border-alyomi-pink' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300';
        
        return `<button data-category="${cat}" class="category-btn px-4 py-2 text-sm font-semibold rounded-full border transition-colors flex-shrink-0 ${activeClass}">${cat}</button>`;
    }).join('');

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = btn.dataset.category === '전체' ? null : btn.dataset.category;
            e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            window.location.hash = category ? `category=${category}` : 'all';
        });
    });
}

/**
 * 특정 페이지의 상품 목록을 렌더링하는 함수
 * @param {Array<object>} products - 표시할 상품 배열
 * @param {number} page - 현재 페이지 번호
 */
export function renderProductPage(products, page) {
    const grid = document.getElementById('product-grid-collection');
    const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const pageProducts = products.slice(startIndex, endIndex);

    grid.innerHTML = pageProducts.length === 0 
        ? `<p class="col-span-full text-center">표시할 상품이 없습니다.</p>`
        : pageProducts.map(createProductCard).join('');
}

/**
 * 페이지네이션 UI를 렌더링하는 함수
 * @param {number} totalProducts - 필터링된 전체 상품 수
 * @param {number} currentPage - 현재 페이지 번호
 * @param {object} filterInfo - 현재 필터 정보 (라우팅용)
 */
export function renderPagination(totalProducts, currentPage, filterInfo) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.className = 'flex justify-center items-center gap-4 mt-16 text-sm';
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  if (totalPages <= 1) return;

  const pageNumbers = (() => {
    const pageNumbers = new Set();
    pageNumbers.add(1);
    pageNumbers.add(totalPages);
    for (let i = -1; i <= 1; i++) {
      if (currentPage + i > 0 && currentPage + i <= totalPages) {
        pageNumbers.add(currentPage + i);
      }
    }
    const sortedPages = Array.from(pageNumbers).sort((a, b) => a - b);
    const finalPages = [];
    let lastPage = 0;

    for (const page of sortedPages) {
      if (lastPage !== 0 && page > lastPage + 1) {
        finalPages.push('...');
      }
      finalPages.push(page);
      lastPage = page;
    }
    return finalPages;
  })();

  const createUrl = (page) => {
    const filterType = filterInfo.type;
    const filterValue = filterInfo.value;
    if (filterType === 'category') {
        return filterValue ? `#category=${encodeURIComponent(filterValue)}&page=${page}` : `#all&page=${page}`;
    }
    if (filterType === 'special') {
        return `#${filterValue}&page=${page}`;
    }
     if (filterType === 'search') {
        return `#search=${encodeURIComponent(filterValue)}&page=${page}`;
    }
    return `#page=${page}`;
  };

  const baseLinkClass = "pagination-link flex items-center justify-center w-8 h-8 rounded-full font-semibold transition-colors";
  
  if (currentPage > 1) {
    paginationContainer.innerHTML += `<a href="${createUrl(currentPage - 1)}" class="${baseLinkClass} text-gray-500 hover:text-alyomi-pink"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg></a>`;
  }

  pageNumbers.forEach(num => {
    if (num === '...') {
      paginationContainer.innerHTML += `<span class="flex items-center justify-center w-8 h-8 font-semibold text-gray-400">...</span>`;
    } else {
      const isActive = num === currentPage;
      const finalClass = isActive
        ? `${baseLinkClass} text-alyomi-pink font-extrabold cursor-default`
        : `${baseLinkClass} text-gray-500 hover:bg-pink-50`;

      paginationContainer.innerHTML += `<a href="${createUrl(num)}" class="${finalClass}">${num}</a>`;
    }
  });

  if (currentPage < totalPages) {
    paginationContainer.innerHTML += `<a href="${createUrl(currentPage + 1)}" class="${baseLinkClass} text-gray-500 hover:text-alyomi-pink"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" /></svg></a>`;
  }
}
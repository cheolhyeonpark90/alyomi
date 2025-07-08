/**
 * 상품 카드 HTML을 생성하는 함수 (디자인 개선 최종 버전)
 * @param {object} product - 개별 상품 객체
 * @returns {string} HTML 문자열
 */
export function createProductCard(product) {
    const productLink = product.promotion_link || product.product_detail_url;
    
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
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <span class="ml-1 font-bold text-gray-700">${formattedRating}</span>
          <span class="mx-1.5 text-gray-300">|</span>
          <span class="truncate">${product.lastest_volume}개 판매</span>
        </div>
      `;
    }
  
    return `
      <div class="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col" onclick="window.open('${productLink}', '_blank')">
        
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
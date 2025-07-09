import { getProducts } from './api.js';
import { sortProductsByRank } from './ranking.js';
import { createProductCard, renderCategories, renderProductPage, renderPagination } from './ui.js';

let allProducts = [];
const homeView = document.getElementById('home-view');
const collectionView = document.getElementById('collection-view');
const infoView = document.getElementById('info-view');
const faqView = document.getElementById('faq-view');
const detailView = document.getElementById('detail-view');

function hideAllViews() {
    homeView.classList.add('hidden');
    collectionView.classList.add('hidden');
    infoView.classList.add('hidden');
    faqView.classList.add('hidden');
    detailView.classList.add('hidden');
}

function renderHomeView() {
    hideAllViews();
    homeView.classList.remove('hidden');

    const productGrid = document.getElementById('product-grid-home');
    if (productGrid.innerHTML.includes('귀요미들을 불러오는 중...') || productGrid.innerHTML.includes('')) {
        const sortedProducts = sortProductsByRank(allProducts);
        const top50Products = sortedProducts.slice(0, 50);
        productGrid.innerHTML = top50Products.map(createProductCard).join('');
    }
}

function renderCollectionView(category, page = 1) {
    hideAllViews();
    collectionView.classList.remove('hidden');
    document.getElementById('category-filter').classList.remove('hidden');
    
    renderCategories(allProducts, category);
    
    const filtered = category ? allProducts.filter(p => p.first_level_category_name === category) : allProducts;
    const sorted = sortProductsByRank(filtered);
    
    document.getElementById('collection-title').textContent = `✨ ${category || '전체 상품'}`;
    renderProductPage(sorted, page);
    renderPagination(sorted.length, page, { type: 'category', value: category });
}

function renderSpecialView(products, title, page = 1, filterInfo) {
    hideAllViews();
    collectionView.classList.remove('hidden');
    document.getElementById('category-filter').classList.add('hidden');

    const sorted = sortProductsByRank(products);
    document.getElementById('collection-title').textContent = `✨ ${title}`;
    renderProductPage(sorted, page);
    renderPagination(sorted.length, page, filterInfo);
}

function renderInfoView() {
    hideAllViews();
    infoView.classList.remove('hidden');
}

function renderFaqView() {
    hideAllViews();
    faqView.classList.remove('hidden');
}

function renderDetailView(productId) {
    hideAllViews();
    detailView.classList.remove('hidden');

    const product = allProducts.find(p => String(p.product_id) === String(productId));

    if (!product) {
        detailView.innerHTML = `<p class="text-center py-20">상품 정보를 찾을 수 없습니다. <a href="/" class="text-alyomi-pink font-bold">홈으로 돌아가기</a></p>`;
        return;
    }

    const hasDiscount = !isNaN(parseInt(product.discount, 10)) && parseInt(product.discount, 10) > 0;
    const smallImages = product.product_small_image_urls?.string || [];
    
    // ✅ 1. 관련 상품 추천 로직
    const relatedProducts = allProducts
        .filter(p => p.first_level_category_name === product.first_level_category_name && p.product_id !== product.product_id)
        .slice(0, 10); // 최대 10개

    // 상세 페이지의 새로운 HTML 구조
    detailView.innerHTML = `
        <section class="py-12">
            <div class="max-w-6xl mx-auto px-4">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    <div class="lg:sticky top-24 self-start">
                        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                            <img id="main-product-image" src="${product.product_main_image_url}" alt="${product.product_title}" referrerpolicy="no-referrer" class="w-full h-full object-cover">
                        </div>
                        ${smallImages.length > 0 ? `
                            <div class="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
                                ${smallImages.map(imgUrl => `
                                    <div class="aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-alyomi-pink transition">
                                        <img src="${imgUrl}" alt="Thumbnail image" referrerpolicy="no-referrer" class="w-full h-full object-cover product-thumbnail">
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <div class="mt-6 lg:mt-0">
                        <h1 class="text-3xl md:text-4xl font-extrabold leading-snug">${product.product_title}</h1>
                        
                        <div class="flex items-center text-base text-gray-500 my-4 pb-4 border-b">
                            <span>⭐ ${ (parseFloat(product.evaluate_rate) / 100 * 5).toFixed(1) }</span>
                            <span class="mx-3 text-gray-300">|</span>
                            <span>${product.lastest_volume}개 판매</span>
                        </div>

                        <div class="bg-gray-50 p-6 rounded-lg my-6">
                            ${hasDiscount ? `
                                <div>
                                    <span class="text-lg text-gray-500 line-through">${product.target_original_price || product.original_price}원</span>
                                    <div class="flex items-baseline gap-3 mt-1">
                                      <span class="text-4xl font-bold text-red-600">${product.target_sale_price || product.sale_price}원</span>
                                      <span class="text-2xl font-bold text-red-600 bg-red-100 px-3 py-1 rounded-md">${product.discount}</span>
                                    </div>
                                </div>
                            ` : `
                                <p class="text-4xl font-bold text-gray-900">${product.target_sale_price || product.sale_price}원</p>
                            `}
                        </div>

                        <div class="text-sm space-y-4 my-8 p-4 border rounded-lg">
                            <dl class="flex">
                                <dt class="w-24 font-semibold text-gray-500 flex-shrink-0">카테고리</dt>
                                <dd class="text-gray-800">${product.first_level_category_name}</dd>
                            </dl>
                            <dl class="flex">
                                <dt class="w-24 font-semibold text-gray-500 flex-shrink-0">예상 배송</dt>
                                <dd class="text-gray-800">${String(product.ship_to_days).replace(' days', '일 이내 배송 예정')}</dd>
                            </dl>
                             <dl class="flex">
                                <dt class="w-24 font-semibold text-gray-500 flex-shrink-0">판매자</dt>
                                <dd><a href="${product.shop_url}" target="_blank" class="text-blue-600 hover:underline">${product.shop_name}</a></dd>
                            </dl>
                        </div>

                        ${product.keywords && product.keywords.length > 0 ? `
                        <div class="my-8">
                            <h4 class="font-bold mb-3">관련 키워드</h4>
                            <div class="flex flex-wrap gap-2">
                                ${product.keywords.map(keyword => `
                                    <a href="#search=${encodeURIComponent(keyword)}" class="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">${keyword}</a>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}

                        <a href="${product.promotion_link}" target="_blank" class="w-full bg-alyomi-pink text-white text-lg font-bold py-4 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg shadow-pink-200">
                            알리에서 구매하러 가기 🛍️
                        </a>
                        <div class="mt-6 text-xs text-gray-500 text-center">
                            <p>위 버튼을 통해 구매 시, 알요미는 파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있습니다.</p>
                        </div>
                    </div>
                </div>

                ${relatedProducts.length > 0 ? `
                    <div class="mt-24">
                        <h3 class="text-2xl font-bold mb-6">이런 상품은 어때요?</h3>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                            ${relatedProducts.map(createProductCard).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </section>
    `;

    // 썸네일 이미지 클릭 이벤트 설정
    const mainImage = document.getElementById('main-product-image');
    if(mainImage) {
        document.querySelectorAll('.product-thumbnail').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                mainImage.src = e.target.src;
                document.querySelectorAll('.product-thumbnail').forEach(el => el.parentElement.classList.remove('border-alyomi-pink'));
                e.target.parentElement.classList.add('border-alyomi-pink');
            });
        });
        const firstThumbnail = document.querySelector('.product-thumbnail');
        if (firstThumbnail) {
            firstThumbnail.parentElement.classList.add('border-alyomi-pink');
        }
    }
}

const handleRouteChange = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const productId = params.get('product');
    const category = params.get('category');
    const page = parseInt(params.get('page') || '1', 10);
    const searchQuery = params.get('search');
    
    if (productId) {
        renderDetailView(productId);
    } else if (searchQuery) {
        const query = decodeURIComponent(searchQuery).toLowerCase();
        const results = allProducts.filter(p => 
            (p.product_title?.toLowerCase() || '').includes(query) ||
            (p.first_level_category_name?.toLowerCase() || '').includes(query) ||
            (p.keywords || []).join(' ').toLowerCase().includes(query)
        );
        renderSpecialView(results, `'${query}' 검색 결과`, page, { type: 'search', value: query });
    } else if (hash.startsWith('category=')) {
        renderCollectionView(category, page);
    } else if (hash.startsWith('all')) {
        renderCollectionView(null, page);
    } else if (hash.startsWith('under1000')) {
        const filtered = allProducts.filter(p => parseInt(String(p.target_sale_price).replace(/,/g, ''), 10) <= 1000);
        renderSpecialView(filtered, '🪙 천원의 행복', page, { type: 'special', value: 'under1000' });
    } else if (hash.startsWith('hotdeal')) {
        const sortedByDiscount = [...allProducts].sort((a, b) => (parseInt(String(b.discount).replace('%','')) || 0) - (parseInt(String(a.discount).replace('%','')) || 0));
        const top50HotDeal = sortedByDiscount.slice(0, 50);
        renderSpecialView(top50HotDeal, '🔥 핫딜', page, { type: 'special', value: 'hotdeal' });
    } else if (hash.startsWith('guide')) {
        renderInfoView();
    } else if (hash.startsWith('faq')) {
        renderFaqView();
    } else {
        renderHomeView();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

export async function initializeRouter() {
    allProducts = await getProducts();
    if (!allProducts || allProducts.length === 0) {
        document.getElementById('product-grid-home').innerHTML = '<p class="col-span-full text-center">상품 데이터 로딩에 실패했어요. 😢</p>';
        return;
    }
    
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange(); 
}
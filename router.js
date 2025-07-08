import { getProducts } from './api.js';
import { sortProductsByRank } from './ranking.js';
import { createProductCard, renderCategories, renderProductPage, renderPagination } from './ui.js';

let allProducts = [];
const homeView = document.getElementById('home-view');
const collectionView = document.getElementById('collection-view');
const infoView = document.getElementById('info-view');
const faqView = document.getElementById('faq-view');

function hideAllViews() {
    homeView.classList.add('hidden');
    collectionView.classList.add('hidden');
    infoView.classList.add('hidden');
    faqView.classList.add('hidden');
}

function renderHomeView() {
    hideAllViews();
    homeView.classList.remove('hidden');

    const productGrid = document.getElementById('product-grid-home');
    if (productGrid.innerHTML === '') {
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

const handleRouteChange = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const category = params.get('category');
    const page = parseInt(params.get('page') || '1', 10);
    const searchQuery = params.get('search');
    
    if (searchQuery) {
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
    renderHomeView();
}
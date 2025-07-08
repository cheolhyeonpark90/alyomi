import { getProducts } from './api.js';
import { createProductCard } from './ui.js';
import { sortProductsByRank } from './ranking.js';

document.addEventListener('DOMContentLoaded', () => {
  
  const hamburgerButton = document.getElementById('hamburger-button');
  const mobileMenuModal = document.getElementById('mobile-menu-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalPanel = document.getElementById('modal-panel');
  const closeModalButton = document.getElementById('close-modal-button');

  const openMenu = () => {
    mobileMenuModal.classList.remove('hidden');
    setTimeout(() => {
      modalOverlay.classList.add('opacity-100');
      // ✅ Y축(세로) -> X축(가로) 애니메이션으로 변경
      modalPanel.classList.remove('translate-x-full');
    }, 10);
  };

  const closeMenu = () => {
    modalOverlay.classList.remove('opacity-100');
    // ✅ Y축(세로) -> X축(가로) 애니메이션으로 변경
    modalPanel.classList.add('translate-x-full');
    setTimeout(() => {
      mobileMenuModal.classList.add('hidden');
    }, 300);
  };

  hamburgerButton.addEventListener('click', openMenu);
  modalOverlay.addEventListener('click', closeMenu);
  closeModalButton.addEventListener('click', closeMenu);
  
  const searchIconButton = document.getElementById('search-icon-button');
  const searchBar = document.getElementById('search-bar');

  searchIconButton.addEventListener('click', () => {
      searchBar.classList.toggle('hidden');
      if (!searchBar.classList.contains('hidden')) {
          searchBar.querySelector('input').focus();
      }
  });

  const renderProducts = async () => {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = '<p class="col-span-full text-center">귀요미들을 불러오는 중...</p>';
    
    const products = await getProducts();

    if (!products || products.length === 0) {
      productGrid.innerHTML = '<p class="col-span-full text-center">상품을 불러오는 데 실패했어요. 😢</p>';
      return;
    }

    const sortedProducts = sortProductsByRank(products);
    const top50Products = sortedProducts.slice(0, 50);

    productGrid.innerHTML = top50Products.map(createProductCard).join('');
  };

  renderProducts();
});
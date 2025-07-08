import { initializeRouter } from './router.js';

async function main() {
    // 햄버거 메뉴 관련 DOM 요소 및 이벤트 리스너
    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenuModal = document.getElementById('mobile-menu-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalPanel = document.getElementById('modal-panel');
    const closeModalButton = document.getElementById('close-modal-button');

    const openMenu = () => {
        mobileMenuModal.classList.remove('hidden');
        setTimeout(() => {
            modalOverlay.classList.add('opacity-100');
            modalPanel.classList.remove('translate-x-full');
        }, 10);
    };

    const closeMenu = () => {
        modalOverlay.classList.remove('opacity-100');
        modalPanel.classList.add('translate-x-full');
        setTimeout(() => {
            mobileMenuModal.classList.add('hidden');
        }, 300);
    };

    hamburgerButton.addEventListener('click', openMenu);
    modalOverlay.addEventListener('click', closeMenu);
    closeModalButton.addEventListener('click', closeMenu);
    
    // 데스크탑 검색창 관련 DOM 요소 및 이벤트 리스너
    const searchIconButton = document.getElementById('search-icon-button');
    const searchBar = document.getElementById('search-bar');

    searchIconButton.addEventListener('click', (e) => {
        e.stopPropagation();
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden')) {
            searchBar.querySelector('input').focus();
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!searchBar.classList.contains('hidden') && !searchBar.contains(e.target) && !searchIconButton.contains(e.target)) {
            searchBar.classList.add('hidden');
        }
    });

    // 검색 폼 제출 이벤트 설정
    const setupSearch = () => {
        const searchForms = [
            document.getElementById('desktop-search-form'),
            document.getElementById('mobile-search-form')
        ];
        searchForms.forEach(form => {
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const input = form.querySelector('input[type="text"]');
                    const query = input.value.trim();
                    if (query) {
                        window.location.hash = `search=${encodeURIComponent(query)}`;
                        if (!mobileMenuModal.classList.contains('hidden')) {
                            closeMenu();
                        }
                    }
                });
            }
        });
    };
    setupSearch();
    
    // 메뉴 링크 클릭 시 URL 해시 변경
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            // 로고는 해시를 비우고, 나머지는 해시를 변경
            const targetHash = e.currentTarget.id === 'logo-link' ? '' : e.currentTarget.hash;
            if (window.location.hash !== targetHash) {
                e.preventDefault();
                window.location.hash = targetHash;
            }
            if (link.classList.contains('mobile-menu-link')) {
                closeMenu();
            }
        });
    });

    // 라우터 초기화 (데이터 로딩 및 URL 감지 시작)
    await initializeRouter();
}

document.addEventListener('DOMContentLoaded', main);
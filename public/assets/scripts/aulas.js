function getAula(element) {
    const aulaId = element.dataset.id;

    const url = `/aulas/${aulaId}`;

    window.location.href = url;
}

const filterButtons = document.querySelectorAll('.filter-btn');
const lessonsContainers = document.querySelectorAll('.lessons');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterType = btn.getAttribute('data-type');
        
        lessonsContainers.forEach(container => {
            if (container.getAttribute('data-type') === filterType) {
                container.style.display = 'grid';
            } else {
                container.style.display = 'none';
            }
        });
    });
});

const lessons = document.querySelectorAll('.lesson');
lessons.forEach(lesson => {
    lesson.addEventListener('click', () => {
        lesson.style.transform = 'scale(0.95)';
        setTimeout(() => {
            lesson.style.transform = 'scale(1)';
        }, 100);
    });
});

const barFill = document.querySelector('.bar-fill');
let currentProgress = 0;

function updateXP() {
    currentProgress = Math.min(currentProgress + Math.random() * 10, 100);
    barFill.style.width = currentProgress + '%';
}

const createMobileMenu = () => {
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;
    
    const menuBtn = document.createElement('button');
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    body.insertBefore(menuBtn, body.firstChild);
    
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    body.appendChild(overlay);
    
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
};

if (window.innerWidth <= 768) {
    createMobileMenu();
}

window.addEventListener('resize', () => {
    const existingBtn = document.querySelector('.mobile-menu-btn');
    if (window.innerWidth <= 768 && !existingBtn) {
        createMobileMenu();
    } else if (window.innerWidth > 768 && existingBtn) {
        existingBtn.remove();
        document.querySelector('.sidebar-overlay')?.remove();
        document.querySelector('.sidebar').classList.remove('active');
    }
});
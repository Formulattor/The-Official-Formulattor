function getAula(element) {
    const aulaId = element.dataset.id;

    const url = `/aulas/${aulaId}`;

    window.location.href = url;
}

function didIGetItRight(element){
    const isCorrect = element.dataset.correta || '';
    if(isCorrect == "true"){
        alert("Acertou!");
    }
    else{
        alert("Ops, leia com atenção!");
    }
}

const filterButtons = document.querySelectorAll('.filter-btn');
const lessonsContainers = document.querySelectorAll('.lessons');

const endpoint = window.location.pathname;

filterButtons.forEach(btn => {
    
    if(endpoint.includes(btn.dataset.type)){
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        window.location.href = `/aulas${btn.dataset.type}`;

    });
});

document.getElementById("myClasses").addEventListener('click', () => {
    window.location.href = "/minhas-aulas";
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




// ========================================= ========================================= //

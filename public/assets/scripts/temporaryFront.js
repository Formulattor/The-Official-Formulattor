import { gsap } from "gsap";
const mainSelSec = document.querySelectorAll('main .secOp');
let isInteractive = true;

mainSelSec.forEach(e => {
    e.addEventListener('mouseenter', () => {
        gsap.to(e, {
            x: 0,
            y: 0,
            scale: 1.1,
            // backgroundColor: '#4a4a4aff',
            duration: 1,
            ease: "elastic.out(1, 0.3)",
        });
    });

    e.addEventListener('mouseleave', () => {
        gsap.to(e, {
            x: 0,
            y: 0,
            scale: 1,
            // backgroundColor: '#303030ff',
            duration: 1,
            ease: "elastic.out(1, 0.3)"
        });
    });
});

const text = document.querySelector('header p');
const chars = text.textContent.split('');
text.innerHTML = '';

chars.forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.opacity = 0;
    text.appendChild(span);
});

gsap.to('header p span', {
    opacity: 1,
    duration: 0.1,
    stagger: 0.05,
    ease: 'power1.inOut'
});


async function createStars(e) {
    if (document.querySelectorAll('.lilStar').length > 0) {
        document.querySelectorAll('.lilStar').forEach(star => star.remove());
    }

    let totalStars = 0;
    if(window.innerWidth <= 1500) {
        totalStars = 100;
    } else if(window.innerWidth > 1500 && window.innerWidth <= 2000) {
        totalStars = 150;
    } else {
        totalStars = 200;
    }

    for(let i = 0; i < totalStars; i++) {
        const newEl = document.createElement('div');
        newEl.classList.add('lilStar');
        newEl.style.left = `${Math.floor(Math.random() * window.innerWidth)}px`;
        newEl.style.top = `${Math.floor(Math.random() * window.innerHeight)}px`;
        newEl.style.animationDuration = `${1 + Math.random() * 2}s`;
        document.querySelector('.behindBody').appendChild(newEl);
        if (!e || e.type !== 'resize') {
            await justADelay(100);
        }
    }
    let o = 0;
    document.querySelectorAll('.lilStar').forEach(star => o++);
    console.log(o);
};

function justADelay(tempo) {
    return new Promise(demoraai => setTimeout(demoraai, tempo));
}


window.addEventListener('resize', (e) => {
    createStars(e);
});
window.addEventListener('load', createStars);

function selectsubject(valor) {
    fetch('/matricular', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ materia_id: valor })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Resposta do server:', data);
        window.location.href = '/initialscreen';
    })
    .catch(error => console.error('Erro:', error));
}

document.getElementById('fis').addEventListener('click', () => selectsubject(1));
document.getElementById('qui').addEventListener('click', () => selectsubject(2));
document.getElementById('mat').addEventListener('click', () => selectsubject(3));
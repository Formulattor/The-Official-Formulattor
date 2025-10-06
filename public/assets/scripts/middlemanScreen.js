import { gsap } from "gsap";

const mainSelSec = document.querySelector('.secOp');

mainSelSec.addEventListener('click', () => {
    gsap.to(mainSelSec, {
        clipPath: '',
        duration: '',
        ease: '',
    })
});
if(window.page === "LOGIN") {
    const container = document.querySelector(".container");
    const registerBtn = document.querySelector(".register-btn");
    const loginBtn = document.querySelector(".login-btn");

    registerBtn.addEventListener("click", () => {
        container.classList.add('active');
    });

    loginBtn.addEventListener("click", () => {
        container.classList.remove('active');
    });


    window.onload = function() {
        const getemailSaved = localStorage.getItem("savedEmail");
        if (getemailSaved) {
            document.getElementById("emailRegisInput").value = getemailSaved;
        }
    }

    //----------------------------------------Local Db------------------------------------------------------

    // const formrg = document.querySelector('.rgsc');
    // //Implementar depois um sistema de verificação de existencia de conta cadastrada, caso já exista, preencher com:
    // //<p>Este e-mail já está cadastrado na plataforma!</p>
    // formrg.addEventListener('submit', async (e) => {
    //     e.preventDefault();

    //     const name = document.getElementById('name').value;
    //     const email = document.getElementById('emailRegisInput').value;
    //     const pass = document.getElementById('passwordReg').value;

    //     const response = await fetch('/submit/regs', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ name, email, pass })
    //     });

    //     if (response.ok) {
    //         document.getElementById('name').value = ''
    //         document.getElementById('emailRegisInput').value = '';
    //         document.getElementById('passwordReg').value = '';
    //         container.classList.remove('active');
    //     } else {
    //         alert('erro ao cadastrar user.');
    //     }
    // });

    // const formlg = document.querySelector('.lgsc');
    // formlg.addEventListener('submit', async (e) => {
    //     e.preventDefault();
    //     //Implementar depois um sistema de verificação de existencia de conta / incoerencia de dados, preencher com::
    //     //<p>Dados iválidos!</p>
    //     const email = document.getElementById('emailLog').value;
    //     const pass = document.getElementById('passwordLog').value;

    //     const response = await fetch('/submit/logs', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ email, pass })
    //     });

    //     if (response.ok) {
    //         document.getElementById('emailLog').value = '';
    //         document.getElementById('passwordLog').value = '';
    //     } else {
    //         alert('erro ao logar user.');
    //     }
    // });
} else if(window.page === "HOME") {
    let mainHeader = document.querySelector(".homeHeader");
    let mainDescsInfos = document.querySelector(".mainOptionsscreen");
    let emailhomeInput = document.getElementById("emailInput");
    
    window.addEventListener('scroll', () => {
        const howmuchScroll = window.scrollY;
        let opScale;
        let opOpacity;
        //credito +1 pro fabras
        if(howmuchScroll >= 100) {
            mainHeader.style.backgroundColor = "#20132a";
            const invisibleOptions = Math.min((scrollY - 100) / 390, 1);
            opScale = 1 - invisibleOptions * 0.1;
            opOpacity = 1 - invisibleOptions;
            mainDescsInfos.style.transform = `scale(${opScale})`;
            mainDescsInfos.style.opacity = `${opOpacity}`;
        } else {
            mainHeader.style.backgroundColor = "transparent";
            if (opScale != 1 || opOpacity != 1) {
                opScale = 1;
                opOpacity = 1;
                mainDescsInfos.style.transform = `scale(${opScale})`;
                mainDescsInfos.style.opacity = `${opOpacity}`;
            }
        }
    });


    document.querySelector(".inputBackground").addEventListener("click", () => {
        emailhomeInput.focus();
    });

    emailhomeInput.addEventListener("focus", () => {
        document.querySelector(".inputBackground").classList.add('inputIsfocus');
        document.querySelector(".inputBackground").style.borderColor = "rgb(209, 146, 207)";
    });

    emailhomeInput.addEventListener("blur", () => {
        if(emailhomeInput.value.trim() === "") {
            document.querySelector(".inputBackground").classList.remove('inputIsfocus');
        }
        document.querySelector(".inputBackground").style.borderColor = "transparent";
    });

    document.querySelector(".signinButton").addEventListener("click", saveEmail);

    document.getElementById("emailInput").addEventListener('keydown', function(keyPressed){
        if(keyPressed.key === "Enter") {
            saveEmail();
        }
    });

    function saveEmail() {
        const emailTyped = emailhomeInput.value;
        localStorage.setItem("savedEmail", emailTyped);
        window.location.href = "login.html";
    }
}
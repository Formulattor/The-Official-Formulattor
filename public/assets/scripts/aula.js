let isGenerated = false;

document.getElementById("renderQuestion").addEventListener('click', async () => {
    if (isGenerated) return;
    isGenerated = true;
    // const aula_id = document.getElementById("div").dataset.id;

    const url = window.location.href;

    const data = await fetch(`${url}/perguntas`);

    const results = await data.json();

    document.getElementById("questP").textContent += "Pergunta: " + results.q[0].enunciado;
    
    results.a.forEach(resp => {
        const newLi = document.createElement('button');
        newLi.classList.add('btn');
        newLi.textContent = resp.resposta;
        newLi.dataset.correta = resp.verdadeira;
        document.getElementById("alternativas").appendChild(newLi);
        newLi.addEventListener('click', function (){
            didIGetItRight(this);
        });

    });

});

document.getElementById("backBtn").addEventListener('click', () => window.location.assign("/aulas"));

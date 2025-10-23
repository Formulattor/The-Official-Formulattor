function getAulas(){
    window.location.href = "/aulas";
}

function getQuestions(){
    window.location.href = "/quiz";
}

document.querySelector('.goto-arduino').addEventListener('click', () => { window.location.assign("/arduino"); });

async function getMatriculas(){
    const user_id = document.getElementById("getMatriculas").dataset.user_id;

    if(user_id == null || user_id == undefined || !user_id){
        window.location.href = "/login";
    }
    else{
        window.location.href = `/matriculas/${user_id}`;
    }
}
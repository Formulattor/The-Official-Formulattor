let writer;
let port;
let readMode = "clc";
let reader = null;
let timeout = 5000;
let ledState = false;
let commands = [];

let isredOn = false;
let isgreenOn = false;
let isblueOn = false;

document.querySelector('.connectArduino').addEventListener('click', connectSerial);

document.querySelector('.clearTerminal').addEventListener('click', () => {
    document.querySelector('.terminalInterface').innerHTML = ">_<br><br>";
});

// document.getElementById('hxBtn').addEventListener('mouseup', () => {
//     let currentColor = getComputedStyle(document.getElementById('hxBtn')).backgroundColor;
//     if(readMode == "timer"){
//         if (currentColor !== "rgb(210, 43, 43)"){  
//             document.getElementById('hxBtn').style.backgroundColor = "rgb(210, 43, 43)";
//             setTimeout(() => {
//                 setLed();
//                 document.getElementById('hxBtn').style.backgroundColor = "#323232";
//             }, timeout);
//         }
//     }
//     else{
//         getLoadcell();
//     }
// });

const turnRGB = () => {
    if(!port || !writer){
        return sendToTerminal("Conecte a porta serial antes de enviar comandos.");
    }

    let color;
    let style;
    let isColorOn;

    const element = event.target;
    if(element.id == "vBtn"){
        color = "red";
        style = "rActv";
        isredOn = !isredOn;
        isColorOn = isredOn;
    }
    else if(element.id == "vrBtn"){
        color = "green";
        style = "grActv";
        isgreenOn = !isgreenOn;
        isColorOn = isgreenOn;
    }
    else if(element.id == "azBtn"){
        color = "blue";
        style = "azActv";
        isblueOn = !isblueOn;
        isColorOn = isblueOn;
    }

    if (isColorOn) {
        element.classList.add(style);
    }
    else{
        element.classList.remove(style);
    }
    return setRgbLED(color);
};

document.getElementById('vrBtn').addEventListener('click', () => {
    if(!port || !writer){
        return sendToTerminal("Conecte a porta serial antes de enviar comandos.");
    }
    return turnRGB();
});

document.getElementById('azBtn').addEventListener('click', () => {
    if(!port || !writer){
        return sendToTerminal("Conecte a porta serial antes de enviar comandos.");
    }
    return turnRGB();
});

document.getElementById('vBtn').addEventListener('click', () => {
    if(!port || !writer){
        return sendToTerminal("Conecte a porta serial antes de enviar comandos.");
    }
    return turnRGB();
});

async function connectSerial() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        writer = port.writable.getWriter();
        sendToTerminal("Porta serial conectada com sucesso!");
        document.querySelector('.connectArduino').classList.add('active');
    } catch (err) {
        sendToTerminal("Erro ao conectar: " + err.message);
    }
}

async function setLed(){
    if(!port || !writer){
        return sendToTerminal("Conecte a porta serial antes de enviar comandos.");
    }
    
    ledState = !ledState;
    const command = ledState ? "led_on" : "led_off";

    try{
        const encoder = new TextEncoder();
        await writer.write(encoder.encode(command + "\n"));
        return sendToTerminal(command);
    }
    catch (err){
        sendToTerminal("Erro ao enviar comando: " + err.message);
    }
}

async function setRgbLED(color){
    if(!port || !writer){
        return sendToTerminal("Conecte a porta serial antes de enviar comandos.");
    }

    try{
        let command;

        const encoder = new TextEncoder();
        
        if(serialContains(`rgb_${color}_on`, `rgb_${color}_off`)){
            command = "off";
        }
        else{
            command = "on";
        }
        
        await writer.write(encoder.encode(`rgb_${color}_${command}\n`));
        return sendToTerminal(`rgb_${color}_${command}`);
    }
    catch (err){
        sendToTerminal("Erro ao enviar comando: " + err.message);
    }
}

async function switchLoadcell(){
    if(!port || !writer){
        return sendToTerminal("Conecte a porta serial antes de enviar comandos.");
    }

    try{
        const encoder = new TextEncoder();
        await writer.write(encoder.encode("switch\n"));
        
        if(document.getElementById("readMode").textContent == "Força"){
            document.getElementById("readMode").textContent = "Pressão";
        }
        else{
            document.getElementById("readMode").textContent = "Força";
        }

        return sendToTerminal("switch");
    }
    catch (err){
        sendToTerminal("Erro ao enviar comando: " + err.message);
    }
}

async function getLoadcell(){
    if(!port || !writer){
        return sendToTerminal("Conecte a porta serial antes de enviar comandos.");
    }

    try {
        const encoder = new TextEncoder();
        await writer.write(encoder.encode("hx711\n"));

        setTimeout(async () => {
            const result = await readPort();
            // alert(result);
            sendToTerminal("Valor no A0: " + result);
        }, 200);


        return;

    } catch (err) {
        sendToTerminal("Erro ao enviar comando: " + err.message);
    }

}

function sendToTerminal(command){
    document.querySelector('.terminalInterface').innerHTML += "> " + command + "<br><br>";
    commands.push(command);
}

function serialContains(value, excepts){
    for (let i = commands.length - 1; i >= 0; i--)
    {
        if (commands[i] == value)
        {
            return true;
        }
        else if (commands[i] == excepts)
        {
            return false;
        }
    }
    return false;
}

async function readPort() {
    if (reader) return "";

    reader = port.readable.getReader();
    let buffer = "";
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const text = new TextDecoder().decode(value);
            buffer += text;

            if (buffer.includes("\n")) {
                break;
            }
        }
    } catch (err) {
        sendToTerminal("Erro ao ler: " + err.message);
    } finally {
        reader.releaseLock();
        reader = null;
    }

    return buffer.trim();
}

window.connectSerial = connectSerial;
window.setLed = setLed;
window.setRgbLED = setRgbLED;
window.switchLoadcell = switchLoadcell;
window.getLoadcell = getLoadcell;
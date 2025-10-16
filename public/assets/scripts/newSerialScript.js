let writer;
let port;
let readMode = "clc";
let reader = null;
let timeout = 5000;
let commands = [];


document.querySelector('.connectArduino').addEventListener('click', connectSerial);
document.querySelector('.clearTerminal').addEventListener('click', () => {
    document.querySelector('.terminalInterface').innerHTML = ">_<br><br>";
})

async function connectSerial() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        writer = port.writable.getWriter();
        sendToTerminal("Porta serial conectada com sucesso!");
        // document.querySelector('.connBtn').classList.add('active');
        await getLoadcell();
    } catch (err) {
        sendToTerminal("Erro ao conectar: " + err.message);
    }
}


function sendToTerminal(command){
    document.querySelector('.terminalInterface').innerHTML += "> " + command + "<br><br>";
    commands.push(command);
}

async function readPort() {
    if (reader) return console.log('eita');
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
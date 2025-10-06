import mysql from 'mysql2';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


dotenv.config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

const dbPromise = db.promise();

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err);
    } else {
        console.log('Conectado ao MySQL!');
    }
});

export async function registerNewUser(req, res) {
    try { 
        const { name, email, password } = req.body;
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const sql = `INSERT INTO usuario (nome, email, senha, pontuacao) VALUES (?, ?, ?, 0)`;
    
        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Erro ao inserir:', err);
                return res.send('Erro ao cadastrar usuário!');
            }
            res.sendFile(path.join(__dirname, 'public', 'login.html'), (err) => {
                if (err) {
                    console.error('Deu problema: ', err);   
                    res.status(500);
                    return;
                }
            });
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Login realizado com sucesso',
            text: `Olá, ${name}! Seu login foi realizado às ${new Date().toLocaleString('pt-BR')}. Se não foi você, entre em contato.`
        };

        // transporter.sendMail(mailOptions).then(() => console.log('E-mail enviado com sucesso')).catch(err => console.error('Erro ao enviar e-mail:', err));
    } catch (error) {
        console.error('Deu ruim ai: ', error);
    }
}

export async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        const [rows] = await dbPromise.query('SELECT * FROM usuario WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).send('Email ou senha incorretos');
        }

        const user = rows[0];

        const match = await bcrypt.compare(password, user.senha);
        if (!match) return res.status(401).send('Email ou senha incorretos');

        req.session.email = email; //------------------------------------------------------------------------------Fica de olho
        res.render('temporary', { usuario: user }); //colocar somente register para acessar esssa tela depois...
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
}

const shownQuestions = new Set();

// export async function randomQuest(res) {
//     try {
//         let numMat = 1;

//         const [questions] = await dbPromise.query(
//             'SELECT id, enunciado FROM questoes WHERE materia_id = ?', [numMat]);

//         const remaining = questions.filter(q => !shownQuestions.has(q.id));

//         if (remaining.length === 0) {
//             shownQuestions.clear();
//             return res.send({ message: 'Acabaram as questões, reiniciando!' });
//         }

//         const randomIndex = Math.floor(Math.random() * remaining.length);
//         const question = remaining[randomIndex];

//         shownQuestions.add(question.id);

//         res.send(question.enunciado);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Erro no servidor');
//     }
// }

export async function getTopTen(res) {
    db.query('SELECT nome, pontuacao FROM usuario ORDER BY pontuacao DESC LIMIT 10', (err, results) => {
        if (err) {
            console.error(err);
            return res.send('Erro ao buscar usuários');
        }
        res.render('usuarios', { usuarios: results });
    });
}

export async function joinCourse(req, res){
    // const { email, materia_id } = req.body; -- primeira versão
    const { materia_id } = req.body; // -- segunda versão
    try{
        // const [user] = await dbPromise.query(`SELECT id FROM usuario WHERE TRIM(LOWER(email)) = TRIM(LOWER(?))`, [email]);
        const [user] = await dbPromise.query(`SELECT id FROM usuario WHERE TRIM(LOWER(email)) = TRIM(LOWER(?))`, [req.session.email]);
        if (user.length === 0) {
            return res.status(404).send("Usuário não encontrado.");
        }

        const dataMatricula = new Date();

        await dbPromise.query('INSERT INTO matriculas (usuario_id, materia_id, dataMatricula) VALUES (?, ?, ?)', [user[0].id, materia_id, dataMatricula]);
        return res.send("Matrícula realizada com sucesso!");

    }
    catch(e){
        console.error(e);
        return res.send("Erro ao matricular usuário");
    }

}

export async function renderQuestion(req, res, renderSomething = false) {
    if (renderSomething && req.body?.materia_id) {
        const { materia_id } = req.body;

        try {
            // Pegando todas as questões da matéria passada
            const [qResults] = await dbPromise.query('SELECT id, enunciado FROM questoes WHERE materia_id = ?', [materia_id]);
            // Caso não encontre nenhuma questão
            if (!qResults || qResults.length === 0) {
                return res.send({ message: 'Não há questões para essa matéria.' });
            }

            // Garante que somente reste as que não foram exibidas
            const remaining = qResults.filter(q => !shownQuestions.has(q.id));
            // Reinicia caso já tenha exibido todas as questões
            if (remaining.length === 0) {
                shownQuestions.clear();
                return res.send({ message: 'Acabaram as questões, reiniciando!' });
            }

            // Sorteia uma questão
            const randomIndex = Math.floor(Math.random() * remaining.length);
            const question = remaining[randomIndex];

            shownQuestions.add(question.id);

            // Pega as alternativas da questão
            const [rResults] = await dbPromise.query('SELECT id, resposta, questao_id, verdadeira FROM respperg WHERE questao_id = ?', [question.id]);

            return res.render('quiz', {
                questoes: [question], // Somente a questão que foi sorteada
                respperg: rResults
            });

        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro no servidor');
        }
    }

    // Se não veio materia_id ou renderSomething
    res.render('quiz', {
        questoes: [],
        respperg: []
    });
}

export async function listCourses(req, res){
    try{
        const [list] = await dbPromise.query("SELECT usuario_id, materia_id, dataMatricula FROM matriculas");
        console.log("Matrículas consultadas com sucesso!");
        return res.status(200).send(list);
    }
    catch (error){
        console.log("Algo ocorreu ao buscar as matrículas: ", error);
        return res.send(`Algo ocorreu ao buscar as matrículas`);
    }
    
}

// export async function userPredef(req, res) {
//     try {
//         const { materia_id } = req.body;
//     } catch (error) {
//         console.log("Algo ocorreu ao entrar na rota da tela inicial: ", error);
//         return res.send(`Algo ocorreu ao entrar na rota da tela inicial`);
//     }
// }

export async function getClassById(req, res){
    try{
        const id = req.params.id;
        const [list] = await dbPromise.query("SELECT id, nome, conteudo FROM aulas WHERE id = ?", [id]);
        console.log("Aula acessada com sucesso!");
        return res.status(200).send(list);
    }
    catch (error){
        console.log("Algo ocorreu ao tentar acessar a aula: ", error);
        return res.send(`Algo ocorreu ao acessar a aula`);
    }
    
}

export async function getClass(req, res){
    try{
        const [list] = await dbPromise.query("SELECT id, nome, conteudo FROM aulas");
        console.log("Aulas acessadas com sucesso!");
        return res.status(200).send(list);
    }
    catch (error){
        console.log("Algo ocorreu ao tentar acessar as aulas: ", error);
        return res.send(`Algo ocorreu ao acessar as aulas`);
    }
    
}
import pg from 'pg';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do transporter de e-mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        }
        : {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 6543,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            ssl: { rejectUnauthorized: false },
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        }
);

function returnError(code, message, response){
    return response.render("error", {
        erro: {
            code: code,
            message: message
        }
    });
}

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
        console.error('Código do erro:', err.code);
        console.error('Detalhes da conexão:', {
            host: process.env.DB_HOST || 'não definido',
            database: process.env.DB_DATABASE || 'não definido',
            port: process.env.DB_PORT || 'não definido',
            user: process.env.DB_USER || 'não definido',
            hasPassword: !!process.env.DB_PASS,
            hasDatabaseURL: !!process.env.DATABASE_URL
        });
    } else {
        console.log('✓ Conectado ao PostgreSQL (Supabase) com sucesso!');
        release();
    }
});

async function sendEmail(mailOptions) {
    try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso');
    } catch (err) {
        console.error('Erro ao enviar e-mail:', err.message);
    }
}

export async function registerNewUser(req, res) {
    try { 
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send('Todos os campos são obrigatórios');
        }

        const existingResult = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);

        if (existingResult && existingResult.rows.length > 0) {
            return res.status(400).send('E-mail já cadastrado');
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const sql = `INSERT INTO usuario (nome, email, senha, pontuacao) VALUES ($1, $2, $3, 0)`;
        
        await pool.query(sql, [name, email, hashedPassword]);
    
        const user = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Cadastro realizado com sucesso',
            text: `Olá, ${name}! Seu cadastro foi realizado com sucesso em ${new Date().toLocaleString('pt-BR')}.`
        };
        sendEmail(mailOptions);

        req.session.email = email;
        req.session.userId = user.rows[0].id;

        res.render('temporary', {
            usuario: user.rows[0]
       });

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        returnError(500, "Erro interno no servidor", res);
    }
}

export async function loginUser(req, res) {
    const { email, password } = req.body;

    console.log('🔍 DEBUG loginUser:', {
        temSession: !!req.session,
        temSessionID: !!req.sessionID,
        tipoReq: typeof req.session,
        email: email
    });

    try {
        if (!email || !password) {
            returnError(400, 'E-mail e senha são obrigatórios', res)
        }

        const result = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            returnError(400, 'E-mail ou senha incorretos', res);
        }

        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.senha);
        if (!match) {
            returnError(400, 'E-mail ou senha incorretos', res);
        }

        req.session.email = email;
        req.session.userId = user.id;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Login realizado',
            text: `Olá, ${user.nome}! Login realizado em ${new Date().toLocaleString('pt-BR')}.`
        };
        sendEmail(mailOptions);

        const userMatriculas = await pool.query("SELECT * FROM matriculas WHERE usuario_id = $1", [user.id]);

        const users = await pool.query("SELECT nome, pontuacao FROM usuario ORDER BY pontuacao DESC LIMIT 10")

        if(userMatriculas.rows.length > 0){
            return res.render('initialScreen', {
                usuario: user,
                leaderboard: users.rows
            });
        }
        return res.render('temporary', {
            usuario: user
        })
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        returnError(500, "Erro interno no servidor", res);
    }
}


const shownQuestions = new Map();

export async function getTopTen(req, res) {
    try {
        const result = await pool.query(
            'SELECT nome, pontuacao FROM usuario ORDER BY pontuacao DESC LIMIT 10'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar top 10:', err);
        returnError(500, "Erro interno no servidor", res);
    }
}

export async function joinCourse(req, res) {
    const { materia_id } = req.body;

    try {
        if (!req.session.email) {
            return res.status(401).send('Usuário não autenticado');
        }

        const userResult = await pool.query(
            `SELECT id FROM usuario WHERE TRIM(LOWER(email)) = TRIM(LOWER($1))`, 
            [req.session.email]
        );

        if (userResult.rows.length === 0) {
            return returnError(404, "Usuário não encontrado", res);
            // return res.status(404).send('Usuário não encontrado');
        }

        // Verificar se já está matriculado
        const existingResult = await pool.query(
            'SELECT id FROM matriculas WHERE usuario_id = $1 AND materia_id = $2',
            [userResult.rows[0].id, materia_id]
        );

        if (existingResult.rows.length > 0) {
            return returnError(400, 'Você já está matriculado nesta matéria', res);
            // return res.status(400).send('Você já está matriculado nesta matéria');
        }

        const dataMatricula = new Date();
        await pool.query(
            'INSERT INTO matriculas (usuario_id, materia_id, data_matricula) VALUES ($1, $2, $3)', 
            [userResult.rows[0].id, materia_id, dataMatricula]
        );

        const user = await pool.query("SELECT * FROM usuario WHERE id = $1", 
            [userResult.rows[0].id]
        );
        
        res.status(201).json({ message: 'Matrícula realizada com sucesso!' });

    } catch (e) {
        console.error('Erro ao matricular:', e);
        returnError(500, "Erro interno no servidor", res);
    }
}

export async function redirectAfterJoining(req, res) {
    if (!req.user) {
        return res.redirect('/login');
    }
    const user = await pool.query(
        `SELECT * FROM usuario WHERE TRIM(LOWER(email)) = TRIM(LOWER($1))`, 
        [req.session.email]
    );

    res.render('initialScreen', {
        usuario: user.rows[0]
    });
}

export async function renderQuestion(req, res, renderSomething = false) {
    if (renderSomething && req.body?.materia_id) {
        const { materia_id } = req.body;
        const userId = req.session.userId || 'guest';

        try {
            const qResult = await pool.query(
                'SELECT id, enunciado FROM questoes WHERE materia_id = $1', 
                [materia_id]
            );

            if (!qResult.rows || qResult.rows.length === 0) {
                returnError(404, "Não há questões para essa matéria", res);
                // return res.status(404).json({ message: 'Não há questões para essa matéria' });
            }

            if (!shownQuestions.has(userId)) {
                shownQuestions.set(userId, new Set());
            }
            const userShown = shownQuestions.get(userId);

            const remaining = qResult.rows.filter(q => !userShown.has(q.id));

            if (remaining.length === 0) {
                userShown.clear();
                return res.json({ message: 'Todas as questões foram respondidas. Reiniciando!' });
            }

            const randomIndex = Math.floor(Math.random() * remaining.length);
            const question = remaining[randomIndex];
            userShown.add(question.id);

            const rResult = await pool.query(
                'SELECT id, resposta, questao_id, verdadeira FROM respperg WHERE questao_id = $1', 
                [question.id]
            );

            return res.render('quiz', {
                questoes: [question],
                respperg: rResult.rows
            });

        } catch (err) {
            console.error('Erro ao renderizar questão:', err);
            returnError(500, "Erro interno no servidor", res);
        }

    }
    res.render('quiz', {
        questoes: [],
        respperg: []
    });
}

export async function listCourses(req, res) {
    try {

        const { usuario_id } = req.params;

        const result = await pool.query(
            'SELECT * FROM matriculas WHERE usuario_id = $1',
            [usuario_id]
        );
        // res.status(200).json(result.rows);
        res.render('matriculas', {
            matriculas: result.rows
        });

    } catch (error) {
        console.error('Erro ao listar matrículas:', error);
        returnError(500, "Erro interno no servidor", res);
    }
}

export async function getCourses(req, res){

    const userId = req.session.userId;
    let user = await pool.query("SELECT * FROM usuario WHERE id = $1", [userId]);

    if(user.rows.length === 0){
        user.rows[0] = {
            id: null,
            nome: "guest"
        }
    }

    return res.render('matricular', {
        usuario: user.rows[0]
    });
}

export async function getClassById(req, res) {
    try {
        const id = req.params.id;
        const result = await pool.query(
            'SELECT id, nome, contexto, conteudo_1, conteudo_2 FROM aulas WHERE id = $1', 
            [id]
        );

        if (result.rows.length === 0) {
            return res.render("error", {
                erro: {
                    code: 404,
                    message: "Aula não encontrada"
                }
            });
        }

        res.render('aula', {
            aulas: result.rows
        });
    } catch (error) {
        console.error('Erro ao acessar aula:', error);
        returnError(500, "Erro interno no servidor", res);
    }
}

export async function getClass(req, res) {
    try {
        const result = await pool.query('SELECT id, nome, contexto FROM aulas');
        // res.status(200).json(result.rows);
        // console.log(JSON.stringify(result.rows));
        res.render('aulas', {
            aulas: result.rows
        });
    } catch (error) {
        console.error('Erro ao acessar aulas:', error);
        returnError(500, "Erro interno no servidor", res);
    }
}

export async function getQuestion(req, res){
    const { aula_id } = req.params;
    try{

        const pergunta = await pool.query('SELECT id, enunciado FROM questoes WHERE aula_id = $1',
            [aula_id]
        );

        const id = pergunta.rows[0].id;

        const respostas = await pool.query('SELECT id, resposta, verdadeira, questao_id FROM respperg WHERE questao_id = $1',
            [id]
        );

        const response = {
            q: pergunta.rows,
            a: respostas.rows
        }

        return res.json(response);
    }
    catch (error) {

        console.log("Erro ao acessar pergunta:", error);

    }
}
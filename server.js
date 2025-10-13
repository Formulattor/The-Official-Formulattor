import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
    registerNewUser,
    loginUser,
    getTopTen,
    joinCourse,
    renderQuestion,
    listCourses,
    getClassById,
    getClass,
    redirectAfterJoining
} from './mysqlDb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    },
    name: 'connect.sid'
}));

// if (process.env.NODE_ENV !== 'production') {
//     app.use((req, res, next) => {
//         if (!req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
//             console.log('🔍 Rota:', req.method, req.path);
//         }
//         next();
//     });
// }

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

function isAuthenticated(req, res, next) {
    if (req.session.email) {
        return next();
    }
    res.render({
        erro:{
            code: 401,
            message:'Você precisa estar logado para acessar esta página'
        }
    });
}

app.get('/', (req, res) => {
    const homePath = path.join(__dirname, 'public', 'home.html');
    console.log('Tentando servir:', homePath);
    res.sendFile(homePath, (err) => {
        if (err) {
            console.error('Erro ao servir home.html:', err.message);
            res.status(404).send('Página não encontrada. Verifique se a pasta public/ existe.');
        }
    });
});

app.get('/usuarios', (req, res) => {
    getTopTen(res);
});

app.get('/quiz', (req, res) => {
    renderQuestion(req, res);
});

app.post('/quiz', (req, res) => {
    renderQuestion(req, res, true);
});

app.post('/cadastrar', (req, res) => {
    registerNewUser(req, res);
});

app.post('/home',(req, res) => {
    loginUser(req, res);
});

app.post('/matricular', (req, res) => {
    joinCourse(req, res);
});

app.get('/initialscreen', (req, res) => {
    redirectAfterJoining(req, res);
});

app.get('/matriculas', (req, res) => {
    listCourses(req, res);
});

app.get("/aulas/:id", (req, res) => {
    getClassById(req, res);
});

app.get("/aulas", (req, res) => {
    getClass(req, res);
});

app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).send('Erro interno do servidor');
});

app.use((req, res) => {
    res.render("error", {
        erro: {
            code: 404,
            message: "Caminho especificado não encontrado ou mal indentado"
        }
    }
    )
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('==========================================');
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Local URL: http://localhost:${PORT}`);
    console.log(`URL: https://the-official-formulattor.onrender.com`);
    console.log(`Diretório: ${__dirname}`);
    console.log(`Public: ${path.join(__dirname, 'public')}`);
    console.log(`Views: ${path.join(__dirname,'public', 'views')}`);
    console.log('==========================================');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

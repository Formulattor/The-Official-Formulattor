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
    getClass
} from './mysqlDb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// ORDEM CORRETA DOS MIDDLEWARES
// ========================================

// 1. Parse do body ANTES de tudo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Sessão logo DEPOIS do parse
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-me-in-production',
    resave: false,
    saveUninitialized: true, // Mudado para true
    cookie: {
        secure: false, // Sempre false até resolver (mesmo em produção)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: 'lax'
    },
    name: 'connect.sid'
}));

// 3. Debug (remover depois que funcionar)
app.use((req, res, next) => {
    console.log('🔍 Sessão check:', {
        existe: !!req.session,
        sessionID: req.sessionID || 'sem ID',
        email: req.session?.email || 'sem email'
    });
    next();
});

// 4. Arquivos estáticos por último
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para adicionar cabeçalhos de segurança
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Middleware de autenticação
function isAuthenticated(req, res, next) {
    if (req.session.email) {
        return next();
    }
    res.status(401).send('Você precisa estar logado para acessar esta página');
}

// Rotas públicas
app.get('/', (req, res) => {
    const homePath = path.join(__dirname, 'public', 'home.html');
    console.log('📂 Tentando servir:', homePath);
    res.sendFile(homePath, (err) => {
        if (err) {
            console.error('❌ Erro ao servir home.html:', err.message);
            res.status(404).send('Página não encontrada. Verifique se a pasta public/ existe.');
        }
    });
});

app.get('/login', (req, res) => {
    const loginPath = path.join(__dirname, 'public', 'login.html');
    res.sendFile(loginPath, (err) => {
        if (err) {
            console.error('❌ Erro ao servir login.html:', err.message);
            res.status(404).send('Página não encontrada');
        }
    });
});

app.get('/register', (req, res) => {
    const registerPath = path.join(__dirname, 'public', 'register.html');
    res.sendFile(registerPath, (err) => {
        if (err) {
            console.error('❌ Erro ao servir register.html:', err.message);
            res.status(404).send('Página não encontrada');
        }
    });
});

// Health check endpoint (importante para Render)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas de autenticação
app.post('/register', registerNewUser);
app.post('/login', loginUser);

// Rotas protegidas
app.get('/top-ten', getTopTen);
app.post('/join-course', isAuthenticated, joinCourse);
app.post('/render-question', isAuthenticated, (req, res) => renderQuestion(req, res, true));
app.get('/list-courses', isAuthenticated, listCourses);
app.get('/class/:id', isAuthenticated, getClassById);
app.get('/classes', isAuthenticated, getClass);

// Rota de logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Erro ao fazer logout');
        }
        res.status(200).send('Logout realizado com sucesso');
    });
});

// Tratamento de erros 404
app.use((req, res) => {
    res.status(404).send('Página não encontrada');
});

// Tratamento de erros gerais
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).send('Erro interno do servidor');
});

// Inicialização do servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📂 Diretório base: ${__dirname}`);
    console.log(`📂 Pasta public: ${path.join(__dirname, 'public')}`);
    console.log(`📂 Pasta views: ${path.join(__dirname, 'views')}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

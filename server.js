import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { joinCourse, listCourses, registerNewUser, renderQuestion, getTopTen, loginUser, getClass, getClassById } from './mysqlDb.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import session from 'express-session';


const port = 3000;
const app = express();

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'ejs');

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true
// }));

app.get('/', (req, res) => {
    res.status(200);
    res.sendFile(path.join(__dirname, 'public', 'home.html'), (err) => {
        if (err) {
            console.error('Deu problema: ', err);   
            res.status(500);
            return;
        }
    });
});

app.get('/usuarios', (req, res) => {
    getTopTen(res);
});

// app.get('/enun', (req, res) => {
//     randomQuest(res);
// });

app.post('/cadastrar', (req, res) => {
    registerNewUser(req, res);
});

app.post('/home',(req, res) => {
    loginUser(req, res);
});

app.post('/matricular', (req, res) => {
    joinCourse(req, res);
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

// app.post('/initialscreen', (req, res) => {
//     userPredef(req, res);
// });

app.get('/quiz', (req, res) => {
    renderQuestion(req, res);
});

app.post('/quiz', (req, res) => {
    renderQuestion(req, res, true);
});

app.listen(port, (err) => {
    if (err) {
        console.log('Deu problema: ', err);
        return;
    }
    console.log(`Servidor aberto em: http://localhost:${port}/`);
});

# The-Official-Formulattor
 This is an official repository for a school project called Formulattor. Our goal is to transform learning methods at Etec Bento Quirino.
---
## Roadmap
- [x]  Login Screen
- [x]  Register Screen
- [ ]  Initial Screen
- [ ]  Middle Screen
- [ ]  App Screen
- [ ]  VideoClass Screen
- [ ]  Execise Screen
---
## Konsole Commands
|  **Function**  |  **Description**  |
|  -------------- | ------------------|
|  `npm install`  |  Install all dependencies|
|  `npm run start:dev`  |  Start the project  |

---
## Database Building
```SQL
CREATE DATABASE formulattordb;
USE formulattordb;

CREATE TABLE usuario (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nome VARCHAR(50) NOT NULL,
   email VARCHAR(50) UNIQUE NOT NULL,
   senha VARCHAR(255) NOT NULL,
   dataNascimento DATE,
   pontuacao INT DEFAULT 0
);

CREATE TABLE materias (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nome VARCHAR(50) NOT NULL
);

CREATE TABLE matriculas (
   id INT AUTO_INCREMENT PRIMARY KEY,
   usuario_id INT NOT NULL,
   materia_id INT NOT NULL,
   dataMatricula DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (usuario_id) REFERENCES usuario(id),
   FOREIGN KEY (materia_id) REFERENCES materias(id)
);

CREATE TABLE questoes (
   id INT AUTO_INCREMENT PRIMARY KEY,
   materia_id INT NOT NULL,
   enunciado VARCHAR(255) NOT NULL,
   FOREIGN KEY (materia_id) REFERENCES materias(id)
);

CREATE TABLE respperg (
   id INT AUTO_INCREMENT PRIMARY KEY,
   questao_id INT NOT NULL,
   resposta VARCHAR(255) NOT NULL,
   verdadeira BIT NOT NULL,
   FOREIGN KEY (questao_id) REFERENCES questoes(id)
);

CREATE TABLE respostas (
   id INT AUTO_INCREMENT PRIMARY KEY,
   usuario_id INT NOT NULL,
   questao_id INT NOT NULL,
   respperg_id INT NOT NULL,
   dataResposta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (usuario_id) REFERENCES usuario(id),
   FOREIGN KEY (questao_id) REFERENCES questoes(id),
   FOREIGN KEY (respperg_id) REFERENCES respperg(id)
);
```
---


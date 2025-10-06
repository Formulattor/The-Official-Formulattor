<?php
session_start();
if (!isset($_SESSION["email"])) {
    header("Location: login.html");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="style.css">

</head>
<body>
    <p>Bem-vindo, <?php echo $_SESSION['nome']; ?>!</p>
</body>
</html>
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files from the same directory
app.use(express.static(__dirname));

app.get("/users", (req, res) => {
    res.sendFile(path.join(__dirname, "users","user.html"));
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login","login.html"));
});


app.listen(PORT, "0.0.0.0" ,() => {
    console.log(`Server running at http://localhost:${PORT}`);
});


// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "html", "index.html"));
// });

// app.get("/teste", (req, res) => {
//     res.sendFile(path.join(__dirname, "html", "learning.html"));
// });

// app.get("/users/", (req, res) => {
//     res.sendFile(path.join(__dirname, "html", "users.html"));
// });

// app.get("/users_crud", (req, res) => {
//     res.sendFile(path.join(__dirname, "html", "user_crud.html"));
// });


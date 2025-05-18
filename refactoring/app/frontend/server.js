const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Set proper MIME types for JS and CSS files
app.use((req, res, next) => {
    if (req.path.endsWith('.css')) {
        res.type('text/css');
    } else if (req.path.endsWith('.js')) {
        res.type('application/javascript');
    }
    next();  // Make sure to call next() to continue middleware chain
});

// Serve static files from the same directory
app.use(express.static(__dirname));

// Routes
app.get("/users", (req, res) => {
    res.sendFile(path.join(__dirname, "modules", "users", "user.html"));
});


app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "modules", "login","login.html"));
});


app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "modules", "users", "home.html"));
});


// Default route for root path
app.get("/", (req, res) => {
    res.redirect("/users");
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


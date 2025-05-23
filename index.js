const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

// Load user data
let users = [];
if (fs.existsSync('users.json')) {
  users = JSON.parse(fs.readFileSync('users.json'));
}

// Middleware: check login
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/views/register.html');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.send('Tên người dùng đã tồn tại. <a href="/register">Thử lại</a>');
  }
  users.push({ username, password, coins: 0 });
  fs.writeFileSync('users.json', JSON.stringify(users));
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.send('Sai tài khoản hoặc mật khẩu. <a href="/login">Thử lại</a>');
  req.session.user = user;
  res.redirect('/home');
});

app.get('/home', requireLogin, (req, res) => {
  res.sendFile(__dirname + '/views/home.html');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

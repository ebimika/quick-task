const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

function loadTasks() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

app.get('/', (req, res) => {
  const tasks = loadTasks();
  res.render('index', { tasks });
});

app.post('/add', (req, res) => {
  const { title, memo, priority } = req.body;
  if (title && title.trim() !== '') {
    const tasks = loadTasks();
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      memo: memo ? memo.trim() : '',
      priority: priority || '中',
      completed: false,
      createdAt: new Date().toLocaleDateString('ja-JP')
    };
    tasks.unshift(newTask);
    saveTasks(tasks);
  }
  res.redirect('/');
});

app.post('/toggle/:id', (req, res) => {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === req.params.id);
  if (task) {
    task.completed = !task.completed;
    saveTasks(tasks);
  }
  res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
  let tasks = loadTasks();
  tasks = tasks.filter(t => t.id !== req.params.id);
  saveTasks(tasks);
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

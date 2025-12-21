document.addEventListener('DOMContentLoaded', function() {
  var input = document.getElementById('taskInput');
  var addBtn = document.getElementById('addTaskButton');
  var tasksContainerAll = document.querySelector('.tasks-list');
  var tasksContainer = document.querySelector('.tasks-list ul');
  var titleLinks = document.querySelectorAll('.titles a');

  var tasks = loadTasks();
  var currentFilter = 'all';

  function render(filter) {
    filter = filter || 'all';
    tasksContainer.innerHTML = '';
    tasks.forEach(function(task) {
      if (filter === 'todo' && task.completed) return;
      if (filter === 'completed' && !task.completed) return;

      var li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');
      li.dataset.id = task.id;

      var textSpan = document.createElement('span');
      textSpan.className = 'task-text';
      textSpan.textContent = task.text;

      var controls = document.createElement('div');
      controls.className = 'task-controls';

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', function() {
        toggleTask(task.id, this.checked);
      });

      var delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.title = 'Delete task';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', function() {
        deleteTask(task.id);
      });

      controls.appendChild(checkbox);
      controls.appendChild(delBtn);
      li.appendChild(textSpan);
      li.appendChild(controls);
      tasksContainer.appendChild(li);
    });

    // Hide the whole .tasks-list container when there are no tasks at all
    if (!tasks || tasks.length === 0) {
      tasksContainerAll.classList.add('hidden');
    } else {
      tasksContainerAll.classList.remove('hidden');
    }
  }

  function addTask(text) {
    var t = (text || '').toString().trim();
    if (!t) return;
    tasks.push({ id: Date.now().toString(), text: t, completed: false });
    saveTasks();
    render(currentFilter);
    input.value = '';
    input.focus();
  }

  function deleteTask(id) {
    var newTasks = [];
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id !== id) newTasks.push(tasks[i]);
    }
    tasks = newTasks;
    saveTasks();
    render(currentFilter);
  }

  function toggleTask(id, completed) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        tasks[i].completed = !!completed;
        break;
      }
    }
    saveTasks();
    render(currentFilter);
  }

  function saveTasks() {
    try {
      var lines = tasks.map(function(t) {
        return t.id + '|' + (t.completed ? '1' : '0') + '|' + encodeURIComponent(t.text);
      });
      localStorage.setItem('tasks', lines.join('\n'));
    } catch (e) { }
  }

  function loadTasks() {
    try {
      var raw = localStorage.getItem('tasks');
      if (!raw) return [];
      var trimmed = raw.trim();
      // If it looks like JSON we had earlier, keep backwards compatibility
      if (trimmed.charAt(0) === '[') {
        try { var arr = JSON.parse(trimmed); return Array.isArray(arr) ? arr : []; } catch (e) { return []; }
      }
      var lines = raw.split('\n');
      var out = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line) continue;
        var parts = line.split('|');
        if (parts.length < 3) continue;
        var id = parts[0];
        var completed = parts[1] === '1';
        var text = decodeURIComponent(parts.slice(2).join('|'));
        out.push({ id: id, text: text, completed: completed });
      }
      return out;
    } catch (e) { return []; }
  }

  for (var i = 0; i < titleLinks.length; i++) {
    titleLinks[i].addEventListener('click', function(e) {
      e.preventDefault();
      var uls = document.querySelectorAll('.titles ul');
      for (var j = 0; j < uls.length; j++) uls[j].classList.remove('active');
      this.parentElement.classList.add('active');
      var txt = this.textContent.trim().toLowerCase();
      if (txt === 'all') currentFilter = 'all';
      else if (txt === 'todo') currentFilter = 'todo';
      else if (txt === 'completed') currentFilter = 'completed';
      render(currentFilter);
    });
  }

  addBtn.addEventListener('click', function() { addTask(input.value); });
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') addTask(input.value); });

  var uls = document.querySelectorAll('.titles ul');
  for (var k = 0; k < uls.length; k++) {
    if (uls[k].textContent.trim().toLowerCase() === 'all') uls[k].classList.add('active');
  }

  render(currentFilter);
});


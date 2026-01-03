document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("taskInput");
  const addBtn = document.getElementById("addTaskButton");
  const tasksListWrap = document.querySelector(".tasks-list");
  const tasksUL = document.querySelector(".tasks-list ul");
  const titleLinks = document.querySelectorAll(".titles a");

  let tasks = loadTasks();
  let currentFilter = "all";

  function saveTasks() {
    try {
      const lines = tasks.map(
        (t) =>
          `${t.id}|${t.completed ? "1" : "0"}|${encodeURIComponent(t.text)}`
      );
      localStorage.setItem("tasks", lines.join("\n"));
    } catch (e) {}
  }

  function loadTasks() {
    try {
      const raw = localStorage.getItem("tasks") || "";
      if (!raw.trim()) return [];
      return raw
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const parts = line.split("|");
          const id = parts[0];
          const completed = parts[1] === "1";
          const text = decodeURIComponent(parts.slice(2).join("|"));
          return { id, text, completed };
        });
    } catch (e) {
      return [];
    }
  }

  function render() {
    tasksUL.innerHTML = "";
    tasks.forEach((task) => {
      if (currentFilter === "todo" && task.completed) return;
      if (currentFilter === "completed" && !task.completed) return;

      const li = document.createElement("li");
      li.className = "task-item" + (task.completed ? " completed" : "");
      li.dataset.id = task.id;

      const span = document.createElement("span");
      span.className = "task-text";
      span.textContent = task.text;

      const controls = document.createElement("div");
      controls.className = "task-controls";

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = task.completed;
      chk.addEventListener("change", () => {
        task.completed = chk.checked;
        saveTasks();
        render();
      });

      const del = document.createElement("button");
      del.className = "delete-btn";
      del.title = "Delete task";
      del.textContent = "✕";
      del.addEventListener("click", () => {
        tasks = tasks.filter((t) => t.id !== task.id);
        saveTasks();
        render();
      });

      controls.appendChild(chk);
      controls.appendChild(del);
      li.appendChild(span);
      li.appendChild(controls);
      tasksUL.appendChild(li);
    });

    tasksListWrap.classList.toggle("hidden", tasks.length === 0);
  }

  function addTask(text) {
    const t = (text || "").trim();
    if (!t) return;
    tasks.push({ id: Date.now().toString(), text: t, completed: false });
    saveTasks();
    render();
    input.value = "";
    input.focus();
  }

  titleLinks.forEach((a) =>
    a.addEventListener("click", function (e) {
      e.preventDefault();
      document
        .querySelectorAll(".titles ul")
        .forEach((ul) => ul.classList.remove("active"));
      this.parentElement.classList.add("active");
      const txt = this.textContent.trim().toLowerCase();
      currentFilter = txt === "todo" || txt === "completed" ? txt : "all";
      render();
    })
  );

  addBtn.addEventListener("click", () => addTask(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask(input.value);
  });

  document.querySelectorAll(".titles ul").forEach((ul) => {
    if (ul.textContent.trim().toLowerCase() === "all")
      ul.classList.add("active");
  });

  render();
});

document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-btn');
  const todoList = document.getElementById('todo-list');
  const taskCountSpan = document.getElementById('task-count');
  const subtitle = document.getElementById('subtitle');
  const emptyState = document.getElementById('empty-state');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let todos = JSON.parse(localStorage.getItem('premium-todos')) || [];
  let currentFilter = 'all';

  // Initialize App
  renderTodos();
  updateTaskCount();

  // Add Task
  addBtn.addEventListener('click', addTask);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  function addTask() {
    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = {
      id: Date.now().toString(),
      text,
      completed: false
    };

    todos.push(newTodo);
    saveTodos();
    
    // Clear input
    todoInput.value = '';
    
    // Switch to all to see the newly added task if on completed filter
    if (currentFilter === 'completed') {
      document.querySelector('[data-filter="all"]').click();
    } else {
      renderTodos();
    }
  }

  // Handle List Clicks (Delete & Toggle)
  todoList.addEventListener('click', (e) => {
    // Handle Delete
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      deleteTask(id);
      return;
    }

    // Handle Checkbox Toggle
    if (e.target.matches('.custom-checkbox')) {
      const id = e.target.dataset.id;
      toggleTask(id);
    }
  });

  function deleteTask(id) {
    const itemElement = document.getElementById(`todo-${id}`);
    
    // Outgoing animation
    if(itemElement) {
       itemElement.style.transform = 'translateX(20px)';
       itemElement.style.opacity = '0';
       setTimeout(() => {
         todos = todos.filter(t => t.id !== id);
         saveTodos();
         renderTodos();
       }, 300);
    } else {
       todos = todos.filter(t => t.id !== id);
       saveTodos();
       renderTodos();
    }
  }

  function toggleTask(id) {
    todos = todos.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    saveTodos();
    renderTodos();
  }

  // Filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // Render Engine
  function renderTodos() {
    todoList.innerHTML = '';
    
    let filteredTodos = todos;
    if (currentFilter === 'pending') {
      filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      filteredTodos = todos.filter(t => t.completed);
    }

    if (filteredTodos.length === 0) {
      emptyState.classList.add('show');
    } else {
      emptyState.classList.remove('show');
      
      filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.id = `todo-${todo.id}`;
        
        li.innerHTML = `
          <div class="checkbox-wrapper">
             <input type="checkbox" class="custom-checkbox" data-id="${todo.id}" ${todo.completed ? 'checked' : ''} aria-label="Toggle completion">
             <svg viewBox="0 0 24 24" fill="none" class="check-icon" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
             </svg>
          </div>
          <span class="todo-text">${escapeHTML(todo.text)}</span>
          <button class="delete-btn" data-id="${todo.id}" aria-label="Delete task">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        `;
        todoList.appendChild(li);
      });
    }
    
    updateTaskCount();
  }

  function updateTaskCount() {
    const pendingCount = todos.filter(t => !t.completed).length;
    taskCountSpan.textContent = pendingCount;
    
    if (todos.length > 0) {
      subtitle.classList.remove('hide');
    } else {
      subtitle.classList.add('hide');
    }
  }

  function saveTodos() {
    localStorage.setItem('premium-todos', JSON.stringify(todos));
  }
  
  // Security XSS Prevent
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag] || tag)
    );
  }
});

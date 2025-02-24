import { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

type Task = {
  id: number;
  title: string;
  description?: string;
  isComplete: boolean;
};

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/tasks');
        setTasks(response.data);
      } catch (err) {
        console.error('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/tasks', { title: newTask });
      setTasks([...tasks, response.data]);
      setNewTask('');
    } catch (err) {
      console.error('Failed to create task');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Failed to delete task');
    }
  };
/*
  const handleToggleComplete = async (id: number) => {
    try {
      const task = tasks.find(t => t.id === id);
      const response = await api.put(`/tasks/${id}`, {
        isComplete: !task?.isComplete
      });
      setTasks(tasks.map(t => t.id === id ? response.data : t));
    } catch (err) {
      console.error('Failed to update task');
    }
  };*/
  const handleToggleComplete = async (id: number) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      const updatedTask = { ...task, isComplete: !task.isComplete };
      // Assuming your backend supports PUT /tasks/:id for updates
      const response = await api.put(`/tasks/${id}`, updatedTask);
      setTasks(tasks.map(t => t.id === id ? response.data : t));
    } catch (err) {
      console.error('Failed to update task');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={logout}>Logout</button>
      <h1>Tasks</h1>
      <form onSubmit={handleCreateTask}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task"
          required
        />
        <button type="submit">Add Task</button>
      </form>
      <ul>
        {tasks.map(task => (
          /*<li key={task.id}>
            <input
              type="checkbox"
              checked={task.isComplete}
              onChange={() => handleToggleComplete(task.id)}
            />
            <span>{task.title}</span>
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </li>*/
          <li key={task.id}>
          <span style={{ textDecoration: task.isComplete ? 'line-through' : 'none' }}>
            {task.title}
          </span>
          <button onClick={() => handleToggleComplete(task.id)}>
            {task.isComplete ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
          <button onClick={() => handleDelete(task.id)}>Delete</button>
        </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
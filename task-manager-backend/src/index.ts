import express, { Request,Response,NextFunction } from 'express';
import jwt,{JwtPayload} from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import knex from 'knex';
import cors from 'cors';
import { AuthenticatedRequest } from './express-types';

const db = knex(require('../knexfile').development);
const app = express();
app.use(express.json());
app.use(cors());

// Auth middleware
const authenticate = (req:AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) 
    {
        res.status(401).send('Access denied');
        return;
    }
         
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { id: number };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Auth routes
app.post('/auth/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const [user] = await db('users').insert({ username, password: hashedPassword }).returning('*');
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);
    res.json({ token });
  } catch (err) {
    res.status(400).send('Username exists');
  }
});
/*
interface LoginRequest extends Request {
    body: {
      username: string;
      password: string;
    };
  }
*/
app.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await db('users').where({ username }).first();
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send('Invalid credentials');
  }
  
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);
  res.json({ token });
});

/*
app.post(
  '/auth/login',
  async (
    req: Request<{}, {}, { username: string; password: string }>,
    res: Response
  ): Promise<void>=> {
    const { username, password } = req.body;
    const user = await db('users').where({ username }).first();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).send('Invalid credentials');
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);
    res.json({ token });
  }
);
*/
// Task routes
app.get('/tasks', authenticate, async (req:AuthenticatedRequest, res: Response) => {
    if (!req.user) {
       res.status(401).send('Unauthorized');
       return;
    }
  const tasks = await db('tasks').where({ userId: req.user.id });
  res.json(tasks);
});

app.post('/tasks', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const [task] = await db('tasks').insert({
    ...req.body,
    userId: (req.user as JwtPayload).id
  }).returning('*');
  res.json(task);
});

// PUT /tasks/:id – Update a task (e.g., mark as complete, edit text)
app.put('/tasks/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).send('Unauthorized');
    return;
  }
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Ensure that only the task belonging to the authenticated user is updated.
    const updatedTasks = await db('tasks')
      .where({ id, userId: req.user.id })
      .update(updateData)
      .returning('*');

    if (updatedTasks.length === 0) {
      res.status(404).send('Task not found');
      return;
    }
    res.json(updatedTasks[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to update task');
  }
});

// DELETE /tasks/:id – Delete a task
app.delete('/tasks/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).send('Unauthorized');
    return;
  }
  const { id } = req.params;

  try {
    // Ensure that the task is only deleted if it belongs to the authenticated user.
    const deletedTasks = await db('tasks')
      .where({ id, userId: req.user.id })
      .del()
      .returning('*');

    if (deletedTasks.length === 0) {
      res.status(404).send('Task not found');
      return;
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to delete task');
  }
});

// Add PUT and DELETE endpoints similarly

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
import { handleAuthentication } from "../utility/auth.js";
import { TaskService } from "../service/taskService.js";
import { decodeUrl } from "../utility/funcUtility.js";
import { tasks } from "../mock-data/taskMock_data.js";

export class TaskController {
  constructor() {
    this.taskService = new TaskService();
  }

  async controller(req, res) {
    const method = req.method;
    const { parsedUrl, pathname,urlSegment } = decodeUrl(req);
    let currentId = tasks.length + 1;

    
    if (pathname === '/tasks' && method === 'POST') {
      let body = '';
    
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
    
     
      req.on('end', () => {
        try {
          const task = JSON.parse(body);
          task.id = currentId++;
          task.history = [];
          task.comments = [];
          task.status = task.status || 'pending';
    
          tasks.push(task);
    
         
          if (!res.headersSent) {
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(task));
          }
        } catch (err) {
         
          if (!res.headersSent) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid JSON' }));
          }
        }
      });
    }

else if (pathname=== '/tasks' && method === 'GET') {
   handleAuthentication(req, res,() => {
    const { status, priority, category } = parsedUrl.query;
    let filteredTasks = tasks;
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    if (category) {
      filteredTasks = filteredTasks.filter(task => task.category === category);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(filteredTasks));
  });
}

//search 
 else if (pathname === '/tasks/search' && method === 'GET') {
  handleAuthentication(req, res, () => {
    const keyword = parsedUrl.query.q ? parsedUrl.query.q.toLowerCase() : '';
    const filteredTasks = tasks.filter(task =>
      (task.title && task.title.toLowerCase().includes(keyword)) ||
      (task.description && task.description.toLowerCase().includes(keyword))
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(filteredTasks));
  });
} 

else if (pathname=== '/tasks/overdue' && method === 'GET') {
  handleAuthentication(req, res,() => {
    const today = new Date();
    const overdueTasks = tasks.filter(task =>
      new Date(task.dueDate) < today && !task.completed
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(overdueTasks));
  });
}

//due-soon
else if (pathname === '/tasks/due-soon' && method === 'GET') {
  handleAuthentication(req, res,() => {
    const days = parseInt(parsedUrl.query.days) || 7; 
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);

    const dueSoonTasks = tasks.filter(task => {
      const taskDueDate = new Date(task.dueDate);
      return taskDueDate >= today && taskDueDate <= endDate;
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dueSoonTasks));
  });
}//get all
 else if 
 (pathname.startsWith('/tasks/') && method === 'GET') {
  const id = parseInt(pathname.split('/')[2]);
  const task = tasks.find(t => t.id === id);
  if (task) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(task));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Task not found' }));
  }
} //updatetask
else if (pathname.startsWith('/tasks/') && method === 'PUT') {
  const id = parseInt(pathname.split('/')[2]);
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const updatedTask = JSON.parse(body);
      const taskIndex = tasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        if (!tasks[taskIndex].history) {
          tasks[taskIndex].history = []; 
        }
        tasks[taskIndex].history.push({
          timestamp: new Date(),
          changes: updatedTask,
          changedBy: 'user123'
        });
        tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tasks[taskIndex]));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task not found' }));
      }
    } catch (err) {
      //res.writeHead(400, { 'Content-Type': 'application/json' });
      //res.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  });
}
//prioorty
 else if (pathname.startsWith('/tasks/') && method === 'PATCH' && pathname.endsWith('/priority')) {
  const id = parseInt(pathname.split('/')[2]);
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const { priority } = JSON.parse(body);
      const task = tasks.find(t => t.id === id);
      if (task) {
        if (!task.history) {
          task.history = []; 
        }
        task.history.push({
          timestamp: new Date(),
          changes: { priority },
          changedBy: 'user123'
        });
        task.priority = priority;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(task));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task not found' }));
      }
    } 
    catch (err) {
     // res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  });
} 
//assign
else if (pathname.startsWith('/tasks/') && method === 'PATCH' && pathname.endsWith('/assign')) {
  const id = parseInt(pathname.split('/')[2]);
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const { assignedTo } = JSON.parse(body);
      const task = tasks.find(t => t.id === id);
      if (task) {
        if (!task.history) {
          task.history = []; 
        }
        task.history.push({
          timestamp: new Date(),
          changes: { assignedTo },
          changedBy: 'user123'
        });
        task.assignedTo = assignedTo;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(task));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task not found' }));
      }
    } catch (err) {
      //res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  });
}

else if(pathname.startsWith('/tasks/') && method === 'POST' && pathname.endsWith('/bulk')) {
  
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const newTasks = JSON.parse(body);

            if (Array.isArray(newTasks)) {
                newTasks.forEach(task => {
                    const newTask = {
                        id: tasks.length + 1, 
                        title: task.title,
                        description: task.description,
                        dueDate: task.dueDate,
                        status: task.status
                    };
                    tasks.push(newTask);
                });

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(tasks)); // Return the list of created tasks
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid request format. Expected an array of tasks.' }));
            }
        } catch (error) {
            //res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid JSON format.' }));
        }
    });

 //archive
}else if (pathname.startsWith('/tasks/') && method === 'PATCH' && pathname.endsWith('/archive')) {
  const id = parseInt(pathname.split('/')[2]);
  const task = tasks.find(t => t.id === id);
  if (task) {
    if (task.completed) {
      if (!task.history) {
        task.history = []; 
      }
      task.history.push({
        timestamp: new Date(),
        changes: { status: 'archived' },
        changedBy: 'user123'
      });
      task.status = 'archived';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(task));
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Task must be completed to be archived' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Task not found' }));
  }
}
//archived
else if (pathname === '/tasks/archived' && method === 'GET') {
  handleAuthentication(req, res,() => {
    const archivedTasks = tasks.filter(task => task.status === 'archived');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(archivedTasks));
  });
}
  //unassign
else if (pathname.startsWith('/tasks/') && method === 'PATCH' && pathname.endsWith('/unassign')) {
  const id = parseInt(pathname.split('/')[2]);
  const task = tasks.find(t => t.id === id);
  if (task) {
    if (!task.history) {
      task.history = []; 
    }
    task.history.push({
      timestamp: new Date(),
      changes: { assignedTo: null },
      changedBy: 'user123'
    });
    task.assignedTo = null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(task));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Task not found' }));
  }
} 
//delete-all
else if (pathname === '/tasks/delete-completed' && method === 'DELETE') {
  handleAuthentication(req, res,() => {
    const initialLength = tasks.length;
    tasks = tasks.filter(task => !task.completed); 
    const deletedCount = initialLength - tasks.length;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count: deletedCount }));
  });

  
}//delete
else if (pathname.startsWith('/tasks/') && method === 'DELETE') {
  const id = parseInt(pathname.split('/')[2]);
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    res.writeHead(204, { 'Content-Type': 'application/json' });
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Task not found' }));
  }
} //catgorize
else if (pathname.startsWith('/tasks/') && method === 'PATCH' && pathname.endsWith('/categorize')) {
  const id = parseInt(pathname.split('/')[2]);
 let body = '';
  req.on('data', chunk => {
   body += chunk.toString();
 });
  req.on('end', () => {
  const { category } = JSON.parse(body);
 const task = tasks.find(t => t.id === id);
  if (task) {
   if (!task.history) {
  task.history = []; 
  }
  task.history.push({
  timestamp: new Date(),
  changes: { category },
   changedBy: 'user123'
  });
  task.category = category;
  //res.writeHead(200, { 'Content-Type': 'application/json' });
 //res.end(JSON.stringify(task));
  } 
 else {
  //res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Task not found' }));
  }
  });
   } //duplicate
   else if (pathname.startsWith('/tasks/') && method === 'POST' && pathname.endsWith('/duplicate')) {
    const id = parseInt(pathname.split('/')[2]);
    const task = tasks.find(t => t.id === id);
    if (task) {
   
   const newTask = { ...task, id: currentId++ };
  
   
   newTask.comments = [];
   newTask.history = [];
   tasks.push(newTask);
  
       
    
  // res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newTask));
    } else {
    // Task with the given ID was not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Task not found' }));
    }
  }//share
  else if (pathname.startsWith('/tasks/') && method === 'POST' && pathname.endsWith('/share')) {
    const id = parseInt(pathname.split('/')[2]);
    const task = tasks.find(t => t.id === id);
  
    if (task) {
   
    const shareableLink = `http://localhost:3000/tasks/${id}/view-only`;
   

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ shareableLink }));
    } else {
   res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Task not found' })); }
  }
  //complete-all
  
  else if (pathname === '/tasks/complete-all' && method === 'PATCH') {
    let updatedTasks = [];
    tasks.forEach(task => {
    if (task.status === 'pending') {
     if (!task.history) {
     task.history = []; 
     }
    task.history.push({
    timestamp: new Date(),
    changes: { status: 'completed' }, changedBy: 'user123' });
    task.status = 'completed';
    updatedTasks.push(task);}
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(updatedTasks));
    }
    
      //history
      else if (pathname.startsWith('/tasks/') && method === 'GET' && pathname.endsWith('/history')) {
        const id = parseInt(pathname.split('/')[2]);
        const task = tasks.find(t => t.id === id);
        if (task) {
          if (task.history && task.history.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(task.history));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'No history available for this task' }));
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Task not found' }));
        }
      }
      
    

else if (pathname.startsWith('/tasks/') && method === 'PATCH' && pathname.endsWith('/complete')) {
const id = parseInt(pathname.split('/')[2]);
const task = tasks.find(t => t.id === id);
if (task) {
 if (!task.history) {
 task.history = []; 
 }
 task.history.push({
 timestamp: new Date(),
 changes: { status: 'completed' },
 changedBy: 'user123'
 });
 task.status = 'completed';
  res.writeHead(200, { 'Content-Type': 'application/json' });
 res.end(JSON.stringify(task));
} 
  
  }


//commenting

else if (pathname.startsWith('/tasks/') && method === 'POST' && pathname.endsWith('/comments')) {
  const id = parseInt(pathname.split('/')[2]);
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const { comment, commentedBy } = JSON.parse(body);
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.comments = [];
      task.comments.push({ comment, commentedBy, timestamp: new Date() });
      //res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(task));
    } else {
     // res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Task not found' }));
    }
  });

}
else {
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Endpoint not found' }));
}
}
}
import { TaskRepository } from "../Repository/taskRepository.js";
//import { tasks } from "../mock-data/taskMock_data.js";


export class TaskService {
  async getAllTasks() {
    try {
      const tasks = await TaskRepository.findAll();
      return tasks;
    } catch (error) {
      throw new Error('Error fetching tasks');
    }
  }

  // Fetch a task by ID
  async getTaskById(id) {
    try {
      const task = await TaskRepository.findById(id);
      if (!task) {
        throw new Error('Task not found');
      }
      return task;
    } catch (error) {
      throw new Error('Error fetching task');
    }
  }

  // Create a new task
  async createTask(taskData) {
    try {
      const task = await TaskRepository.create(taskData);
      return task;
    } catch (error) {
      throw new Error('Error creating task');
    }
  }

  // Update an existing task
  async updateTask(id, taskData) {
    try {
      const updatedTask = await TaskRepository.update(id, taskData);
      if (!updatedTask) {
        throw new Error('Task not found or failed to update');
      }
      return updatedTask;
    } catch (error) {
      throw new Error('Error updating task');
    }
  }

  // Delete a task
  async deleteTask(id) {
    try {
      const result = await TaskRepository.delete(id);
      if (!result) {
        throw new Error('Task not found or failed to delete');
      }
      return result;
    } catch (error) {
      throw new Error('Error deleting task');
    }
  }
}
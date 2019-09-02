import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockUser = { username: 'Test user', id: 12 };

// This is my factory function.
const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRespository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();

    // Casting the type because we know thats what
    // it should look like
    tasksService = await module.get<TasksService>(TasksService);
    taskRespository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      taskRespository.getTasks.mockResolvedValue('someValue');

      expect(taskRespository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query',
      };
      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRespository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
      const mockTask = {
        title: 'Test task',
        description: 'Test desc',
      };

      taskRespository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRespository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUser.id,
        },
      });
    });
    it('throws an error if it cannot find the task', () => {
      taskRespository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('calls TaskRepository.create() and returns the result', async () => {
      expect(taskRespository.createTask).not.toHaveBeenCalled();
      const mockTask = {
        title: 'Test task',
        description: 'Test desc',
      };

      taskRespository.createTask.mockResolvedValue({ ...mockTask, id: 1 });

      const result = await tasksService.createTask(mockTask, mockUser);
      expect(result).toEqual({ ...mockTask, id: 1 });
      expect(taskRespository.createTask).toHaveBeenCalledWith(
        mockTask,
        mockUser,
      );
    });
  });

  describe('deleteTask', () => {
    it('calls TaskRepository.delete() and returns nothing', async () => {
      const mockId = 3;
      taskRespository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRespository.delete).not.toHaveBeenCalled();

      await tasksService.deleteTask(mockId, mockUser);
      expect(taskRespository.delete).toHaveBeenCalledWith({
        id: mockId,
        userId: mockUser.id,
      });
    });

    it('throws an error when task can not be found', () => {
      taskRespository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('calls this.getTaskById, updates the status and successfully returns the task', async () => {
      const save = jest.fn().mockResolvedValue({
        id: 1,
        status: TaskStatus.IN_PROGRESS,
        title: 'do it',
        description: 'a description',
      });
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });
      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();

      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser,
      );
      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});

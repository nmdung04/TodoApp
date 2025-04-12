import { create } from 'zustand';

const useStore = create((set) => ({
  tasks: [],
  columns: [
    { id: 'todo', title: 'To Do' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ],
  
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),
  
  handleDelete: (taskId) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== taskId)
  })),

  reorderTasks: (sourceIndex, destinationIndex, status) => set((state) => {
    const filteredTasks = state.tasks.filter(task => task.status === status);
    const taskToMove = filteredTasks[sourceIndex];
    const newFilteredTasks = Array.from(filteredTasks);
    newFilteredTasks.splice(sourceIndex, 1);
    newFilteredTasks.splice(destinationIndex, 0, taskToMove);
    
    const otherTasks = state.tasks.filter(task => task.status !== status);
    return {
      tasks: [...otherTasks, ...newFilteredTasks]
    };
  }),

  editColumn: (columnId, newTitle) => set((state) => ({
    columns: state.columns.map(col =>
      col.id === columnId ? { ...col, title: newTitle } : col
    )
  }))
}));

export default useStore;
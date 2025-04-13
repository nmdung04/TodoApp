'use client';

import { useState } from 'react';
import styles from './page.module.css';
import useStore from './store';
import Header from './components/Header/Header';

export default function Home() {
  const { tasks = [], setTasks, handleDelete, columns, editColumn, reorderTasks, addColumn, deleteColumn } = useStore();
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [activeAddForm, setActiveAddForm] = useState(null);
  const [showDeleteButton, setShowDeleteButton] = useState(null);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);

  const handleDragStart = (e, task, index) => {
    e.currentTarget.classList.add(styles.dragging);
    e.dataTransfer.setData('text/plain', JSON.stringify({ task, index }));
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove(styles.dragging);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    const column = e.currentTarget;
    column.classList.add(styles.dragOver);
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove(styles.dragOver);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles.dragOver);
    
    const { task: draggedTask, index: sourceIndex } = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (draggedTask.status === newStatus) {
      const columnTasks = tasks.filter(t => t.status === newStatus);
      const dropTarget = e.target.closest(`.${styles.todoItem}`);
      let destinationIndex = columnTasks.length;

      if (dropTarget) {
        const dropTaskId = dropTarget.getAttribute('data-task-id');
        destinationIndex = columnTasks.findIndex(t => t.id === dropTaskId);
        if (destinationIndex > sourceIndex) {
          destinationIndex++;
        }
      }

      reorderTasks(sourceIndex, destinationIndex, newStatus);
    } else {
      const updatedTasks = tasks.map(task =>
        task.id === draggedTask.id ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);
    }
  };

  const handleColumnDragStart = (e, columnId) => {
    setIsDraggingColumn(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'column', columnId }));
    e.currentTarget.classList.add(styles.dragging);
  };

  const handleColumnDragEnd = (e) => {
    setIsDraggingColumn(false);
    e.currentTarget.classList.remove(styles.dragging);
    document.querySelector(`.${styles.deleteZone}`).classList.remove(styles.active);
  };

  const handleDeleteZoneDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add(styles.dragOver);
  };

  const handleDeleteZoneDragLeave = (e) => {
    e.currentTarget.classList.remove(styles.dragOver);
  };

  const handleDeleteZoneDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles.dragOver);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'column') {
        deleteColumn(data.columnId);
      }
    } catch (err) {
      console.error('Failed to parse drag data:', err);
    }
  };

  const handleAddItem = (status) => {
    if (newItemTitle.trim()) {
      const newTask = {
        id: Date.now().toString(),
        title: newItemTitle,
        description: newItemDescription,
        status,
      };
      setTasks([...tasks, newTask]);
      setNewItemTitle('');
      setNewItemDescription('');
      setActiveAddForm(null);
    }
  };

  const handleEditColumnTitle = (columnId, title) => {
    setEditingColumnId(columnId);
    setEditingTitle(title);
  };

  const saveColumnTitle = (columnId) => {
    if (editingTitle.trim()) {
      editColumn(columnId, editingTitle);
    }
    setEditingColumnId(null);
  };

  const handleContextMenu = (e, taskId) => {
    e.preventDefault();
    setShowDeleteButton(showDeleteButton === taskId ? null : taskId);
  };

  const renderColumn = (column) => {
    const columnTasks = tasks.filter(task => task.status === column.id);
    
    return (
      <div 
        key={column.id}
        className={styles.column}
        onDragOver={(e) => handleDragOver(e, column.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, column.id)}
      >
        <div 
          className={styles.dragArea}
          draggable="true"
          onDragStart={(e) => handleColumnDragStart(e, column.id)}
          onDragEnd={handleColumnDragEnd}
        />
        <div className={styles.columnHeader}>
          {editingColumnId === column.id ? (
            <input
              type="text"
              className={styles.input}
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => saveColumnTitle(column.id)}
              onKeyPress={(e) => e.key === 'Enter' && saveColumnTitle(column.id)}
              autoFocus
            />
          ) : (
            <h2 
              className={styles.columnTitle}
              onClick={() => handleEditColumnTitle(column.id, column.title)}
            >
              {column.title}
            </h2>
          )}
        </div>
        
        {columnTasks.map((task, index) => (
          <div
            key={task.id}
            data-task-id={task.id}
            className={styles.todoItem}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, task, index)}
            onDragEnd={handleDragEnd}
            onContextMenu={(e) => handleContextMenu(e, task.id)}
          >
            <div className={styles.todoItemHeader}>
              <span className={styles.todoTitle}>{task.title}</span>
              {showDeleteButton === task.id && (
                <button
                  className={styles.deleteButton}
                  onClick={() => {
                    handleDelete(task.id);
                    setShowDeleteButton(null);
                  }}
                >
                  ×
                </button>
              )}
            </div>
            {task.description && (
              <div className={styles.todoDescription}>{task.description}</div>
            )}
          </div>
        ))}

        {!activeAddForm || activeAddForm !== column.id ? (
          <div className={styles.addTaskContainer}>
            <button 
              className={styles.addButton}
              onClick={() => setActiveAddForm(column.id)}
            >
              Add Task
            </button>
          </div>
        ) : (
          <>
            <div className={styles.addTaskContainer} />
            <div className={`${styles.addItemForm} ${styles.visible}`}>
              <input
                type="text"
                placeholder="Add new item title"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Add description (optional)"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                className={styles.input}
              />
              <div className={styles.buttonContainer}>
                <button
                  onClick={() => handleAddItem(column.id)}
                  className={styles.button}
                >
                  Add Item
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setActiveAddForm(null)}
                >
                  ×
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className={styles.board}>
        {columns.map(column => renderColumn(column))}
        <button className={styles.addColumnButton} onClick={addColumn}>
          + Add Column
        </button>
      </div>
      <div 
        className={`${styles.deleteZone} ${isDraggingColumn ? styles.active : ''}`}
        onDragOver={handleDeleteZoneDragOver}
        onDragLeave={handleDeleteZoneDragLeave}
        onDrop={handleDeleteZoneDrop}
      >
        Drop column here to delete
      </div>
    </>
  );
}

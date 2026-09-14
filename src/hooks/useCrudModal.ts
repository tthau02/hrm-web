import { useState, useCallback } from 'react';

export interface UseCrudModalReturn<T> {
  // View Drawer State
  viewOpen: boolean;
  selectedRecord: T | null;
  setViewOpen: (open: boolean) => void;
  setSelectedRecord: (record: T | null) => void;
  handleOpenView: (record: T) => void;
  handleCloseView: () => void;

  // Form Drawer State
  formOpen: boolean;
  editingRecord: T | null;
  isEdit: boolean;
  setFormOpen: (open: boolean) => void;
  setEditingRecord: (record: T | null) => void;
  handleOpenAdd: () => void;
  handleOpenEdit: (record: T) => void;
  handleCloseForm: () => void;

  // Detail Navigation (Next / Previous)
  handleNavigate: (index: number, records: T[]) => void;

  // Sync viewed record after updating
  syncUpdatedRecord: (updated: Partial<T> & Record<string, any>, idKey?: keyof T) => void;
}

/**
 * useCrudModal<T>
 * Reusable hook that handles standard CRUD state for list pages:
 * - View drawer state (selectedRecord, viewOpen)
 * - Form drawer state (editingRecord, isEdit, formOpen)
 * - Record navigation (Next/Prev in view drawer)
 * - Record synchronization on save
 */
export function useCrudModal<T extends Record<string, any>>(): UseCrudModalReturn<T> {
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<T | null>(null);

  const isEdit = Boolean(editingRecord);

  const handleOpenAdd = useCallback(() => {
    setEditingRecord(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((record: T) => {
    setEditingRecord(record);
    setFormOpen(true);
  }, []);

  const handleOpenView = useCallback((record: T) => {
    setSelectedRecord(record);
    setViewOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewOpen(false);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingRecord(null);
  }, []);

  const handleNavigate = useCallback((index: number, records: T[]) => {
    if (records && records[index]) {
      setSelectedRecord(records[index]);
    }
  }, []);

  const syncUpdatedRecord = useCallback(
    (updated: Partial<T> & Record<string, any>, idKey: keyof T = 'id' as keyof T) => {
      setSelectedRecord((prev) => {
        if (!prev) return null;
        if (prev[idKey] === updated[idKey]) {
          return { ...prev, ...updated };
        }
        return prev;
      });
    },
    []
  );

  return {
    viewOpen,
    selectedRecord,
    setViewOpen,
    setSelectedRecord,
    handleOpenView,
    handleCloseView,
    formOpen,
    editingRecord,
    isEdit,
    setFormOpen,
    setEditingRecord,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseForm,
    handleNavigate,
    syncUpdatedRecord,
  };
}

export default useCrudModal;

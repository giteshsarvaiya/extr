import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  created_at: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  loading: boolean;
  addExpense: (amount: number, description: string, date?: string) => Promise<void>;
  updateExpense: (id: string, amount: number, description: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getTotalForPeriod: (startDate: Date, endDate: Date) => number;
  refreshExpenses: () => Promise<void>;
  clearAllExpenses: () => Promise<void>; // ADDED: Function to clear all expenses
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const savedExpenses = await AsyncStorage.getItem('expenses');
      if (savedExpenses) {
        const parsedExpenses = JSON.parse(savedExpenses);
        setExpenses(parsedExpenses.sort((a: Expense, b: Expense) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = async (expensesToSave: Expense[]) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(expensesToSave));
    } catch (error) {
      console.error('Error saving expenses:', error);
      throw error;
    }
  };

  // FIXED: Accept optional date parameter for expense creation
  const addExpense = async (amount: number, description: string, date?: string) => {
    try {
      const newExpense: Expense = {
        id: generateId(),
        amount,
        description,
        created_at: date || new Date().toISOString(), // Use provided date or current time
      };

      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);
      await saveExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const updateExpense = async (id: string, amount: number, description: string) => {
    try {
      const updatedExpenses = expenses.map(expense =>
        expense.id === id ? { ...expense, amount, description } : expense
      );
      setExpenses(updatedExpenses);
      await saveExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      setExpenses(updatedExpenses);
      await saveExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  const getTotalForPeriod = (startDate: Date, endDate: Date): number => {
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.created_at);
        return expenseDate >= startDate && expenseDate <= endDate;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const refreshExpenses = async () => {
    await loadExpenses();
  };

  // ADDED: Function to clear all expenses
  const clearAllExpenses = async () => {
    try {
      setExpenses([]);
      await AsyncStorage.removeItem('expenses');
      if (__DEV__) {
        console.log('All expenses cleared');
      }
    } catch (error) {
      console.error('Error clearing expenses:', error);
      throw error;
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        addExpense,
        updateExpense,
        deleteExpense,
        getTotalForPeriod,
        refreshExpenses,
        clearAllExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
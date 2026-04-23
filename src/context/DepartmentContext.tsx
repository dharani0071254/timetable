import React, { createContext, useContext, useState, useEffect } from 'react';
import { departmentApi } from '../services/api';

interface Department {
  _id: string;
  name: string;
  description?: string;
}

interface DepartmentContextType {
  departments: Department[];
  selectedDepartment: Department | null;
  setSelectedDepartment: (dept: Department | null) => void;
  refreshDepartments: () => Promise<void>;
  loading: boolean;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      setDepartments(res.data);
      
      // If no department selected, select the first one if available
      if (res.data.length > 0 && !selectedDepartment) {
        const savedDeptId = localStorage.getItem('selectedDepartmentId');
        const savedDept = res.data.find((d: Department) => d._id === savedDeptId);
        setSelectedDepartment(savedDept || res.data[0]);
      } else if (res.data.length === 0) {
        setSelectedDepartment(null);
      }
    } catch (err) {
      console.error('Failed to fetch departments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      localStorage.setItem('selectedDepartmentId', selectedDepartment._id);
    }
  }, [selectedDepartment]);

  return (
    <DepartmentContext.Provider value={{ 
      departments, 
      selectedDepartment, 
      setSelectedDepartment, 
      refreshDepartments,
      loading 
    }}>
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return context;
};

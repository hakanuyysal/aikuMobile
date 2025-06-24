import { create } from 'zustand';
import { Company } from '../services/companyService';

interface CompanyState {
  companies: Company[];
  addCompany: (company: Company) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  getCompaniesByUserId: (userId: string) => Company[];
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  addCompany: (company) => set((state) => ({ 
    companies: [...state.companies, company] 
  })),
  updateCompany: (id, updatedCompany) => set((state) => ({
    companies: state.companies.map((company) =>
      company._id === id ? { ...company, ...updatedCompany } : company
    ),
  })),
  deleteCompany: (id) => set((state) => ({
    companies: state.companies.filter((company) => company._id !== id),
  })),
  getCompaniesByUserId: (userId) => {
    return get().companies.filter((company) => company.userId === userId);
  },
})); 
import { useState, useCallback, useEffect } from "react";
import {
  getLeads,
  addLead as supabaseAddLead,
  updateLead as supabaseUpdateLead,
  deleteLead as supabaseDeleteLead,
  getSalespersons,
  addSalesperson as supabaseAddSalesperson,
  updateSalesperson as supabaseUpdateSalesperson,
  deleteSalesperson as supabaseDeleteSalesperson,
} from "@/lib/supabase-db";

export interface Lead {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  email: string;
  phoneNumbers: string[];
  actions: string[];
  links: string[];
  locations: string[];
  companyEmployees: string;
  companyIndustries: string[];
  companyKeywords: string[];
  createdAt: string;
}

export interface Salesperson {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

export function useCRMStore() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [leadsData, salespersonsData] = await Promise.all([
          getLeads(),
          getSalespersons(),
        ]);
        setLeads(leadsData);
        setSalespersons(salespersonsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addLead = useCallback(async (lead: Omit<Lead, "id" | "createdAt">) => {
    try {
      const newLead = await supabaseAddLead(lead);
      setLeads((prevLeads) => [newLead, ...prevLeads]);
      return newLead;
    } catch (error) {
      console.error("Error adding lead:", error);
      throw error;
    }
  }, []);

  const updateLead = useCallback(
    async (id: string, updates: Partial<Lead>) => {
      try {
        await supabaseUpdateLead(id, updates);
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.id === id ? { ...lead, ...updates } : lead
          )
        );
      } catch (error) {
        console.error("Error updating lead:", error);
        throw error;
      }
    },
    []
  );

  const deleteLead = useCallback(async (id: string) => {
    try {
      await supabaseDeleteLead(id);
      setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== id));
    } catch (error) {
      console.error("Error deleting lead:", error);
      throw error;
    }
  }, []);

  const addSalesperson = useCallback(
    async (salesperson: Omit<Salesperson, "id" | "createdAt">) => {
      try {
        const newSalesperson = await supabaseAddSalesperson(salesperson);
        setSalespersons((prevSalespersons) => [
          newSalesperson,
          ...prevSalespersons,
        ]);
        return newSalesperson;
      } catch (error) {
        console.error("Error adding salesperson:", error);
        throw error;
      }
    },
    []
  );

  const updateSalesperson = useCallback(
    async (id: string, updates: Partial<Salesperson>) => {
      try {
        await supabaseUpdateSalesperson(id, updates);
        setSalespersons((prevSalespersons) =>
          prevSalespersons.map((sp) =>
            sp.id === id ? { ...sp, ...updates } : sp
          )
        );
      } catch (error) {
        console.error("Error updating salesperson:", error);
        throw error;
      }
    },
    []
  );

  const deleteSalesperson = useCallback(async (id: string) => {
    try {
      await supabaseDeleteSalesperson(id);
      setSalespersons((prevSalespersons) =>
        prevSalespersons.filter((sp) => sp.id !== id)
      );
    } catch (error) {
      console.error("Error deleting salesperson:", error);
      throw error;
    }
  }, []);

  return {
    leads,
    salespersons,
    isLoading,
    addLead,
    updateLead,
    deleteLead,
    addSalesperson,
    updateSalesperson,
    deleteSalesperson,
  };
}

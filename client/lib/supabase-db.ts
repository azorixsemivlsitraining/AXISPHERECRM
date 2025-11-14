import { supabase } from "./supabase";
import { Lead, Salesperson } from "@/hooks/useCRMStore";

// LEADS OPERATIONS
export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error.message, error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    jobTitle: item.job_title,
    company: item.company,
    email: item.email,
    phoneNumbers: item.phone_numbers || [],
    actions: item.actions || [],
    links: item.links || [],
    locations: item.locations || [],
    companyEmployees: item.company_employees,
    companyIndustries: item.company_industries || [],
    companyKeywords: item.company_keywords || [],
    createdAt: item.created_at,
  }));
}

export async function addLead(lead: Omit<Lead, "id" | "createdAt">) {
  const { data, error } = await supabase
    .from("leads")
    .insert([
      {
        name: lead.name,
        job_title: lead.jobTitle,
        company: lead.company,
        email: lead.email,
        phone_numbers: lead.phoneNumbers,
        actions: lead.actions,
        links: lead.links,
        locations: lead.locations,
        company_employees: lead.companyEmployees,
        company_industries: lead.companyIndustries,
        company_keywords: lead.companyKeywords,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding lead:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    jobTitle: data.job_title,
    company: data.company,
    email: data.email,
    phoneNumbers: data.phone_numbers,
    actions: data.actions,
    links: data.links,
    locations: data.locations,
    companyEmployees: data.company_employees,
    companyIndustries: data.company_industries,
    companyKeywords: data.company_keywords,
    createdAt: data.created_at,
  };
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.jobTitle !== undefined) updateData.job_title = updates.jobTitle;
  if (updates.company !== undefined) updateData.company = updates.company;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phoneNumbers !== undefined) updateData.phone_numbers = updates.phoneNumbers;
  if (updates.actions !== undefined) updateData.actions = updates.actions;
  if (updates.links !== undefined) updateData.links = updates.links;
  if (updates.locations !== undefined) updateData.locations = updates.locations;
  if (updates.companyEmployees !== undefined) updateData.company_employees = updates.companyEmployees;
  if (updates.companyIndustries !== undefined) updateData.company_industries = updates.companyIndustries;
  if (updates.companyKeywords !== undefined) updateData.company_keywords = updates.companyKeywords;

  const { error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
}

// SALESPERSONS OPERATIONS
export async function getSalespersons(): Promise<Salesperson[]> {
  const { data, error } = await supabase
    .from("salespersons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching salespersons:", error.message, error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phoneNumber: item.phone_number,
    createdAt: item.created_at,
  }));
}

export async function addSalesperson(salesperson: Omit<Salesperson, "id" | "createdAt">) {
  const { data, error } = await supabase
    .from("salespersons")
    .insert([
      {
        name: salesperson.name,
        email: salesperson.email,
        phone_number: salesperson.phoneNumber,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding salesperson:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phoneNumber: data.phone_number,
    createdAt: data.created_at,
  };
}

export async function updateSalesperson(id: string, updates: Partial<Salesperson>) {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber;

  const { error } = await supabase
    .from("salespersons")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating salesperson:", error);
    throw error;
  }
}

export async function deleteSalesperson(id: string) {
  const { error } = await supabase
    .from("salespersons")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting salesperson:", error);
    throw error;
  }
}

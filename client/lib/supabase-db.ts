import { supabase } from "./supabase";
import { Lead, Salesperson } from "@/hooks/useCRMStore";
import { ApolloCompany } from "./apollo";

export interface Company {
  id: string;
  apolloId?: string;
  name: string;
  domain: string;
  industry: string;
  employeeCount?: number;
  employeeCountRange?: string;
  revenue?: number;
  revenueRange?: string;
  logoUrl?: string;
  linkedinUrl?: string;
  crunchbaseUrl?: string;
  foundedYear?: number;
  hqAddress?: string;
  countries?: string[];
  website?: string;
  phone?: string;
  createdAt: string;
}

export interface SavedCompany {
  id: string;
  apolloId: string;
  companyName: string;
  savedAt: string;
  syncStatus: string;
  createdAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  description: string;
  status?: string;
  createdAt: string;
  createdBy?: string;
}

// LEADS OPERATIONS
export async function getLeads(): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Error fetching leads - Code:",
        error.code,
        "Message:",
        error.message,
        "Details:",
        error.details,
      );
      return [];
    }

    if (!data) return [];

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
      assignedTo: item.assigned_to,
      status: item.status || "No Stage",
      note: item.note,
      nextReminderDate: item.next_reminder_date,
      createdAt: item.created_at,
    }));
  } catch (err) {
    console.error("Exception fetching leads:", err);
    return [];
  }
}

export async function addLead(lead: Omit<Lead, "id" | "createdAt">) {
  try {
    const insertData: any = {
      name: lead.name,
      job_title: lead.jobTitle,
      company: lead.company,
      email: lead.email,
      phone_numbers: lead.phoneNumbers.filter((p) => p),
      actions: lead.actions.filter((a) => a),
      links: lead.links.filter((l) => l),
      locations: lead.locations.filter((l) => l),
      company_employees: lead.companyEmployees,
      company_industries: lead.companyIndustries.filter((i) => i),
      company_keywords: lead.companyKeywords.filter((k) => k),
    };

    if (lead.assignedTo) {
      insertData.assigned_to = lead.assignedTo;
    }
    if (lead.status) {
      insertData.status = lead.status;
    } else {
      insertData.status = "No Stage";
    }
    if (lead.note) {
      insertData.note = lead.note;
    }
    if (lead.nextReminderDate) {
      insertData.next_reminder_date = lead.nextReminderDate;
    }

    const { data, error } = await supabase
      .from("leads")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      const errorMsg = error.message || error.code || "Unknown error";
      console.error("Error adding lead:", error);
      throw new Error(`Failed to add lead: ${errorMsg}`);
    }

    if (!data) {
      throw new Error("No data returned from insert");
    }

    return {
      id: data.id,
      name: data.name,
      jobTitle: data.job_title,
      company: data.company,
      email: data.email,
      phoneNumbers: data.phone_numbers || [],
      actions: data.actions || [],
      links: data.links || [],
      locations: data.locations || [],
      companyEmployees: data.company_employees,
      companyIndustries: data.company_industries || [],
      companyKeywords: data.company_keywords || [],
      assignedTo: data.assigned_to,
      status: data.status || "No Stage",
      note: data.note,
      nextReminderDate: data.next_reminder_date,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error("Exception adding lead:", err);
    throw err;
  }
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  try {
    // Use server-side endpoint to bypass RLS restrictions
    const response = await fetch("/api/leads/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId: id,
        updates,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(`Failed to parse response: ${String(parseError)}`);
    }

    if (!response.ok) {
      const errorMessage = data.details || data.error || "Unknown error";
      console.error("Error updating lead:", errorMessage);
      throw new Error(`Failed to update lead: ${errorMessage}`);
    }

    if (!data.success) {
      throw new Error(data.error || "Failed to update lead");
    }
  } catch (err) {
    console.error("Exception updating lead:", err);
    throw err;
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
  try {
    const { data, error } = await supabase
      .from("salespersons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Error fetching salespersons - Code:",
        error.code,
        "Message:",
        error.message,
        "Details:",
        error.details,
      );
      return [];
    }

    if (!data) return [];

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phoneNumber: item.phone_number,
      createdAt: item.created_at,
    }));
  } catch (err) {
    console.error("Exception fetching salespersons:", err);
    return [];
  }
}

export async function addSalesperson(
  salesperson: Omit<Salesperson, "id" | "createdAt"> & { authId?: string },
) {
  try {
    const { data, error } = await supabase
      .from("salespersons")
      .insert([
        {
          name: salesperson.name,
          email: salesperson.email,
          phone_number: salesperson.phoneNumber,
          auth_id: salesperson.authId,
        },
      ])
      .select()
      .single();

    if (error) {
      const errorMsg = error.message || error.code || "Unknown error";
      console.error(
        "Error adding salesperson - Code:",
        error.code,
        "Message:",
        errorMsg,
      );
      throw new Error(`Failed to add salesperson: ${errorMsg}`);
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phoneNumber: data.phone_number,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error("Exception adding salesperson:", err);
    throw err;
  }
}

export async function updateSalesperson(
  id: string,
  updates: Partial<Salesperson>,
) {
  const updateData: any = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phoneNumber !== undefined)
    updateData.phone_number = updates.phoneNumber;

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
  try {
    // Use server-side endpoint to bypass RLS restrictions
    const response = await fetch("/api/salespersons/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        salespersonId: id,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(`Failed to parse response: ${String(parseError)}`);
    }

    if (!response.ok) {
      const errorMessage = data.details || data.error || "Unknown error";
      console.error("Error deleting salesperson:", errorMessage);
      throw new Error(`Failed to delete salesperson: ${errorMessage}`);
    }

    if (!data.success) {
      throw new Error(data.error || "Failed to delete salesperson");
    }
  } catch (error) {
    console.error("Exception deleting salesperson:", error);
    throw error;
  }
}

// COMPANIES OPERATIONS
export async function getCompanies(): Promise<Company[]> {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Error fetching companies - Code:",
        error.code,
        "Message:",
        error.message,
      );
      return [];
    }

    if (!data) return [];

    return (data || []).map((item: any) => ({
      id: item.id,
      apolloId: item.apollo_id,
      name: item.name,
      domain: item.domain,
      industry: item.industry,
      employeeCount: item.employee_count,
      employeeCountRange: item.employee_count_range,
      revenue: item.revenue,
      revenueRange: item.revenue_range,
      logoUrl: item.logo_url,
      linkedinUrl: item.linkedin_url,
      crunchbaseUrl: item.crunchbase_url,
      foundedYear: item.founded_year,
      hqAddress: item.hq_address,
      countries: item.countries,
      website: item.website,
      phone: item.phone,
      createdAt: item.created_at,
    }));
  } catch (err) {
    console.error("Exception fetching companies:", err);
    return [];
  }
}

export async function addCompany(
  apolloCompany: ApolloCompany,
): Promise<Company> {
  try {
    // Check if company already exists
    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .eq("apollo_id", apolloCompany.id)
      .single();

    if (existing) {
      // Return existing company
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("apollo_id", apolloCompany.id)
        .single();

      return mapCompanyData(data);
    }

    // Add new company
    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          apollo_id: apolloCompany.id,
          name: apolloCompany.name,
          domain: apolloCompany.domain,
          industry: apolloCompany.industry,
          employee_count: apolloCompany.employee_count,
          employee_count_range: apolloCompany.employee_count_range,
          revenue: apolloCompany.revenue,
          revenue_range: apolloCompany.revenue_range,
          logo_url: apolloCompany.logo_url,
          linkedin_url: apolloCompany.linkedin_url,
          crunchbase_url: apolloCompany.crunchbase_url,
          founded_year: apolloCompany.founded_year,
          hq_address: apolloCompany.hq_address,
          countries: apolloCompany.countries,
          website: apolloCompany.website,
          phone: apolloCompany.phone,
        },
      ])
      .select()
      .single();

    if (error) {
      const errorMsg = error.message || error.code || "Unknown error";
      console.error("Error adding company:", error);
      throw new Error(`Failed to add company: ${errorMsg}`);
    }

    return mapCompanyData(data);
  } catch (err) {
    console.error("Exception adding company:", err);
    throw err;
  }
}

export async function deleteCompany(id: string) {
  try {
    const { error } = await supabase.from("companies").delete().eq("id", id);

    if (error) {
      console.error("Error deleting company:", error);
      throw error;
    }
  } catch (err) {
    console.error("Exception deleting company:", err);
    throw err;
  }
}

function mapCompanyData(data: any): Company {
  return {
    id: data.id,
    apolloId: data.apollo_id,
    name: data.name,
    domain: data.domain,
    industry: data.industry,
    employeeCount: data.employee_count,
    employeeCountRange: data.employee_count_range,
    revenue: data.revenue,
    revenueRange: data.revenue_range,
    logoUrl: data.logo_url,
    linkedinUrl: data.linkedin_url,
    crunchbaseUrl: data.crunchbase_url,
    foundedYear: data.founded_year,
    hqAddress: data.hq_address,
    countries: data.countries,
    website: data.website,
    phone: data.phone,
    createdAt: data.created_at,
  };
}

// SAVED COMPANIES OPERATIONS
export async function getSavedCompanies(): Promise<SavedCompany[]> {
  try {
    const { data, error } = await supabase
      .from("saved_companies")
      .select("*")
      .order("saved_at", { ascending: false });

    if (error) {
      console.error(
        "Error fetching saved companies - Code:",
        error.code,
        "Message:",
        error.message,
      );
      return [];
    }

    if (!data) return [];

    return (data || []).map((item: any) => ({
      id: item.id,
      apolloId: item.apollo_id,
      companyName: item.company_name,
      savedAt: item.saved_at,
      syncStatus: item.sync_status,
      createdAt: item.created_at,
    }));
  } catch (err) {
    console.error("Exception fetching saved companies:", err);
    return [];
  }
}

export async function addSavedCompany(
  apolloId: string,
  companyName: string,
): Promise<SavedCompany> {
  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from("saved_companies")
      .select("id")
      .eq("apollo_id", apolloId)
      .single();

    if (existing) {
      const { data } = await supabase
        .from("saved_companies")
        .select("*")
        .eq("apollo_id", apolloId)
        .single();
      return mapSavedCompanyData(data);
    }

    // Add new saved company
    const { data, error } = await supabase
      .from("saved_companies")
      .insert([
        {
          apollo_id: apolloId,
          company_name: companyName,
          sync_status: "synced",
        },
      ])
      .select()
      .single();

    if (error) {
      const errorMsg = error.message || error.code || "Unknown error";
      console.error("Error adding saved company:", error);
      throw new Error(`Failed to add saved company: ${errorMsg}`);
    }

    return mapSavedCompanyData(data);
  } catch (err) {
    console.error("Exception adding saved company:", err);
    throw err;
  }
}

export async function deleteSavedCompany(apolloId: string) {
  try {
    const { error } = await supabase
      .from("saved_companies")
      .delete()
      .eq("apollo_id", apolloId);

    if (error) {
      console.error("Error deleting saved company:", error);
      throw error;
    }
  } catch (err) {
    console.error("Exception deleting saved company:", err);
    throw err;
  }
}

export async function syncSavedCompanies(
  companies: Array<{ apolloId: string; companyName: string }>,
) {
  try {
    const syncPromises = companies.map((company) =>
      addSavedCompany(company.apolloId, company.companyName),
    );
    await Promise.all(syncPromises);
    return true;
  } catch (err) {
    console.error("Exception syncing saved companies:", err);
    throw err;
  }
}

function mapSavedCompanyData(data: any): SavedCompany {
  return {
    id: data.id,
    apolloId: data.apollo_id,
    companyName: data.company_name,
    savedAt: data.saved_at,
    syncStatus: data.sync_status,
    createdAt: data.created_at,
  };
}

// LEAD NOTES OPERATIONS
export async function getLeadNotes(leadId: string): Promise<LeadNote[]> {
  try {
    const { data, error } = await supabase
      .from("lead_notes")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching lead notes:", error);
      return [];
    }

    if (!data) return [];

    return (data || []).map((item: any) => ({
      id: item.id,
      leadId: item.lead_id,
      description: item.description,
      status: item.status,
      createdAt: item.created_at,
      createdBy: item.created_by,
    }));
  } catch (err) {
    console.error("Exception fetching lead notes:", err);
    return [];
  }
}

export async function addLeadNote(
  leadId: string,
  description: string,
  status?: string,
): Promise<LeadNote> {
  try {
    const { data, error } = await supabase
      .from("lead_notes")
      .insert([
        {
          lead_id: leadId,
          description,
          status,
        },
      ])
      .select()
      .single();

    if (error) {
      const errorMsg = error.message || error.code || "Unknown error";
      console.error("Error adding lead note:", error);
      throw new Error(`Failed to add lead note: ${errorMsg}`);
    }

    return {
      id: data.id,
      leadId: data.lead_id,
      description: data.description,
      status: data.status,
      createdAt: data.created_at,
      createdBy: data.created_by,
    };
  } catch (err) {
    console.error("Exception adding lead note:", err);
    throw err;
  }
}

export async function deleteLeadNote(noteId: string) {
  try {
    const { error } = await supabase
      .from("lead_notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      console.error("Error deleting lead note:", error);
      throw error;
    }
  } catch (err) {
    console.error("Exception deleting lead note:", err);
    throw err;
  }
}

// PACKAGES AND INVOICES

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  createdAt: string;
}

export interface InvoiceFeature {
  name: string;
  included: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  scope: InvoiceFeature[];
  paidAmount: number;
  additionalNotes: string;
  taxPercentage: number;
  createdAt: string;
}

// INVOICE OPERATIONS
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invoices:", error);
      return [];
    }

    if (!data) return [];

    return (data || []).map((item: any) => ({
      id: item.id,
      invoiceNumber: item.invoice_number,
      fullName: item.full_name,
      email: item.email,
      phoneNumber: item.phone_number,
      companyName: item.company_name,
      packageId: item.package_id,
      packageName: item.package_name,
      packagePrice: item.package_price,
      scope: item.scope || [],
      paidAmount: item.paid_amount,
      additionalNotes: item.additional_notes,
      taxPercentage: item.tax_percentage || 18,
      createdAt: item.created_at,
    }));
  } catch (err) {
    console.error("Exception fetching invoices:", err);
    return [];
  }
}

export async function addInvoice(
  invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">,
): Promise<Invoice> {
  try {
    const invoiceNumber = `AXI-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(5, "0")}`;

    const { data, error } = await supabase
      .from("invoices")
      .insert([
        {
          invoice_number: invoiceNumber,
          full_name: invoice.fullName,
          email: invoice.email,
          phone_number: invoice.phoneNumber,
          company_name: invoice.companyName,
          package_id: invoice.packageId,
          package_name: invoice.packageName,
          package_price: invoice.packagePrice,
          scope: invoice.scope,
          paid_amount: invoice.paidAmount,
          additional_notes: invoice.additionalNotes,
          tax_percentage: invoice.taxPercentage,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding invoice:", error);
      const errorMsg = String(error?.message || error?.code || "Unknown error");
      throw new Error(`Failed to add invoice: ${errorMsg}`);
    }

    if (!data) {
      throw new Error("No data returned from insert");
    }

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      fullName: data.full_name,
      email: data.email,
      phoneNumber: data.phone_number,
      companyName: data.company_name,
      packageId: data.package_id,
      packageName: data.package_name,
      packagePrice: data.package_price,
      scope: data.scope || [],
      paidAmount: data.paid_amount,
      additionalNotes: data.additional_notes,
      taxPercentage: data.tax_percentage || 0,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error("Exception adding invoice:", err);
    throw err;
  }
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching invoice:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      fullName: data.full_name,
      email: data.email,
      phoneNumber: data.phone_number,
      companyName: data.company_name,
      packageId: data.package_id,
      packageName: data.package_name,
      packagePrice: data.package_price,
      scope: data.scope || [],
      paidAmount: data.paid_amount,
      additionalNotes: data.additional_notes,
      taxPercentage: data.tax_percentage || 0,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error("Exception fetching invoice:", err);
    return null;
  }
}

export async function deleteInvoice(id: string) {
  try {
    const { error } = await supabase.from("invoices").delete().eq("id", id);

    if (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  } catch (err) {
    console.error("Exception deleting invoice:", err);
    throw err;
  }
}

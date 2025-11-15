import { useAuth } from "@/contexts/AuthContext";
import { Lead } from "./useCRMStore";

export type UserRole = "salesperson" | "manager" | "admin";

export function useRoleBasedAccess() {
  const { user } = useAuth();

  // For now, we'll assume all authenticated users are salespersons
  // This can be extended to support different roles from the database
  const userRole: string = "salesperson";

  const canViewLead = (lead: Lead): boolean => {
    if (!user) return false;

    // Salespersons can see all leads (for context) but manage only their own
    // Managers/admins can see all leads
    return true;
  };

  const canEditLead = (lead: Lead): boolean => {
    if (!user) return false;

    if (userRole === "admin" || userRole === "manager") {
      return true;
    }

    // Salespersons can only edit leads assigned to them
    return lead.assignedTo === user.id;
  };

  const canDeleteLead = (lead: Lead): boolean => {
    if (!user) return false;

    if (userRole === "admin" || userRole === "manager") {
      return true;
    }

    // Salespersons can only delete leads assigned to them
    return lead.assignedTo === user.id;
  };

  const canAssignLeads = (): boolean => {
    // Only managers and admins can assign leads
    return userRole === "manager" || userRole === "admin";
  };

  const canAutoAssignLeads = (): boolean => {
    // Only managers and admins can auto-assign
    return userRole === "manager" || userRole === "admin";
  };

  const getViewableLeads = (leads: Lead[]): Lead[] => {
    if (userRole === "admin" || userRole === "manager") {
      return leads;
    }

    // Salespersons see all leads but primarily manage their own
    return leads;
  };

  const getManageableLeads = (leads: Lead[]): Lead[] => {
    if (userRole === "admin" || userRole === "manager") {
      return leads;
    }

    // Salespersons can only manage assigned leads
    return leads.filter((lead) => lead.assignedTo === user?.id);
  };

  return {
    user,
    userRole,
    canViewLead,
    canEditLead,
    canDeleteLead,
    canAssignLeads,
    canAutoAssignLeads,
    getViewableLeads,
    getManageableLeads,
  };
}

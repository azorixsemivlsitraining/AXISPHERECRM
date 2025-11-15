import { useState } from "react";
import { MainLayout } from "@/components/Layout";
import {
  Lead,
  Salesperson,
  useCRMStore,
  LeadStatus,
} from "@/hooks/useCRMStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Plus, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess";

const LEAD_STATUSES: LeadStatus[] = [
  "Not lifted",
  "Not connected",
  "Voice Message",
  "Quotation sent",
  "Site visit",
  "Advance payment",
  "Lead finished",
  "Contacted",
];

const STATUS_COLORS: Record<LeadStatus, string> = {
  "Not lifted": "bg-gray-100 text-gray-800",
  "Not connected": "bg-red-100 text-red-800",
  "Voice Message": "bg-blue-100 text-blue-800",
  "Quotation sent": "bg-yellow-100 text-yellow-800",
  "Site visit": "bg-purple-100 text-purple-800",
  "Advance payment": "bg-orange-100 text-orange-800",
  "Lead finished": "bg-green-100 text-green-800",
  Contacted: "bg-cyan-100 text-cyan-800",
};

export default function Leads() {
  const { leads, salespersons, addLead, deleteLead, updateLead, isLoading } =
    useCRMStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const { canEditLead, canDeleteLead, canAutoAssignLeads, canAssignLeads } =
    useRoleBasedAccess();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<Lead, "id" | "createdAt">>({
    name: "",
    jobTitle: "",
    company: "",
    email: "",
    phoneNumbers: [""],
    actions: [""],
    links: [""],
    locations: [""],
    companyEmployees: "",
    companyIndustries: [""],
    companyKeywords: [""],
    status: "Not lifted",
    note: "",
    nextReminderDate: "",
    assignedTo: user?.role === "salesperson" ? user?.id : undefined,
  });

  const assignedLeads =
    user?.role === "admin"
      ? leads
      : leads.filter((lead) => lead.assignedTo === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Lead name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateLead(editingId, formData);
        toast({
          title: "Success",
          description: "Lead updated successfully",
        });
        setEditingId(null);
      } else {
        await addLead(formData);
        toast({
          title: "Success",
          description: "Lead added successfully",
        });
      }

      setFormData({
        name: "",
        jobTitle: "",
        company: "",
        email: "",
        phoneNumbers: [""],
        actions: [""],
        links: [""],
        locations: [""],
        companyEmployees: "",
        companyIndustries: [""],
        companyKeywords: [""],
        status: "Not lifted",
        note: "",
        nextReminderDate: "",
        assignedTo: user?.role === "salesperson" ? user?.id : undefined,
      });
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lead. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLead = (lead: Lead) => {
    if (!canEditLead(lead)) {
      toast({
        title: "Error",
        description: "You can only edit leads assigned to you",
        variant: "destructive",
      });
      return;
    }
    setFormData(lead);
    setEditingId(lead.id);
    setShowForm(true);
  };

  const handleDeleteLead = async (id: string) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead || !canDeleteLead(lead)) {
      toast({
        title: "Error",
        description: "You can only delete leads assigned to you",
        variant: "destructive",
      });
      return;
    }

    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead(id);
        toast({
          title: "Success",
          description: "Lead deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete lead. Please try again.",
          variant: "destructive",
        });
        console.error(error);
      }
    }
  };

  const handleAutoAssign = async () => {
    if (salespersons.length === 0) {
      toast({
        title: "Error",
        description: "No salespersons available for assignment",
        variant: "destructive",
      });
      return;
    }

    const unassignedLeads = leads.filter((l) => !l.assignedTo);
    if (unassignedLeads.length === 0) {
      toast({
        title: "Info",
        description: "All leads are already assigned",
      });
      return;
    }

    try {
      const leadsPerPerson = Math.ceil(
        unassignedLeads.length / salespersons.length,
      );
      let salesPersonIndex = 0;
      let leadsAssignedThisPerson = 0;

      for (const lead of unassignedLeads) {
        if (leadsAssignedThisPerson >= leadsPerPerson) {
          salesPersonIndex++;
          leadsAssignedThisPerson = 0;
        }

        if (salesPersonIndex >= salespersons.length) {
          salesPersonIndex = 0;
          leadsAssignedThisPerson = 0;
        }

        await updateLead(lead.id, {
          ...lead,
          assignedTo: salespersons[salesPersonIndex].id,
        });

        leadsAssignedThisPerson++;
      }

      toast({
        title: "Success",
        description: `${unassignedLeads.length} leads assigned to salespersons`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auto-assign leads",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    try {
      await updateLead(leadId, { ...lead, status: newStatus });
      toast({
        title: "Success",
        description: "Lead status updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleAssignChange = async (leadId: string, salesPersonId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    try {
      await updateLead(leadId, {
        ...lead,
        assignedTo: salesPersonId || undefined,
      });
      toast({
        title: "Success",
        description: "Lead assignment updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead assignment",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      jobTitle: "",
      company: "",
      email: "",
      phoneNumbers: [""],
      actions: [""],
      links: [""],
      locations: [""],
      companyEmployees: "",
      companyIndustries: [""],
      companyKeywords: [""],
      status: "Not lifted",
      note: "",
      nextReminderDate: "",
      assignedTo: user?.role === "salesperson" ? user?.id : undefined,
    });
  };

  const updateArrayField = (
    field: keyof Pick<
      Lead,
      | "phoneNumbers"
      | "actions"
      | "links"
      | "locations"
      | "companyIndustries"
      | "companyKeywords"
    >,
    index: number,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as any] || []).map((item: string, i: number) =>
        i === index ? value : item,
      ),
    }));
  };

  const addArrayField = (
    field: keyof Pick<
      Lead,
      | "phoneNumbers"
      | "actions"
      | "links"
      | "locations"
      | "companyIndustries"
      | "companyKeywords"
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field as any] || []), ""],
    }));
  };

  const removeArrayField = (
    field: keyof Pick<
      Lead,
      | "phoneNumbers"
      | "actions"
      | "links"
      | "locations"
      | "companyIndustries"
      | "companyKeywords"
    >,
    index: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as any] || []).filter(
        (_: string, i: number) => i !== index,
      ),
    }));
  };

  const getSalespersonName = (id?: string) => {
    if (!id) return "-";
    const sp = salespersons.find((s) => s.id === id);
    return sp?.name || "-";
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading leads...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Leads</h2>
            <p className="text-slate-600 mt-1">
              Manage and track all your sales leads
            </p>
          </div>
          <div className="flex gap-2">
            {leads.length > 0 && (
              <Button
                onClick={handleAutoAssign}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Auto-Assign Leads
              </Button>
            )}
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? "Cancel" : "Add Lead"}
            </Button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editingId ? "Edit Lead" : "Add New Lead"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Lead name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Job Title
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Manager, Director"
                    value={formData.jobTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, jobTitle: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Company
                  </label>
                  <Input
                    type="text"
                    placeholder="Company name"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || "Not lifted"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as LeadStatus,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Note
                  </label>
                  <textarea
                    placeholder="Add notes about this lead..."
                    value={formData.note || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Next Reminder Date
                  </label>
                  <Input
                    type="date"
                    value={formData.nextReminderDate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nextReminderDate: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Phone Numbers
                </label>
                {(formData.phoneNumbers || []).map((phone, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) =>
                        updateArrayField("phoneNumbers", idx, e.target.value)
                      }
                      className="flex-1"
                    />
                    {(formData.phoneNumbers?.length || 0) > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField("phoneNumbers", idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField("phoneNumbers")}
                  className="w-full text-blue-600"
                >
                  + Add Phone Number
                </Button>
              </div>

              {/* Locations */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Locations
                </label>
                {(formData.locations || []).map((location, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Location"
                      value={location}
                      onChange={(e) =>
                        updateArrayField("locations", idx, e.target.value)
                      }
                      className="flex-1"
                    />
                    {(formData.locations?.length || 0) > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField("locations", idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField("locations")}
                  className="w-full text-blue-600"
                >
                  + Add Location
                </Button>
              </div>

              {/* Company Industries */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Company Industries
                </label>
                {(formData.companyIndustries || []).map((industry, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Industry"
                      value={industry}
                      onChange={(e) =>
                        updateArrayField(
                          "companyIndustries",
                          idx,
                          e.target.value,
                        )
                      }
                      className="flex-1"
                    />
                    {(formData.companyIndustries?.length || 0) > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          removeArrayField("companyIndustries", idx)
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField("companyIndustries")}
                  className="w-full text-blue-600"
                >
                  + Add Industry
                </Button>
              </div>

              {/* Company Keywords */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Company Keywords
                </label>
                {(formData.companyKeywords || []).map((keyword, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Keyword"
                      value={keyword}
                      onChange={(e) =>
                        updateArrayField("companyKeywords", idx, e.target.value)
                      }
                      className="flex-1"
                    />
                    {(formData.companyKeywords?.length || 0) > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField("companyKeywords", idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField("companyKeywords")}
                  className="w-full text-blue-600"
                >
                  + Add Keyword
                </Button>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Actions
                </label>
                {(formData.actions || []).map((action, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Action to take"
                      value={action}
                      onChange={(e) =>
                        updateArrayField("actions", idx, e.target.value)
                      }
                      className="flex-1"
                    />
                    {(formData.actions?.length || 0) > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField("actions", idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField("actions")}
                  className="w-full text-blue-600"
                >
                  + Add Action
                </Button>
              </div>

              {/* Links */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Links
                </label>
                {(formData.links || []).map((link, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={link}
                      onChange={(e) =>
                        updateArrayField("links", idx, e.target.value)
                      }
                      className="flex-1"
                    />
                    {(formData.links?.length || 0) > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField("links", idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayField("links")}
                  className="w-full text-blue-600"
                >
                  + Add Link
                </Button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingId ? "Update Lead" : "Add Lead"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Leads Table */}
        {leads.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600">
              No leads yet. Add one to get started!
            </p>
          </div>
        ) : assignedLeads.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600">No leads assigned to you yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Next Reminder
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assignedLeads.map((lead, idx) => (
                    <tr
                      key={lead.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">
                            {lead.name}
                          </p>
                          {lead.jobTitle && (
                            <p className="text-xs text-slate-600">
                              {lead.jobTitle}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {lead.company || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {lead.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={lead.status || "Not lifted"}
                          onChange={(e) =>
                            handleStatusChange(
                              lead.id,
                              e.target.value as LeadStatus,
                            )
                          }
                          className={`px-3 py-1 rounded text-sm font-medium border-0 cursor-pointer ${
                            STATUS_COLORS[lead.status || "Not lifted"]
                          }`}
                        >
                          {LEAD_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <p className="text-xs truncate max-w-xs">
                          {lead.note || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {lead.nextReminderDate ? (
                          <span className="font-medium text-amber-600">
                            {new Date(
                              lead.nextReminderDate,
                            ).toLocaleDateString()}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLead(lead)}
                            disabled={!canEditLead(lead)}
                            title={
                              !canEditLead(lead)
                                ? "You can only edit your assigned leads"
                                : ""
                            }
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteLead(lead.id)}
                            disabled={!canDeleteLead(lead)}
                            className="text-red-600 hover:bg-red-50 disabled:text-slate-400"
                            title={
                              !canDeleteLead(lead)
                                ? "You can only delete your assigned leads"
                                : ""
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

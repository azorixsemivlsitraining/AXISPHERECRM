import { useState } from "react";
import { MainLayout } from "@/components/Layout";
import { Lead, useCRMStore } from "@/hooks/useCRMStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Leads() {
  const { leads, addLead, deleteLead, updateLead, isLoading } = useCRMStore();
  const { toast } = useToast();
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
  });

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
    setFormData(lead);
    setEditingId(lead.id);
    setShowForm(true);
  };

  const handleDeleteLead = async (id: string) => {
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
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as any] || []).map((item: string, i: number) =>
        i === index ? value : item
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
    >
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
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as any] || []).filter(
        (_: string, i: number) => i !== index
      ),
    }));
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
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? "Cancel" : "Add Lead"}
          </Button>
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
                    Company Employees
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., 100-500"
                    value={formData.companyEmployees}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyEmployees: e.target.value,
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
                        updateArrayField("companyIndustries", idx, e.target.value)
                      }
                      className="flex-1"
                    />
                    {(formData.companyIndustries?.length || 0) > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayField("companyIndustries", idx)}
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

        {/* Leads List */}
        <div className="grid gap-4">
          {leads.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <p className="text-slate-600">No leads yet. Add one to get started!</p>
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {lead.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {lead.jobTitle && `${lead.jobTitle} at `}
                      {lead.company}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditLead(lead)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLead(lead.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {lead.email && (
                    <div>
                      <p className="text-slate-600 font-medium">Email</p>
                      <p className="text-slate-900 break-all">{lead.email}</p>
                    </div>
                  )}
                  {lead.phoneNumbers?.length > 0 && lead.phoneNumbers[0] && (
                    <div>
                      <p className="text-slate-600 font-medium">Phone</p>
                      <div className="space-y-1">
                        {lead.phoneNumbers
                          .filter((p) => p)
                          .map((phone, idx) => (
                            <p key={idx} className="text-slate-900">
                              {phone}
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                  {lead.companyEmployees && (
                    <div>
                      <p className="text-slate-600 font-medium">Company Size</p>
                      <p className="text-slate-900">{lead.companyEmployees}</p>
                    </div>
                  )}
                </div>

                {(lead.locations?.some((l) => l) ||
                  lead.companyIndustries?.some((i) => i) ||
                  lead.companyKeywords?.some((k) => k)) && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {lead.locations?.some((l) => l) && (
                        <div>
                          <p className="text-slate-600 font-medium mb-1">
                            Locations
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {lead.locations
                              .filter((l) => l)
                              .map((location, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                                >
                                  {location}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                      {lead.companyIndustries?.some((i) => i) && (
                        <div>
                          <p className="text-slate-600 font-medium mb-1">
                            Industries
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {lead.companyIndustries
                              .filter((i) => i)
                              .map((industry, idx) => (
                                <span
                                  key={idx}
                                  className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                                >
                                  {industry}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                      {lead.companyKeywords?.some((k) => k) && (
                        <div>
                          <p className="text-slate-600 font-medium mb-1">
                            Keywords
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {lead.companyKeywords
                              .filter((k) => k)
                              .map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                                >
                                  {keyword}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {lead.actions?.some((a) => a) && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-slate-600 font-medium mb-2 text-sm">
                      Actions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lead.actions
                        .filter((a) => a)
                        .map((action, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs"
                          >
                            {action}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {lead.links?.some((l) => l) && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-slate-600 font-medium mb-2 text-sm">
                      Links
                    </p>
                    <div className="space-y-1">
                      {lead.links
                        .filter((l) => l)
                        .map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm break-all"
                          >
                            {link}
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}

import { useState } from "react";
import { MainLayout } from "@/components/Layout";
import { Lead, LeadStatus, useCRMStore } from "@/hooks/useCRMStore";
import { Loader2, X } from "lucide-react";
import { LeadDetailModal } from "@/components/LeadDetailModal";
import { formatDateOnlyIST } from "@/lib/formatDateIST";

const LEAD_STATUSES: LeadStatus[] = [
  "No Stage",
  "Appointment Schedule",
  "Presentation Done",
  "Proposal",
  "Negotiation",
  "Evaluation",
  "Result",
];

const STATUS_COLORS: Record<LeadStatus, string> = {
  "No Stage": "bg-gray-100 text-gray-800",
  "Appointment Schedule": "bg-blue-100 text-blue-800",
  "Presentation Done": "bg-purple-100 text-purple-800",
  Proposal: "bg-yellow-100 text-yellow-800",
  Negotiation: "bg-orange-100 text-orange-800",
  Evaluation: "bg-amber-100 text-amber-800",
  Result: "bg-green-100 text-green-800",
};

const STATUS_BG_COLORS: Record<LeadStatus, string> = {
  "No Stage": "bg-gray-50 border-gray-200 hover:border-gray-300",
  "Appointment Schedule": "bg-blue-50 border-blue-200 hover:border-blue-300",
  "Presentation Done": "bg-purple-50 border-purple-200 hover:border-purple-300",
  Proposal: "bg-yellow-50 border-yellow-200 hover:border-yellow-300",
  Negotiation: "bg-orange-50 border-orange-200 hover:border-orange-300",
  Evaluation: "bg-amber-50 border-amber-200 hover:border-amber-300",
  Result: "bg-green-50 border-green-200 hover:border-green-300",
};

export default function LeadsDashboard() {
  const { leads, salespersons, isLoading, updateLead } = useCRMStore();
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [draggingLead, setDraggingLead] = useState<Lead | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const leadsGroupedByStatus: Record<LeadStatus, Lead[]> = {
    "No Stage": [],
    "Appointment Schedule": [],
    "Presentation Done": [],
    Proposal: [],
    Negotiation: [],
    Evaluation: [],
    Result: [],
  };

  leads.forEach((lead) => {
    const status = (lead.status || "No Stage") as LeadStatus;
    if (leadsGroupedByStatus[status]) {
      leadsGroupedByStatus[status].push(lead);
    } else {
      leadsGroupedByStatus["No Stage"].push(lead);
    }
  });

  const displayLeads = selectedStatus
    ? leadsGroupedByStatus[selectedStatus]
    : leads;

  const getSalespersonName = (assignedTo?: string) => {
    if (!assignedTo) return "Unassigned";
    const salesperson = salespersons.find((sp) => sp.id === assignedTo);
    return salesperson?.name || "Unknown";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Leads Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              {selectedStatus
                ? `Leads in ${selectedStatus}`
                : "View all leads grouped by status"}
            </p>
          </div>
          {selectedStatus && (
            <button
              onClick={() => setSelectedStatus(null)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filter
            </button>
          )}
        </div>

        {/* Status Cards Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {LEAD_STATUSES.map((status) => {
            const count = leadsGroupedByStatus[status].length;
            const isSelected = selectedStatus === status;

            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(isSelected ? null : status)}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected
                    ? `border-blue-500 bg-blue-50 shadow-md`
                    : `${STATUS_BG_COLORS[status]} border-2`
                }`}
              >
                <p className="text-xs text-slate-600 font-medium mb-1 truncate">
                  {status}
                </p>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
              </button>
            );
          })}
        </div>

        {/* Leads Display */}
        {selectedStatus ? (
          // Filtered view for selected status
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                {selectedStatus}
              </h2>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                {displayLeads.length}
              </span>
            </div>

            {displayLeads.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-500">No leads in this status</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {displayLeads.map((lead) => {
                  const status = (lead.status || "No Stage") as LeadStatus;
                  return (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="text-left flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-semibold text-slate-900 truncate">
                            {lead.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${STATUS_COLORS[status]}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                          <div>
                            <p className="text-slate-600 font-medium">
                              Company
                            </p>
                            <p className="text-slate-900">
                              {lead.company || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600 font-medium">
                              Position
                            </p>
                            <p className="text-slate-900">
                              {lead.jobTitle || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-600 font-medium">Email</p>
                            <p className="text-slate-900">
                              {lead.email || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600 font-medium">
                              Assigned To
                            </p>
                            <p className="text-slate-900">
                              {getSalespersonName(lead.assignedTo)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // Overview with all statuses
          <div className="space-y-6">
            {LEAD_STATUSES.map((status) => {
              const statusLeads = leadsGroupedByStatus[status];
              const count = statusLeads.length;

              if (count === 0) return null;

              return (
                <div
                  key={status}
                  className="bg-white rounded-lg border border-slate-200 p-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {status}
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                      {count}
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {statusLeads.slice(0, 3).map((lead) => (
                      <button
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="text-left flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-semibold text-slate-900 truncate">
                              {lead.name}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${STATUS_COLORS[status]}`}
                            >
                              {status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-slate-600 font-medium">
                                Company
                              </p>
                              <p className="text-slate-900">
                                {lead.company || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600 font-medium">
                                Assigned To
                              </p>
                              <p className="text-slate-900">
                                {getSalespersonName(lead.assignedTo)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {count > 3 && (
                      <button
                        onClick={() => setSelectedStatus(status)}
                        className="py-2 px-4 text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View all {count} leads →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={updateLead}
        />
      )}
    </MainLayout>
  );
}

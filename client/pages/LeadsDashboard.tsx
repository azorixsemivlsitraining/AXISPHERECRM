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

  const getSalespersonName = (assignedTo?: string) => {
    if (!assignedTo) return "Unassigned";
    const salesperson = salespersons.find((sp) => sp.id === assignedTo);
    return salesperson?.name || "Unknown";
  };

  const handleDragStart = (lead: Lead) => {
    setDraggingLead(lead);
  };

  const handleDragEnd = () => {
    setDraggingLead(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStatus(status);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setDragOverStatus(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggingLead) {
      setDraggingLead(null);
      setDragOverStatus(null);
      return;
    }

    const currentStatus = (draggingLead.status || "No Stage") as LeadStatus;
    if (currentStatus !== status) {
      try {
        await updateLead(draggingLead.id, { status });
      } catch (error) {
        console.error("Error updating lead status:", error);
      }
    }

    setDraggingLead(null);
    setDragOverStatus(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Kanban view - Drag and drop leads to change their status
          </p>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 min-w-max md:min-w-full">
            {LEAD_STATUSES.map((status) => {
              const statusLeads = leadsGroupedByStatus[status];
              const count = statusLeads.length;

              return (
                <div
                  key={status}
                  className={`flex flex-col bg-white rounded-lg border-2 transition-all min-h-96 flex-shrink-0 md:flex-shrink w-full md:w-auto ${
                    dragOverStatus === status
                      ? "border-blue-400 bg-blue-50 shadow-lg"
                      : "border-slate-200"
                  }`}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg sticky top-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {status}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-medium">
                        {count}
                      </span>
                    </div>
                  </div>

                  {/* Leads Container */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {count === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-sm text-slate-400">No leads</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Drag to add
                        </p>
                      </div>
                    ) : (
                      statusLeads.map((lead) => {
                        const status = (lead.status ||
                          "No Stage") as LeadStatus;
                        return (
                          <button
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            draggable
                            onDragStart={() => handleDragStart(lead)}
                            onDragEnd={handleDragEnd}
                            className={`w-full text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                              draggingLead?.id === lead.id
                                ? "opacity-50 ring-2 ring-blue-400"
                                : "opacity-100"
                            }`}
                          >
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">
                                {lead.name}
                              </h4>

                              <div className="space-y-1 text-xs">
                                {lead.company && (
                                  <div className="text-slate-600">
                                    <span className="font-medium">
                                      Company:
                                    </span>{" "}
                                    <span className="text-slate-900 line-clamp-1">
                                      {lead.company}
                                    </span>
                                  </div>
                                )}
                                {lead.assignedTo && (
                                  <div className="text-slate-600">
                                    <span className="font-medium">
                                      Assigned:
                                    </span>{" "}
                                    <span className="text-slate-900">
                                      {getSalespersonName(lead.assignedTo)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {lead.createdAt && (
                                <div className="text-xs text-slate-500">
                                  {formatDateOnlyIST(lead.createdAt)}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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

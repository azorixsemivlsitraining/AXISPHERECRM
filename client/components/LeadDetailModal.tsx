import { useState, useEffect } from "react";
import { Lead, LeadStatus } from "@/hooks/useCRMStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Trash2, Plus, Loader2 } from "lucide-react";
import { getLeadNotes, addLeadNote, deleteLeadNote } from "@/lib/supabase-db";
import { useToast } from "@/hooks/use-toast";
import { formatActivityLogDate, formatDateOnlyIST } from "@/lib/formatDateIST";

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

interface LeadNote {
  id: string;
  leadId: string;
  description: string;
  status?: string;
  createdAt: string;
  createdBy?: string;
}

interface LeadDetailModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (leadId: string, updates: Partial<Lead>) => Promise<void>;
}

export function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onUpdate,
}: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "">(
    lead.status || "",
  );
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadNotes();
    }
  }, [isOpen, lead.id]);

  const loadNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const data = await getLeadNotes(lead.id);
      setNotes(data);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingNote(true);
      const newNote = await addLeadNote(
        lead.id,
        newNoteText,
        selectedStatus || undefined,
      );
      setNotes([newNote, ...notes]);
      setNewNoteText("");
      setSelectedStatus("");
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteLeadNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">{lead.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              Activity Logs ({notes.length})
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Job Title
                </label>
                <p className="text-slate-900">{lead.jobTitle || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company
                </label>
                <p className="text-slate-900">{lead.company || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <p className="text-slate-900 break-all">{lead.email || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <p className="text-slate-900">{lead.status || "-"}</p>
              </div>

              {lead.phoneNumbers && lead.phoneNumbers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Numbers
                  </label>
                  <p className="text-slate-900">
                    {lead.phoneNumbers.filter((p) => p).join(", ")}
                  </p>
                </div>
              )}

              {lead.nextReminderDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Next Reminder
                  </label>
                  <p className="text-slate-900">
                    {formatDateOnlyIST(lead.nextReminderDate)}
                  </p>
                </div>
              )}

              {lead.locations && lead.locations.length > 0 && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Locations
                  </label>
                  <p className="text-slate-900">
                    {lead.locations.filter((l) => l).join(", ")}
                  </p>
                </div>
              )}

              {lead.companyIndustries && lead.companyIndustries.length > 0 && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Industries
                  </label>
                  <p className="text-slate-900">
                    {lead.companyIndustries.filter((i) => i).join(", ")}
                  </p>
                </div>
              )}

              {lead.companyKeywords && lead.companyKeywords.length > 0 && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Keywords
                  </label>
                  <p className="text-slate-900">
                    {lead.companyKeywords.filter((k) => k).join(", ")}
                  </p>
                </div>
              )}

              {lead.actions && lead.actions.length > 0 && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Actions
                  </label>
                  <p className="text-slate-900">
                    {lead.actions.filter((a) => a).join(", ")}
                  </p>
                </div>
              )}

              {lead.links && lead.links.length > 0 && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Links
                  </label>
                  <div className="space-y-1">
                    {lead.links
                      .filter((l) => l)
                      .map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {link}
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="p-6 space-y-4">
            {/* Add Note Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-slate-900">Add Note</h3>
              <textarea
                placeholder="Enter your note here..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status (optional)
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus((e.target.value as LeadStatus) || "")
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No status change</option>
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleAddNote}
                disabled={isAddingNote || !newNoteText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isAddingNote && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Add Note
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {isLoadingNotes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {lead.note && (
                    <div className="border border-blue-200 rounded-lg p-4 space-y-2 bg-blue-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-700 mb-1">
                            Main Note
                          </p>
                          <p className="text-slate-900">{lead.note}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        Created: {formatActivityLogDate(lead.createdAt)}
                      </p>
                    </div>
                  )}
                  {notes.length === 0 && !lead.note ? (
                    <p className="text-slate-500 text-center py-8">
                      No activity logs yet. Add your first note!
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="border border-slate-200 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-slate-900">{note.description}</p>
                            {note.status && (
                              <p className="text-sm text-blue-600 font-medium mt-1">
                                ✓ {note.status}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-slate-400 hover:text-red-600 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatActivityLogDate(note.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

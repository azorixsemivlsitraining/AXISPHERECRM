import { useState } from "react";
import { Edit2, Save, X, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  employeeCountRange?: string;
  website?: string;
  logoUrl?: string;
  linkedinUrl?: string;
  crunchbaseUrl?: string;
  hqAddress?: string;
  [key: string]: any;
}

interface CompaniesTableProps {
  companies: Company[];
  isLoading?: boolean;
  onDeleteCompany?: (id: string) => Promise<void>;
  onUpdateCompany?: (id: string, data: Partial<Company>) => Promise<void>;
}

export default function CompaniesTable({
  companies,
  isLoading = false,
  onDeleteCompany,
  onUpdateCompany,
}: CompaniesTableProps) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Company>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleEditStart = (company: Company) => {
    setEditingId(company.id);
    setEditData({ ...company });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (company: Company) => {
    if (!onUpdateCompany) {
      setEditingId(null);
      return;
    }

    setSaving(true);
    try {
      await onUpdateCompany(company.id, editData);
      setEditingId(null);
      setEditData({});
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    } catch (error) {
      console.error("Error updating company:", error);
      toast({
        title: "Error",
        description: "Failed to update company",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteCompany) return;

    setDeletingId(id);
    try {
      await onDeleteCompany(id);
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting company:", error);
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-600">No companies found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[200px]">Company Name</TableHead>
            <TableHead className="w-[120px]">Employees</TableHead>
            <TableHead className="w-[150px]">Website</TableHead>
            <TableHead className="w-[120px]">Industry</TableHead>
            <TableHead className="w-[150px]">Location</TableHead>
            <TableHead className="w-[100px]">Social Links</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              {editingId === company.id ? (
                <>
                  <TableCell>
                    <Input
                      value={editData.name || ""}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editData.employeeCountRange || ""}
                      onChange={(e) =>
                        handleEditChange("employeeCountRange", e.target.value)
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editData.website || ""}
                      onChange={(e) =>
                        handleEditChange("website", e.target.value)
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editData.industry || ""}
                      onChange={(e) =>
                        handleEditChange("industry", e.target.value)
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={editData.hqAddress || ""}
                      onChange={(e) =>
                        handleEditChange("hqAddress", e.target.value)
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell />
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave(company)}
                      disabled={saving}
                      className="h-8"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditCancel}
                      className="h-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {company.logoUrl && (
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="w-8 h-8 rounded object-contain flex-shrink-0"
                        />
                      )}
                      <span className="font-medium text-slate-900">
                        {company.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {company.employeeCountRange || "N/A"}
                  </TableCell>
                  <TableCell>
                    {company.website ? (
                      <a
                        href={
                          company.website.startsWith("http")
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm truncate block"
                      >
                        {company.domain || company.website}
                      </a>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {company.industry || "N/A"}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {company.hqAddress || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {company.linkedinUrl && (
                        <a
                          href={company.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                          title="LinkedIn"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {company.crunchbaseUrl && (
                        <a
                          href={company.crunchbaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                          title="Crunchbase"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditStart(company)}
                      className="h-8"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deletingId === company.id}
                        >
                          {deletingId === company.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Company</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete {company.name}? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-4 justify-end">
                          <Button variant="outline">Cancel</Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(company.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

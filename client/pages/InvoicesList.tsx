import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useInvoiceStore } from "@/hooks/useInvoiceStore";
import { ArrowLeft, Eye, Trash2, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDateOnlyIST } from "@/lib/formatDateIST";

export default function InvoicesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invoices, isLoading, deleteInvoice } = useInvoiceStore();

  const handleDeleteInvoice = async (id: string, invoiceNumber: string) => {
    if (
      confirm(
        `Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteInvoice(id);
        toast({
          title: "Success",
          description: "Invoice deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete invoice",
          variant: "destructive",
        });
        console.error(error);
      }
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading invoices...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">All Invoices</h2>
            <p className="text-slate-600 mt-1">Manage and view your invoices</p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No invoices yet</p>
            <Button
              onClick={() => navigate("/admin")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Your First Invoice
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Invoice Number
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Package
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, idx) => (
                    <tr
                      key={invoice.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-slate-900">
                          {invoice.invoiceNumber}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {invoice.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {invoice.companyName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {invoice.packageName}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 text-right">
                        ₹
                        {(
                          invoice.packagePrice +
                          invoice.packagePrice * 0.18
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDateOnlyIST(invoice.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/invoice/${invoice.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteInvoice(
                                invoice.id,
                                invoice.invoiceNumber,
                              )
                            }
                            className="text-red-600 hover:bg-red-50"
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

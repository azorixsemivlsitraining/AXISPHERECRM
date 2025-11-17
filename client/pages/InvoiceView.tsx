import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useInvoiceStore } from "@/hooks/useInvoiceStore";
import { Invoice } from "@/lib/supabase-db";
import {
  Loader2,
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import html2pdf from "html2pdf.js";

export default function InvoiceView() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getInvoiceById } = useInvoiceStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId) {
        toast({
          title: "Error",
          description: "Invoice ID not provided",
          variant: "destructive",
        });
        navigate("/admin");
        return;
      }

      try {
        setIsLoading(true);
        const invoiceData = await getInvoiceById(invoiceId);
        if (invoiceData) {
          setInvoice(invoiceData);
        } else {
          toast({
            title: "Error",
            description: "Invoice not found",
            variant: "destructive",
          });
          navigate("/admin");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load invoice",
          variant: "destructive",
        });
        console.error(error);
        navigate("/admin");
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId, getInvoiceById, navigate, toast]);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    setIsDownloading(true);
    try {
      const element = invoiceRef.current.cloneNode(true) as HTMLElement;

      const opt = {
        margin: 10,
        filename: `${invoice?.invoiceNumber || "invoice"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      html2pdf().set(opt).from(element).save();

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading invoice...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!invoice) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-slate-600 mb-4">Invoice not found</p>
          <Button onClick={() => navigate("/admin")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </MainLayout>
    );
  }

  const subtotal = invoice.packagePrice;
  const tax = subtotal * (invoice.taxPercentage / 100);
  const total = subtotal + tax;

  const companyInfo = {
    name: "Axisphere Media Worx LLP",
    address:
      "Plot no.102, 103, Temple Lane, Mythri Nagar,\nMathrusri Nagar, Madinaguda, Serilingampally,\nK.V.Rangareddy-500049, Telangana, India",
    logo: "https://cdn.builder.io/api/v1/image/assets%2Fa31d1200efef4b74975fb36c4890f8c1%2F8211d605de7443fb8fd45193578c775d?format=webp&width=200",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDueDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/admin")}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-3xl font-bold text-slate-900">Invoice</h2>
          </div>
          <Button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>

        <div
          ref={invoiceRef}
          className="bg-white rounded-lg border border-slate-200 overflow-hidden"
        >
          {/* Page 1: Bill */}
          {currentPage === 1 && (
            <div className="p-12 min-h-screen bg-white">
              {/* Header with Logo and Company Info */}
              <div className="flex justify-between items-start mb-12">
                <div>
                  <img
                    src={companyInfo.logo}
                    alt="Axisphere"
                    className="h-12 mb-2"
                  />
                  <h1 className="text-4xl font-bold text-purple-600 mb-2">
                    Axisphere
                  </h1>
                  <div className="text-sm text-slate-600">
                    {companyInfo.address.split("\n").map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    Invoice Number: {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-slate-600">
                    Date: {formatDate(invoice.createdAt)}
                  </p>
                  <p className="text-sm text-slate-600">
                    Due Date: {getDueDate(invoice.createdAt)}
                  </p>
                </div>
              </div>

              <div className="border-b-2 border-slate-300 mb-8"></div>

              {/* Bill To Section */}
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-3">
                    BILL TO
                  </p>
                  <p className="font-semibold text-slate-900">
                    {invoice.fullName}
                  </p>
                  <p className="text-sm text-slate-600">{invoice.email}</p>
                  <p className="text-sm text-slate-600">
                    {invoice.phoneNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 mb-3">
                    PAYMENT TERMS
                  </p>
                  <p className="text-sm text-slate-600">Due within 30 days</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Description
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900 w-20">
                      Qty
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900 w-28">
                      Rate
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900 w-28">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-4 px-4 text-slate-900">
                      {invoice.packageName} - Full Package
                    </td>
                    <td className="text-center py-4 px-4 text-slate-900">1</td>
                    <td className="text-right py-4 px-4 text-slate-900">
                      ₹{invoice.packagePrice.toLocaleString()}.00
                    </td>
                    <td className="text-right py-4 px-4 text-slate-900">
                      ₹{invoice.packagePrice.toLocaleString()}.00
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="flex justify-between mb-3 text-slate-900">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}.00</span>
                  </div>
                  <div className="border-t-2 border-purple-300 pt-3 mb-3">
                    <div className="flex justify-between text-slate-900 mb-3">
                      <span>Tax (18% GST):</span>
                      <span>
                        ₹
                        {tax.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="border-t-2 border-purple-300 pt-3 bg-purple-50 px-4 py-3 rounded">
                    <div className="flex justify-between text-lg font-bold text-purple-600">
                      <span>Total Amount Due</span>
                      <span>
                        ₹
                        {total.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-slate-300 pt-6 text-center text-sm text-slate-600">
                Thank you for your business! For inquiries, contact
                hello@ai-marketing.studio
              </div>
            </div>
          )}

          {/* Page 2: Scope/Features */}
          {currentPage === 2 && (
            <div className="p-12 min-h-screen bg-white">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <img
                    src={companyInfo.logo}
                    alt="Axisphere"
                    className="h-12 mb-2"
                  />
                  <h1 className="text-4xl font-bold text-purple-600 mb-2">
                    Axisphere
                  </h1>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    Invoice Number: {invoice.invoiceNumber}
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-8">
                Package Scope & Features
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {invoice.packageName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {invoice.scope.map((feature, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-4 rounded border ${
                        feature.included
                          ? "bg-green-50 border-green-200"
                          : "bg-slate-50 border-slate-200 opacity-60"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          feature.included ? "bg-green-600" : "bg-slate-300"
                        }`}
                      >
                        {feature.included && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-slate-900 font-medium"
                            : "text-slate-600"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {invoice.additionalNotes && (
                <div className="mt-12 pt-8 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Additional Notes
                  </h3>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {invoice.additionalNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Page Navigation */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
          <Button
            onClick={() => setCurrentPage(1)}
            variant={currentPage === 1 ? "default" : "outline"}
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Bill
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-slate-600">
              Page {currentPage} of 2
            </span>
            <Button
              onClick={() => setCurrentPage(Math.min(2, currentPage + 1))}
              variant="outline"
              size="sm"
              disabled={currentPage === 2}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={() => setCurrentPage(2)}
            variant={currentPage === 2 ? "default" : "outline"}
            size="sm"
          >
            Scope
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}

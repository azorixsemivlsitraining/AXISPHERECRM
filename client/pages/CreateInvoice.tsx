import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useInvoiceStore } from "@/hooks/useInvoiceStore";
import { PACKAGES } from "@/lib/packages";
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateInvoice() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addInvoice } = useInvoiceStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPackage = PACKAGES.find((p) => p.id === packageId);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    paidAmount: selectedPackage?.price || 0,
    additionalNotes: "",
    taxPercentage: 0,
  });

  const [selectedFeatures, setSelectedFeatures] = useState<
    Record<string, boolean>
  >({});

  // Initialize selected features with all true
  if (selectedPackage && Object.keys(selectedFeatures).length === 0) {
    const features = selectedPackage.features.reduce(
      (acc, feature) => {
        acc[feature] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setSelectedFeatures(features);
  }

  if (!selectedPackage) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-slate-600 mb-4">Package not found</p>
          <Button onClick={() => navigate("/admin")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast({
        title: "Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.taxPercentage < 0) {
      toast({
        title: "Error",
        description: "Tax percentage cannot be negative",
        variant: "destructive",
      });
      return;
    }

    if (formData.paidAmount <= 0) {
      toast({
        title: "Error",
        description: "Paid amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const scope = selectedPackage.features.map((feature) => ({
      name: feature,
      included: selectedFeatures[feature] || false,
    }));

    setIsSubmitting(true);
    try {
      const newInvoice = await addInvoice({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        companyName: formData.companyName,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        packagePrice: selectedPackage.price,
        scope,
        paidAmount: formData.paidAmount,
        additionalNotes: formData.additionalNotes,
        taxPercentage: 18,
      });

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      navigate(`/invoice/${newInvoice.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create invoice",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFeature = (feature: string) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const selectAllFeatures = () => {
    const newSelection = selectedPackage.features.reduce(
      (acc, feature) => {
        acc[feature] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    setSelectedFeatures(newSelection);
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Create Invoice
            </h2>
            <p className="text-slate-600 mt-1">
              Package: {selectedPackage.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company Name *
                </label>
                <Input
                  type="text"
                  placeholder="Your Company"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Package and Scope */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Scope / Features
              </h3>
              <Button
                type="button"
                onClick={selectAllFeatures}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Select All
              </Button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Select features from {selectedPackage.name} to include in this
              invoice
            </p>
            <div className="space-y-3">
              {selectedPackage.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded border border-slate-200 hover:bg-slate-50">
                  <Checkbox
                    id={`feature-${idx}`}
                    checked={selectedFeatures[feature] || false}
                    onCheckedChange={() => handleToggleFeature(feature)}
                  />
                  <label
                    htmlFor={`feature-${idx}`}
                    className="text-sm text-slate-700 cursor-pointer flex-1"
                  >
                    {feature}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing and Payment */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Pricing & Payment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Package Price
                </label>
                <Input
                  type="number"
                  value={selectedPackage.price}
                  disabled
                  className="bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tax (18% GST)
                </label>
                <Input
                  type="number"
                  value={(selectedPackage.price * 0.18).toFixed(2)}
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Paid Amount *
              </label>
              <Input
                type="number"
                placeholder="Amount to be paid"
                value={formData.paidAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paidAmount: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Additional Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Additional Notes
              </label>
              <Textarea
                placeholder="Add any additional notes for the invoice..."
                value={formData.additionalNotes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalNotes: e.target.value,
                  })
                }
                rows={4}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-between">
            <Button
              type="button"
              onClick={() => navigate("/admin")}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create & View Invoice
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

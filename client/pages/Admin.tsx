import { useState } from "react";
import { MainLayout } from "@/components/Layout";
import { Salesperson, useCRMStore } from "@/hooks/useCRMStore";
import { useInvoiceStore } from "@/hooks/useInvoiceStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Edit2,
  Plus,
  X,
  Loader2,
  LogOut,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDateOnlyIST } from "@/lib/formatDateIST";
import { PACKAGES } from "@/lib/packages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
  const {
    salespersons,
    addSalesperson,
    updateSalesperson,
    deleteSalesperson,
    isLoading,
  } = useCRMStore();
  const { invoices } = useInvoiceStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<
    Omit<Salesperson, "id" | "createdAt">
  >({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-slate-600">Access denied. Admin only.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Salesperson name is required",
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

    if (!editingId) {
      // Creating new salesperson - need password
      if (!password) {
        toast({
          title: "Error",
          description: "Password is required",
          variant: "destructive",
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update existing salesperson
        await updateSalesperson(editingId, formData);
        toast({
          title: "Success",
          description: "Salesperson updated successfully",
        });
        setEditingId(null);
      } else {
        // Create new salesperson with auth
        let authUserId: string | undefined;
        try {
          const response = await fetch("/api/auth/sign-up", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password,
            }),
          });

          if (!response.ok) {
            let errorMessage = "Failed to create account";
            const contentType = response.headers.get("content-type");

            if (contentType?.includes("application/json")) {
              try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
              } catch {
                errorMessage = `Server error (${response.status})`;
              }
            } else {
              errorMessage = `Server error (${response.status})`;
            }

            throw new Error(errorMessage);
          }

          let authData;
          try {
            authData = await response.json();
          } catch (parseError) {
            throw new Error(`Invalid response format from server`);
          }

          if (!authData?.user) {
            throw new Error("No user returned from signup");
          }

          authUserId = authData.user.id;
          console.log("Auth user created with ID:", authUserId);
        } catch (authErr) {
          console.error("Auth signup error:", authErr);
          throw new Error(
            `Authentication error: ${authErr instanceof Error ? authErr.message : "Unknown error"}`,
          );
        }

        // Add salesperson record with auth_id link
        const newSalesperson = await addSalesperson({
          ...formData,
          phoneNumber: formData.phoneNumber || "",
          authId: authUserId,
        });

        toast({
          title: "Success",
          description: "Salesperson added successfully",
        });
      }

      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
      });
      setPassword("");
      setConfirmPassword("");
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save salesperson. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSalesperson = (salesperson: Salesperson) => {
    setFormData({
      name: salesperson.name,
      email: salesperson.email,
      phoneNumber: salesperson.phoneNumber,
    });
    setEditingId(salesperson.id);
    setPassword("");
    setConfirmPassword("");
    setShowForm(true);
  };

  const handleDeleteSalesperson = async (id: string) => {
    if (confirm("Are you sure you want to delete this salesperson?")) {
      try {
        await deleteSalesperson(id);
        toast({
          title: "Success",
          description: "Salesperson deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete salesperson. Please try again.",
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
      email: "",
      phoneNumber: "",
    });
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const handleCreateInvoice = (packageId: string) => {
    navigate(`/create-invoice/${packageId}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading...</p>
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
            <h2 className="text-3xl font-bold text-slate-900">Admin Panel</h2>
            <p className="text-slate-600 mt-1">
              Manage operations and invoices
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="salespersons" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="salespersons">Salespersons</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Salespersons Tab */}
          <TabsContent value="salespersons" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">
                Manage Salespersons
              </h3>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showForm ? "Cancel" : "Add Salesperson"}
              </Button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {editingId ? "Edit Salesperson" : "Add New Salesperson"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="Salesperson name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email *
                      </label>
                      <Input
                        type="email"
                        placeholder="salesperson@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={!!editingId}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  {!editingId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingId ? "Update Salesperson" : "Add Salesperson"}
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

            {/* Salespersons Table */}
            {salespersons.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <p className="text-slate-600">
                  No salespersons yet. Add one to get started!
                </p>
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
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                          Phone Number
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {salespersons.map((salesperson, idx) => (
                        <tr
                          key={salesperson.id}
                          className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                        >
                          <td className="px-6 py-4 text-sm">
                            <p className="font-medium text-slate-900">
                              {salesperson.name}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {salesperson.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {salesperson.phoneNumber || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {formatDateOnlyIST(salesperson.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEditSalesperson(salesperson)
                                }
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteSalesperson(salesperson.id)
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
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">
                  Create Invoice
                </h3>
                {invoices.length > 0 && (
                  <Button
                    onClick={() => navigate("/invoices")}
                    variant="outline"
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View All Invoices ({invoices.length})
                  </Button>
                )}
              </div>

              {/* Packages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">
                      {pkg.name}
                    </h4>
                    <p className="text-3xl font-bold text-slate-900 mb-1">
                      ₹{pkg.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                      {pkg.monthlyLabel}
                    </p>
                    <p className="text-sm text-slate-600 mb-4">
                      {pkg.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      {pkg.features.slice(0, 5).map((feature, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-slate-600 flex items-start"
                        >
                          <span className="text-green-600 mr-2">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                      {pkg.features.length > 5 && (
                        <p className="text-sm text-slate-600 font-medium">
                          +{pkg.features.length - 5} more features
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => handleCreateInvoice(pkg.id)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create Invoice
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

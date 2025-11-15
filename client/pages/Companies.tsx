import { useState, useEffect } from "react";
import { MainLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  Plus,
  Loader2,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { searchCompanies, ApolloCompany } from "@/lib/apollo";
import {
  getCompanies,
  addCompany,
  deleteCompany,
  Company,
} from "@/lib/supabase-db";
import CompaniesTable from "@/components/CompaniesTable";

interface ApiCompany {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  employeeCount?: number;
  employeeCountRange?: string;
  revenue?: number;
  revenueRange?: string;
  logoUrl?: string;
  linkedinUrl?: string;
  crunchbaseUrl?: string;
  foundedYear?: number;
  hqAddress?: string;
  countries?: string[];
  website?: string;
  phone?: string;
  apolloProfileUrl?: string;
  [key: string]: any;
}

export default function Companies() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("saved");

  // Saved Companies tab state
  const [savedCompanies, setSavedCompanies] = useState<ApiCompany[]>([]);
  const [isLoadingSavedCompanies, setIsLoadingSavedCompanies] = useState(true);
  const [savedCompaniesError, setSavedCompaniesError] = useState<string | null>(
    null,
  );

  // Search tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndustry, setSearchIndustry] = useState("");
  const [searchEmployeeSize, setSearchEmployeeSize] = useState("");
  const [searchResults, setSearchResults] = useState<ApolloCompany[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  // Load saved companies on mount
  useEffect(() => {
    loadSavedCompanies();
  }, []);

  const loadSavedCompanies = async () => {
    try {
      setIsLoadingSavedCompanies(true);
      setSavedCompaniesError(null);
      const response = await fetch("/api/companies");

      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }

      const data = await response.json();
      setSavedCompanies(data.companies || []);

      if ((data.companies || []).length === 0) {
        toast({
          title: "Info",
          description: "No saved companies found in Apollo.io",
        });
      }
    } catch (error) {
      console.error("Error loading saved companies:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load saved companies";
      setSavedCompaniesError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSavedCompanies(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company name to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchCompanies({
        q_organization_name: searchQuery,
        q_industry: searchIndustry || undefined,
        q_organization_employee_size: searchEmployeeSize || undefined,
        limit: 50,
      });

      setSearchResults(results);

      if (results.length === 0) {
        toast({
          title: "No results",
          description: "No companies found matching your search criteria",
        });
      } else {
        toast({
          title: "Success",
          description: `Found ${results.length} companies`,
        });
      }
    } catch (error) {
      console.error("Error searching companies:", error);
      toast({
        title: "Error",
        description: "Failed to search companies. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportCompany = async (company: ApolloCompany) => {
    try {
      await addCompany(company);
      setImportedIds((prev) => new Set(prev).add(company.id));
      toast({
        title: "Success",
        description: `${company.name} imported successfully`,
      });
    } catch (error) {
      console.error("Error importing company:", error);
      toast({
        title: "Error",
        description: "Failed to import company",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      await deleteCompany(id);
      setSavedCompanies((prev) => prev.filter((c) => c.id !== id));
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
    }
  };

  const handleUpdateCompany = async (id: string, data: Partial<ApiCompany>) => {
    try {
      setSavedCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
      );
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
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Companies</h2>
          <p className="text-slate-600 mt-1">
            Manage and search companies from Apollo.io
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1">
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900"
            >
              Saved Companies ({savedCompanies.length})
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900"
            >
              Search Companies
            </TabsTrigger>
          </TabsList>

          {/* Saved Companies Tab */}
          <TabsContent value="saved" className="mt-6">
            {savedCompaniesError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">
                    Error loading companies
                  </p>
                  <p className="text-sm text-red-800">{savedCompaniesError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSavedCompanies}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
            <CompaniesTable
              companies={savedCompanies}
              isLoading={isLoadingSavedCompanies}
              onDeleteCompany={handleDeleteCompany}
              onUpdateCompany={handleUpdateCompany}
            />
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6 mt-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Search Apollo.io Companies
              </h3>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Company Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Google, Microsoft, Amazon"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Industry
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Technology, Finance"
                      value={searchIndustry}
                      onChange={(e) => setSearchIndustry(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Employee Size Range
                  </label>
                  <select
                    value={searchEmployeeSize}
                    onChange={(e) => setSearchEmployeeSize(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sizes</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1001-5000">1001-5000</option>
                    <option value="5001-10000">5001-10000</option>
                    <option value="10001+">10001+</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  disabled={isSearching}
                >
                  {isSearching && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Search Companies
                </Button>
              </form>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Search Results ({searchResults.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((company) => (
                    <div
                      key={company.id}
                      className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {company.logo_url && (
                          <img
                            src={company.logo_url}
                            alt={company.name}
                            className="w-12 h-12 rounded object-contain"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">
                            {company.name}
                          </h4>
                          {company.industry && (
                            <p className="text-xs text-slate-500">
                              {company.industry}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        {company.domain && (
                          <p className="text-slate-600">
                            <span className="font-medium">Domain:</span>{" "}
                            <a
                              href={`https://${company.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {company.domain}
                            </a>
                          </p>
                        )}
                        {company.employee_count_range && (
                          <p className="text-slate-600">
                            <span className="font-medium">Employees:</span>{" "}
                            {company.employee_count_range}
                          </p>
                        )}
                        {company.revenue_range && (
                          <p className="text-slate-600">
                            <span className="font-medium">Revenue:</span>{" "}
                            {company.revenue_range}
                          </p>
                        )}
                        {company.founded_year && (
                          <p className="text-slate-600">
                            <span className="font-medium">Founded:</span>{" "}
                            {company.founded_year}
                          </p>
                        )}
                        {company.hq_address && (
                          <p className="text-slate-600">
                            <span className="font-medium">Location:</span>{" "}
                            {company.hq_address}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 mb-3">
                        {company.linkedin_url && (
                          <a
                            href={company.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                            title="LinkedIn"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {company.crunchbase_url && (
                          <a
                            href={company.crunchbase_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                            title="Crunchbase"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {importedIds.has(company.id) ? (
                        <Button
                          disabled
                          className="w-full bg-green-100 text-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Imported
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleImportCompany(company)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Import
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

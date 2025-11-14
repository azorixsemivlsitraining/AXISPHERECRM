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
import { searchCompanies, getSavedCompanies, ApolloCompany } from "@/lib/apollo";
import {
  getCompanies,
  addCompany,
  deleteCompany,
  Company,
} from "@/lib/supabase-db";

export default function Companies() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("search");

  // Search tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndustry, setSearchIndustry] = useState("");
  const [searchEmployeeSize, setSearchEmployeeSize] = useState("");
  const [searchResults, setSearchResults] = useState<ApolloCompany[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  // My Companies tab state
  const [myCompanies, setMyCompanies] = useState<Company[]>([]);
  const [isLoadingMyCompanies, setIsLoadingMyCompanies] = useState(true);

  // Load my companies on mount
  useEffect(() => {
    loadMyCompanies();
  }, []);

  const loadMyCompanies = async () => {
    try {
      setIsLoadingMyCompanies(true);
      const apolloCompanies = await getSavedCompanies();

      const mappedCompanies: Company[] = apolloCompanies.map((apolloCompany, index) => ({
        id: apolloCompany.id || `apollo-${index}`,
        apolloId: apolloCompany.id,
        name: apolloCompany.name,
        domain: apolloCompany.domain,
        industry: apolloCompany.industry,
        employeeCount: apolloCompany.employee_count,
        employeeCountRange: apolloCompany.employee_count_range,
        revenue: apolloCompany.revenue,
        revenueRange: apolloCompany.revenue_range,
        logoUrl: apolloCompany.logo_url,
        linkedinUrl: apolloCompany.linkedin_url,
        crunchbaseUrl: apolloCompany.crunchbase_url,
        foundedYear: apolloCompany.founded_year,
        hqAddress: apolloCompany.hq_address,
        countries: apolloCompany.countries,
        website: apolloCompany.website,
        phone: apolloCompany.phone,
        createdAt: new Date().toISOString(),
      }));

      setMyCompanies(mappedCompanies);
    } catch (error) {
      console.error("Error loading saved companies from Apollo:", error);
      toast({
        title: "Error",
        description: "Failed to load your saved companies from Apollo.io",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMyCompanies(false);
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
      setMyCompanies((prev) => [
        {
          id: Date.now().toString(),
          apolloId: company.id,
          name: company.name,
          domain: company.domain,
          industry: company.industry,
          employeeCount: company.employee_count,
          employeeCountRange: company.employee_count_range,
          revenue: company.revenue,
          revenueRange: company.revenue_range,
          logoUrl: company.logo_url,
          linkedinUrl: company.linkedin_url,
          crunchbaseUrl: company.crunchbase_url,
          foundedYear: company.founded_year,
          hqAddress: company.hq_address,
          countries: company.countries,
          website: company.website,
          phone: company.phone,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
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
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        await deleteCompany(id);
        setMyCompanies((prev) => prev.filter((c) => c.id !== id));
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
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Companies</h2>
          <p className="text-slate-600 mt-1">
            Search and manage companies from Apollo.io
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1">
            <TabsTrigger
              value="search"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900"
            >
              Search Companies
            </TabsTrigger>
            <TabsTrigger
              value="my-companies"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900"
            >
              My Companies ({myCompanies.length})
            </TabsTrigger>
          </TabsList>

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

          {/* My Companies Tab */}
          <TabsContent value="my-companies" className="mt-6">
            {isLoadingMyCompanies ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-slate-600">Loading companies...</p>
                </div>
              </div>
            ) : myCompanies.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  No companies imported yet. Search and import companies from
                  Apollo.io!
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {company.logoUrl && (
                        <img
                          src={company.logoUrl}
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
                      {company.employeeCountRange && (
                        <p className="text-slate-600">
                          <span className="font-medium">Employees:</span>{" "}
                          {company.employeeCountRange}
                        </p>
                      )}
                      {company.revenueRange && (
                        <p className="text-slate-600">
                          <span className="font-medium">Revenue:</span>{" "}
                          {company.revenueRange}
                        </p>
                      )}
                      {company.foundedYear && (
                        <p className="text-slate-600">
                          <span className="font-medium">Founded:</span>{" "}
                          {company.foundedYear}
                        </p>
                      )}
                      {company.hqAddress && (
                        <p className="text-slate-600">
                          <span className="font-medium">Location:</span>{" "}
                          {company.hqAddress}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 mb-3">
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

                    <Button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="w-full bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

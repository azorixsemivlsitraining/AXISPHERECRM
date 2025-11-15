import { Link } from "react-router-dom";
import { MainLayout } from "@/components/Layout";
import { RemindersPanel } from "@/components/RemindersPanel";
import { useCRMStore } from "@/hooks/useCRMStore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { formatDateOnlyIST } from "@/lib/formatDateIST";
import {
  Users,
  UserCheck,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function Index() {
  const { leads, salespersons } = useCRMStore();
  const { user } = useAuth();

  const assignedLeads = leads.filter((lead) => lead.assignedTo === user?.id);

  const upcomingReminders = assignedLeads
    .filter((lead) => lead.nextReminderDate)
    .sort(
      (a, b) =>
        new Date(a.nextReminderDate!).getTime() -
        new Date(b.nextReminderDate!).getTime(),
    )
    .slice(0, 5);

  const recentLeads = [...assignedLeads]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const recentSalespersons = [...salespersons]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      label: "My Assigned Leads",
      value: assignedLeads.length,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      href: "/leads",
    },
    {
      label: "Upcoming Reminders",
      value: upcomingReminders.length,
      icon: Calendar,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Total Sales Persons",
      value: salespersons.length,
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
      href: "/salespersons",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome to Axisphere CRM</h2>
          <p className="text-blue-100 mb-6">
            Manage your sales leads and team efficiently
          </p>
          <div className="flex gap-4">
            <Link to="/leads">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                <Users className="w-4 h-4 mr-2" />
                Manage Leads
              </Button>
            </Link>
            <Link to="/salespersons">
              <Button className="bg-blue-500 hover:bg-blue-400 text-white font-semibold">
                <UserCheck className="w-4 h-4 mr-2" />
                Manage Sales Persons
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} to={stat.href || "#"} className="group">
                <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-600 font-medium">{stat.label}</h3>
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Reminders Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <RemindersPanel />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Recent Leads
              </h3>
              {leads.length > 0 && (
                <Link to="/leads">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              )}
            </div>
            {recentLeads.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-slate-600 mb-4">No leads yet</p>
                <Link to="/leads">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Add Your First Lead
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="pb-4 border-b border-slate-200 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-slate-900">
                        {lead.name}
                      </h4>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateOnlyIST(lead.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {lead.jobTitle && `${lead.jobTitle} at `}
                      {lead.company || "No company"}
                    </p>
                    {lead.email && (
                      <p className="text-xs text-blue-600 mt-1">{lead.email}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sales Persons */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Recent Sales Persons
              </h3>
              {salespersons.length > 0 && (
                <Link to="/salespersons">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              )}
            </div>
            {recentSalespersons.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-slate-600 mb-4">No sales persons yet</p>
                <Link to="/salespersons">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Add Your First Sales Person
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSalespersons.map((person) => (
                  <div
                    key={person.id}
                    className="pb-4 border-b border-slate-200 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-slate-900">
                        {person.name}
                      </h4>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateOnlyIST(person.createdAt)}
                      </span>
                    </div>
                    {person.email && (
                      <a
                        href={`mailto:${person.email}`}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {person.email}
                      </a>
                    )}
                    {person.phoneNumber && (
                      <p className="text-xs text-slate-600 mt-1">
                        {person.phoneNumber}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{leads.length}</p>
              <p className="text-sm text-slate-600">Total Leads</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {salespersons.length}
              </p>
              <p className="text-sm text-slate-600">Total Sales Persons</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {leads.filter((l) => l.email).length}
              </p>
              <p className="text-sm text-slate-600">Leads with Email</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {leads.filter((l) => l.phoneNumbers?.some((p) => p)).length}
              </p>
              <p className="text-sm text-slate-600">Leads with Phone</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

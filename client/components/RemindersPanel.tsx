import { useCRMStore } from "@/hooks/useCRMStore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, Clock, CheckCircle2, Link as LinkIcon } from "lucide-react";

export function RemindersPanel() {
  const { leads } = useCRMStore();
  const { user } = useAuth();

  const assignedLeads = leads.filter((lead) => lead.assignedTo === user?.id);

  // Get reminders sorted by date
  const reminders = assignedLeads
    .filter((lead) => lead.nextReminderDate)
    .sort(
      (a, b) =>
        new Date(a.nextReminderDate!).getTime() -
        new Date(b.nextReminderDate!).getTime(),
    );

  const overdue = reminders.filter(
    (r) => new Date(r.nextReminderDate!).getTime() < new Date().getTime(),
  );

  const upcoming = reminders.filter(
    (r) => new Date(r.nextReminderDate!).getTime() >= new Date().getTime(),
  );

  const getRemindersForNextDays = (days: number) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return reminders.filter((r) => {
      const reminderDate = new Date(r.nextReminderDate!);
      return reminderDate >= now && reminderDate <= futureDate;
    });
  };

  const nextWeekReminders = getRemindersForNextDays(7);
  const overdueCount = overdue.length;
  const todayReminders = getRemindersForNextDays(1).filter(
    (r) =>
      new Date(r.nextReminderDate!).toDateString() === new Date().toDateString(),
  );

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      "Not lifted": "bg-gray-100 text-gray-700",
      "Not connected": "bg-red-100 text-red-700",
      "Voice Message": "bg-blue-100 text-blue-700",
      "Quotation sent": "bg-yellow-100 text-yellow-700",
      "Site visit": "bg-purple-100 text-purple-700",
      "Advance payment": "bg-orange-100 text-orange-700",
      "Lead finished": "bg-green-100 text-green-700",
      Contacted: "bg-cyan-100 text-cyan-700",
    };
    return colors[status || "Not lifted"] || "bg-slate-100 text-slate-700";
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const reminderDate = new Date(date);
    const diffTime = reminderDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Alert Section */}
      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900">Overdue Reminders</h4>
              <p className="text-sm text-red-700 mt-1">
                You have {overdueCount} lead{overdueCount !== 1 ? "s" : ""} with overdue reminders
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <h4 className="font-semibold text-amber-900">Today's Actions</h4>
          </div>
          <div className="space-y-3">
            {todayReminders.map((reminder) => (
              <div key={reminder.id} className="bg-white rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{reminder.name}</p>
                    <p className="text-sm text-slate-600">
                      {reminder.jobTitle && `${reminder.jobTitle} • `}
                      {reminder.company || "No company"}
                    </p>
                    {reminder.note && (
                      <p className="text-sm text-slate-700 mt-2 italic">
                        "{reminder.note}"
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(reminder.status)}`}>
                    {reminder.status || "Not lifted"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Upcoming Reminders
          </h3>
          <span className="text-sm font-medium text-slate-600">
            {upcoming.length} total
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-slate-600">No upcoming reminders</p>
            <p className="text-xs text-slate-500 mt-1">
              All your leads are up to date
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 10).map((reminder) => {
              const daysUntil = getDaysUntil(reminder.nextReminderDate!);
              return (
                <div key={reminder.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-2">
                        <p className="font-medium text-slate-900 flex-1">
                          {reminder.name}
                        </p>
                        <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${getStatusColor(reminder.status)}`}>
                          {reminder.status || "Not lifted"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {reminder.jobTitle && `${reminder.jobTitle} • `}
                        {reminder.company || "No company"}
                      </p>
                      {reminder.email && (
                        <a
                          href={`mailto:${reminder.email}`}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
                        >
                          <LinkIcon className="w-3 h-3" />
                          {reminder.email}
                        </a>
                      )}
                      {reminder.note && (
                        <p className="text-sm text-slate-700 mt-2 bg-slate-50 rounded p-2 italic">
                          "{reminder.note}"
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(reminder.nextReminderDate!).toLocaleDateString()}
                      </p>
                      <p className={`text-xs font-medium mt-1 ${
                        daysUntil === 0 ? "text-red-600" :
                        daysUntil === 1 ? "text-amber-600" :
                        daysUntil <= 3 ? "text-orange-600" :
                        daysUntil <= 7 ? "text-blue-600" : "text-slate-600"
                      }`}>
                        {daysUntil === 0 ? "Today" :
                         daysUntil === 1 ? "Tomorrow" :
                         `In ${daysUntil} days`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly Summary */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h4 className="font-semibold text-slate-900 mb-3">Next 7 Days Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">
              {overdueCount}
            </p>
            <p className="text-xs text-slate-600">Overdue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {nextWeekReminders.length}
            </p>
            <p className="text-xs text-slate-600">This Week</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {upcoming.length - nextWeekReminders.length}
            </p>
            <p className="text-xs text-slate-600">Later</p>
          </div>
        </div>
      </div>
    </div>
  );
}

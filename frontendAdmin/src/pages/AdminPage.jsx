import { useMemo, useState } from "react";

const courses = [
  ["UI/UX Masterclass", "Design", "Rs 89.00", "1,204", "Published"],
  ["Full Stack Dev Bootcamp", "Development", "Rs 149.00", "3,450", "Published"],
  ["Digital Marketing Strategy", "Marketing", "Rs 59.00", "892", "Draft"],
  ["Python for Data Science", "Development", "Rs 120.00", "2,115", "Published"],
  ["AWS Cloud Certification", "Development", "Rs 199.00", "1,876", "Published"],
  ["Product Management Fundamentals", "Business", "Rs 79.00", "654", "Draft"],
];

const users = [
  ["John Doe", "john@example.com", "5", "2024-01-15", "Active"],
  ["Jane Smith", "jane@example.com", "3", "2024-02-01", "Active"],
  ["Mike Johnson", "mike@example.com", "8", "2023-11-20", "Active"],
  ["Sarah Williams", "sarah@example.com", "2", "2024-01-28", "Inactive"],
  ["David Brown", "david@example.com", "6", "2023-12-10", "Active"],
];

const enrollments = [
  ["John Doe", "UI/UX Masterclass", "2024-02-08", "Rs 89.00", "Completed"],
  ["Jane Smith", "Full Stack Dev Bootcamp", "2024-02-07", "Rs 149.00", "Completed"],
  ["Mike Johnson", "Python for Data Science", "2024-02-06", "Rs 120.00", "Pending"],
  ["Sarah Williams", "Digital Marketing Strategy", "2024-02-05", "Rs 59.00", "Completed"],
  ["David Brown", "AWS Cloud Certification", "2024-02-04", "Rs 199.00", "Refunded"],
];

const transactions = [
  ["John Doe", "UI/UX Masterclass", "+Rs 89.00", "2024-02-08", "text-green-600"],
  ["Jane Smith", "Full Stack Dev Bootcamp", "+Rs 149.00", "2024-02-07", "text-green-600"],
  ["Mike Johnson", "Python for Data Science", "+Rs 120.00", "2024-02-06", "text-amber-500"],
  ["Sarah Williams", "Digital Marketing Strategy", "+Rs 59.00", "2024-02-05", "text-green-600"],
  ["David Brown", "AWS Cloud Certification", "-Rs 199.00", "2024-02-04", "text-red-600"],
];

const navItems = [
  ["dashboard", "Dashboard"],
  ["courses", "Courses"],
  ["users", "Users"],
  ["enrollments", "Enrollments"],
  ["payments", "Payments"],
];

function AdminPage() {
  const [page, setPage] = useState("courses");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const title = useMemo(() => {
    switch (page) {
      case "dashboard":
        return "Dashboard";
      case "courses":
        return "Manage Courses";
      case "users":
        return "Manage Users";
      case "enrollments":
        return "Enrollments";
      case "payments":
        return "Payments";
      default:
        return "Dashboard";
    }
  }, [page]);

  const handleNavClick = (id) => {
    setPage(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-canvas-alt text-main">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border/50 rounded-4xl shadow-2xl p-8 w-80 text-center">
            <h3 className="text-sm font-black uppercase tracking-tight text-main mb-2">Logout</h3>
            <p className="text-xs text-muted mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border border-border hover:bg-canvas-alt transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  setProfilePopupOpen(false);
                }}
                className="flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`fixed top-0 left-0 z-[70] bg-card/70 backdrop-blur-2xl border-r border-border/50 transform transition-all duration-500 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "lg:w-24" : "lg:w-80"} w-80 h-screen overflow-visible`}
      >
        <div className="h-16 border-b border-border/50 px-4 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <p className="text-sm font-black uppercase tracking-tight">UptoSkills</p>
              <p className="text-[9px] text-muted uppercase tracking-widest">Admin Portal</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-9 h-9 rounded-xl border border-border bg-card"
            type="button"
          >
            X
          </button>
        </div>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-5 top-8 w-10 h-10 bg-card border border-border rounded-xl items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-xl z-80"
          type="button"
        >
          <span className={`transition-transform duration-500 ${sidebarCollapsed ? "" : "rotate-180"}`}>
            {'>'}
          </span>
        </button>

        <nav className={`mt-8 px-4 h-[calc(100vh-16rem)] scrollbar-hide ${sidebarCollapsed ? "overflow-visible" : "overflow-y-auto"}`}>
          <div className="space-y-3">
            {navItems.map(([id, label]) => {
              const isActive = page === id;
              return (
                <div
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={`group relative flex items-center px-4 py-4 rounded-3xl cursor-pointer transition-all duration-300 ${
                    sidebarCollapsed ? "justify-center" : ""
                  } ${isActive ? "bg-teal-500 text-white shadow-xl shadow-teal-500/30" : "text-muted hover:bg-canvas-alt"}`}
                >
                  <div className={`w-5 h-5 shrink-0 rounded-md flex items-center justify-center text-[10px] font-black ${isActive ? "bg-white/20" : "bg-border/60 text-main"}`}>
                    {label[0]}
                  </div>
                  {!sidebarCollapsed && (
                    <span className={`ml-4 text-sm font-black uppercase tracking-tight ${isActive ? "text-white" : ""}`}>
                      {label}
                    </span>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl z-50 uppercase tracking-widest">
                      {label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-4">
          {profilePopupOpen && (
            <div
              className={`absolute bottom-full mb-6 left-4 right-4 bg-card/95 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-[0_-20px_80px_rgba(0,0,0,0.3)] overflow-hidden z-90 ${
                sidebarCollapsed ? "w-52 -left-2" : ""
              }`}
            >
              <div className="p-6 border-b border-border/50 bg-linear-to-tr from-teal-500/10 to-transparent text-center">
                <div className="w-16 h-16 rounded-3xl mx-auto mb-3 shadow-2xl border-2 border-card bg-teal-500 text-white text-xl font-black flex items-center justify-center">
                  A
                </div>
                <h4 className="text-xs font-black text-main uppercase tracking-tighter">Admin</h4>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setProfilePopupOpen(false)}
                  className="flex items-center w-full px-4 py-4 text-[10px] font-black uppercase text-main hover:bg-teal-500 hover:text-white rounded-3xl transition-all"
                >
                  Settings
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center w-full px-4 py-4 text-[10px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white rounded-3xl transition-all mt-1"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          <div
            onClick={() => setProfilePopupOpen(!profilePopupOpen)}
            className={`cursor-pointer group relative p-0.5 rounded-4xl bg-linear-to-br from-teal-500/30 via-blue-500/20 to-transparent transition-all duration-500 shadow-lg hover:shadow-teal-500/10 ${
              profilePopupOpen ? "ring-2 ring-teal-500" : ""
            }`}
          >
            <div className={`bg-card dark:bg-slate-900 rounded-[1.9rem] transition-all duration-300 ${sidebarCollapsed ? "p-1" : "p-4 flex items-center"}`}>
              <div className={`${sidebarCollapsed ? "w-12 h-12" : "w-10 h-10"} rounded-[1.2rem] shadow-md border-2 border-white dark:border-slate-800 transition-all bg-teal-500 text-white font-black flex items-center justify-center`}>
                A
              </div>
              {!sidebarCollapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <div className="text-[11px] font-black text-main truncate uppercase tracking-tight">Admin</div>
                  <div className="text-[9px] text-muted font-bold opacity-50 uppercase tracking-widest mt-0.5">Account</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main
        className={`min-h-screen flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-24" : "lg:ml-80"
        }`}
      >
        <header className="h-16 bg-card border-b border-border px-4 md:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-10 px-3 rounded-xl border border-border bg-input text-main"
              type="button"
            >
              Menu
            </button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-2xl px-4 py-2 min-w-64 bg-input text-muted border border-border">
              <span className="text-sm">Search courses...</span>
            </div>
            <button type="button" className="relative h-10 w-10 rounded-xl bg-input border border-border text-main">
              B
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button type="button" className="h-11 px-4 md:px-6 rounded-2xl text-white font-bold bg-teal-500 hover:bg-teal-600 transition-all">
              + Add Course
            </button>
          </div>
        </header>

        <section className="p-4 md:p-8">
          <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
            {page === "dashboard" && <DashboardPage />}
            {page === "courses" && <CoursesPage />}
            {page === "users" && <UsersPage />}
            {page === "enrollments" && <EnrollmentsPage />}
            {page === "payments" && <PaymentsPage />}
          </div>
        </section>
      </main>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-semibold mb-3">Admin Dashboard</h2>
      <p className="text-muted">
        Use sidebar navigation to manage courses, users, enrollments, and payments.
      </p>
    </div>
  );
}

function CoursesPage() {
  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Active Courses</h2>
        <div className="flex gap-2">
          <button type="button" className="h-10 px-4 rounded-xl border border-border bg-input">Filter</button>
          <button type="button" className="h-10 px-4 rounded-xl border border-border bg-input">Export</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">Course Detail</th>
              <th>Category</th>
              <th>Pricing</th>
              <th>Enrolled</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {courses.map(([name, category, price, enrolled, status]) => (
              <tr key={name} className="border-b border-border">
                <td className="p-5">
                  <div className="font-semibold">{name}</div>
                  <div className="text-muted">Last updated recently</div>
                </td>
                <td><span className="px-3 py-1 rounded-full bg-input">{category}</span></td>
                <td className="font-semibold">{price}</td>
                <td>{enrolled}</td>
                <td className={status === "Published" ? "text-green-600" : "text-orange-500"}>{status}</td>
                <td className="text-lg">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function UsersPage() {
  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">All Users</h2>
        <div className="flex gap-2">
          <button type="button" className="h-10 px-4 rounded-xl border border-border bg-input">Filter</button>
          <button type="button" className="h-10 px-4 rounded-xl text-white bg-teal-500 hover:bg-teal-600 transition-all">+ Add User</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">User</th>
              <th>Email</th>
              <th>Enrolled Courses</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {users.map(([name, mail, enrolled, joinDate, status]) => (
              <tr key={mail} className="border-b border-border">
                <td className="p-5 font-medium">{name}</td>
                <td>{mail}</td>
                <td>{enrolled}</td>
                <td>{joinDate}</td>
                <td className={status === "Active" ? "text-green-600" : "text-red-600"}>{status}</td>
                <td className="text-lg">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function EnrollmentsPage() {
  return (
    <>
      <div className="border-b border-border p-6 md:p-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold">All Enrollments</h2>
        <button type="button" className="h-10 px-4 rounded-xl border border-border bg-input">Export Report</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-215">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-border">
              <th className="p-5">Student</th>
              <th>Course</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {enrollments.map(([name, course, date, amount, status]) => (
              <tr key={`${name}-${course}`} className="border-b border-border">
                <td className="p-5 font-medium">{name}</td>
                <td>{course}</td>
                <td>{date}</td>
                <td className="font-semibold">{amount}</td>
                <td className={status === "Completed" ? "text-green-600" : status === "Pending" ? "text-amber-500" : "text-red-600"}>{status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PaymentsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-border p-5 bg-canvas-alt"><p className="text-muted">Total Revenue</p><p className="text-5xl font-bold">Rs 45,200</p></article>
        <article className="rounded-2xl border border-border p-5 bg-canvas-alt"><p className="text-muted">This Month</p><p className="text-5xl font-bold text-green-600">Rs 8,450</p></article>
        <article className="rounded-2xl border border-border p-5 bg-canvas-alt"><p className="text-muted">Pending</p><p className="text-5xl font-bold text-orange-500">Rs 1,230</p></article>
        <article className="rounded-2xl border border-border p-5 bg-canvas-alt"><p className="text-muted">Refunded</p><p className="text-5xl font-bold text-red-600">Rs 450</p></article>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-2xl font-semibold">Recent Transactions</h3>
        </div>
        {transactions.map(([name, course, amount, date, amountColor]) => (
          <div key={`${name}-${date}-${amount}`} className="p-5 border-b border-border flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-muted">{course}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${amountColor}`}>{amount}</p>
              <p className="text-sm text-muted">{date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;

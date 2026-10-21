import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import {
  deleteAdminCourseService,
  fetchAdminCoursesService,
  fetchAdminDashboardService,
} from "@/services";
import {
  BookOpen,
  DollarSign,
  Edit,
  GraduationCap,
  LoaderCircle,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function AdminDashboardPage() {
  const { auth, resetCredentials } = useContext(AuthContext);
  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
  } = useContext(InstructorContext);
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [coursePage, setCoursePage] = useState(1);
  const [coursePagination, setCoursePagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, coursesResponse] = await Promise.all([
        fetchAdminDashboardService(),
        fetchAdminCoursesService(coursePage),
      ]);
      if (
        !dashboardResponse?.success ||
        !dashboardResponse.data ||
        !coursesResponse?.success
      ) {
        throw new Error("The dashboard data could not be loaded.");
      }
      setDashboard(dashboardResponse.data);
      setCourses(coursesResponse.data);
      setCoursePagination(coursesResponse.pagination);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError.message ||
          "The dashboard data could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, [coursePage]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  function handleCreateCourse() {
    setCurrentEditedCourseId(null);
    setCourseLandingFormData(courseLandingInitialFormData);
    setCourseCurriculumFormData(courseCurriculumInitialFormData);
    navigate("/admin/create-new-course");
  }

  function handleEditCourse(courseId) {
    setCurrentEditedCourseId(courseId);
    navigate(`/admin/edit-course/${courseId}`);
  }

  async function handleDeleteCourse(course) {
    const confirmed = window.confirm(
      `Delete "${course.title}"? Courses with purchases or enrollments cannot be deleted.`
    );
    if (!confirmed) return;

    setError("");
    try {
      const response = await deleteAdminCourseService(course._id);
      if (!response?.success) {
        throw new Error(response?.message || "The course could not be deleted.");
      }
      await loadDashboard();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError.message ||
          "The course could not be deleted."
      );
    }
  }

  const stats = dashboard?.stats;
  const cards = [
    {
      label: "Total users",
      value: stats?.totalUsers,
      detail: `${numberFormatter.format(stats?.students || 0)} learners · ${numberFormatter.format(stats?.instructors || 0)} instructors`,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Courses",
      value: stats?.totalCourses,
      detail: `${numberFormatter.format(stats?.publishedCourses || 0)} published`,
      icon: BookOpen,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Enrollments",
      value: stats?.totalEnrollments,
      detail: `${numberFormatter.format(stats?.paidOrders || 0)} paid orders`,
      icon: GraduationCap,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Paid revenue",
      value: currencyFormatter.format(stats?.revenue || 0),
      detail: `${numberFormatter.format(stats?.adminUsers || 0)} admin accounts`,
      icon: DollarSign,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-white px-5 py-7 md:flex">
        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold tracking-tight">LearnSpace</p>
            <p className="text-xs text-slate-500">Admin console</p>
          </div>
        </div>
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Platform
        </p>
        <a
          href="#overview"
          className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-900"
        >
          Overview
        </a>
        <div className="mt-auto border-t pt-5">
          <p className="truncate px-3 text-sm font-medium">
            {auth?.user?.userName || "Administrator"}
          </p>
          <p className="mb-4 truncate px-3 text-xs text-slate-500">
            {auth?.user?.userEmail}
          </p>
          <Button
            className="w-full justify-start"
            variant="ghost"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="min-h-screen px-4 py-6 md:ml-64 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <header
            id="overview"
            className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                Administration
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Platform overview
              </h1>
              <p className="mt-1 text-slate-500">
                Monitor learners, courses, enrollments, and revenue.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={loadDashboard}
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleLogout} className="md:hidden">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </header>

          {error ? (
            <div
              role="alert"
              className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadDashboard}>
                Try again
              </Button>
            </div>
          ) : null}

          {loading && !dashboard ? (
            <div className="flex min-h-64 items-center justify-center text-slate-500">
              <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
              Loading dashboard…
            </div>
          ) : dashboard ? (
            <>
              <section
                aria-label="Platform statistics"
                className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              >
                {cards.map((card) => (
                  <Card key={card.label} className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-medium text-slate-500">
                        {card.label}
                      </CardTitle>
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}
                      >
                        <card.icon className="h-4 w-4" />
                      </span>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {typeof card.value === "number"
                          ? numberFormatter.format(card.value)
                          : card.value}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </section>

              <section
                id="users"
                className="mb-8 grid gap-6 xl:grid-cols-2"
                aria-label="Recent platform activity"
              >
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboard.recentUsers?.length ? (
                            dashboard.recentUsers.map((user) => (
                              <TableRow key={user._id}>
                                <TableCell className="font-medium">
                                  {user.userName}
                                </TableCell>
                                <TableCell>{user.userEmail}</TableCell>
                                <TableCell className="capitalize">
                                  {user.role}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="py-8 text-center text-slate-500"
                              >
                                No users found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

              </section>

              <section id="courses" className="mb-8">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <CardTitle className="text-lg">Manage courses</CardTitle>
                        <p className="mt-1 text-sm text-slate-500">
                          Create, edit, or delete platform courses.
                        </p>
                      </div>
                      <Button onClick={handleCreateCourse}>
                        <Plus className="mr-2 h-4 w-4" />
                        New course
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Instructor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courses.length ? (
                            courses.map((course) => (
                              <TableRow key={course._id}>
                                <TableCell>
                                  <p className="font-medium">{course.title}</p>
                                  <p className="text-xs text-slate-500">
                                    {course.category || "Uncategorized"}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  {course.instructorName || "—"}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                      course.isPublised
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {course.isPublised ? "Published" : "Draft"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {currencyFormatter.format(
                                    Number(course.pricing) || 0
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Edit ${course.title}`}
                                    onClick={() =>
                                      handleEditCourse(course._id)
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Delete ${course.title}`}
                                    onClick={() => handleDeleteCourse(course)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="py-8 text-center text-slate-500"
                              >
                                No courses found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        {coursePagination?.total || 0} courses
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!coursePagination || coursePage <= 1}
                          onClick={() => setCoursePage((page) => page - 1)}
                        >
                          Previous
                        </Button>
                        <span className="flex items-center px-2 text-sm text-slate-500">
                          Page {coursePagination?.page || 1} of{" "}
                          {coursePagination?.pages || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            !coursePagination ||
                            coursePage >= coursePagination.pages
                          }
                          onClick={() => setCoursePage((page) => page + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
              <p className="text-center text-xs text-slate-400">
                {numberFormatter.format(stats?.totalUsers || 0)} accounts across
                the platform
              </p>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;

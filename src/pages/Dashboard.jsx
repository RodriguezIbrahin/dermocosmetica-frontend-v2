import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/20/solid";
import {
  DocumentTextIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuthStore } from "../store/authStore";
import { analysisService } from "../services/analysisService";
import AnalysisDetail from "../components/AnalysisDetail";

const StateColors = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-emerald-500",
  error: "bg-red-500",
};

const StateLabels = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Completado",
  error: "Error",
};

const ITEMS_PER_PAGE = 10;

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([
    {
      id: 1,
      name: "Total de Análisis",
      stat: "0",
      icon: DocumentTextIcon,
      change: "0",
      changeType: "increase",
    },
    {
      id: 2,
      name: "Análisis Completados",
      stat: "0%",
      icon: CheckBadgeIcon,
      change: "0%",
      changeType: "increase",
    },
    {
      id: 3,
      name: "Tasa de Error",
      stat: "0%",
      icon: ExclamationTriangleIcon,
      change: "0%",
      changeType: "decrease",
    },
  ]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: ITEMS_PER_PAGE,
    total: 0,
    pageCount: 0,
  });
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchAnalyses = async (page = 1) => {
    try {
      setError(null);
      setLoading(true);
      const response = await analysisService.getAnalyses({
        page,
        pageSize: ITEMS_PER_PAGE,
      });
      setAnalyses(response.data);
      setPagination({
        page,
        pageSize: ITEMS_PER_PAGE,
        total: response.meta.pagination.total,
        pageCount: response.meta.pagination.pageCount,
      });

      // Calculate stats
      const total = response.meta.pagination.total;
      const completed = response.data.filter(
        (a) => a.state === "completed"
      ).length;
      const errors = response.data.filter((a) => a.state === "error").length;

      const completedPercentage = (
        (completed / response.data.length) *
        100
      ).toFixed(2);
      const errorRate = ((errors / response.data.length) * 100).toFixed(2);

      // Previous month stats (mock data for now - you can implement real comparison later)
      const prevTotal = total - 10;
      const prevCompletedPercentage = completedPercentage - 5;
      const prevErrorRate = errorRate + 3;

      setStats([
        {
          id: 1,
          name: "Total de Análisis",
          stat: total.toString(),
          icon: DocumentTextIcon,
          change: `${(((total - prevTotal) / prevTotal) * 100).toFixed(1)}%`,
          changeType: total >= prevTotal ? "increase" : "decrease",
        },
        {
          id: 2,
          name: "Análisis Completados",
          stat: `${completedPercentage}%`,
          icon: CheckBadgeIcon,
          change: `${(completedPercentage - prevCompletedPercentage).toFixed(
            1
          )}%`,
          changeType:
            completedPercentage >= prevCompletedPercentage
              ? "increase"
              : "decrease",
        },
        {
          id: 3,
          name: "Tasa de Error",
          stat: `${errorRate}%`,
          icon: ExclamationTriangleIcon,
          change: `${Math.abs(errorRate - prevErrorRate).toFixed(1)}%`,
          changeType: errorRate <= prevErrorRate ? "increase" : "decrease",
        },
      ]);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      setError(error.message || "Error al cargar los análisis");
      if (
        error.message.includes("Token") ||
        error.message.includes("autenticación")
      ) {
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user) {
      navigate("/signin");
      return;
    }
    fetchAnalyses(1);
  }, [navigate, token, user]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pageCount) {
      fetchAnalyses(newPage);
    }
  };

  const handleAnalysisClick = (analysis) => {
    setSelectedAnalysis(analysis);
    setIsDetailOpen(true);
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, pagination.page - halfVisible);
    let end = Math.min(pagination.pageCount, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    if (start > 1) {
      pages.push(
        <a
          key="1"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(1);
          }}
          className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
        >
          1
        </a>
      );
      if (start > 2) {
        pages.push(
          <span
            key="start-ellipsis"
            className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500"
          >
            ...
          </span>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <a
          key={i}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(i);
          }}
          aria-current={pagination.page === i ? "page" : undefined}
          className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
            pagination.page === i
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          {i}
        </a>
      );
    }

    if (end < pagination.pageCount) {
      if (end < pagination.pageCount - 1) {
        pages.push(
          <span
            key="end-ellipsis"
            className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500"
          >
            ...
          </span>
        );
      }
      pages.push(
        <a
          key={pagination.pageCount}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(pagination.pageCount);
          }}
          className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
        >
          {pagination.pageCount}
        </a>
      );
    }

    return pages;
  };

  if (loading && !analyses.length) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Display */}
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Últimos 30 días
          </h3>

          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-5 shadow-sm sm:px-6 sm:pt-6"
              >
                <dt>
                  <div className="absolute rounded-md bg-indigo-500 p-3">
                    <item.icon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">
                    {item.name}
                  </p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">
                    {item.stat}
                  </p>
                  <p
                    className={classNames(
                      item.changeType === "increase"
                        ? "text-green-600"
                        : "text-red-600",
                      "ml-2 flex items-baseline text-sm font-semibold"
                    )}
                  >
                    {item.changeType === "increase" ? (
                      <ArrowUpIcon
                        aria-hidden="true"
                        className="size-5 shrink-0 self-center text-green-500"
                      />
                    ) : (
                      <ArrowDownIcon
                        aria-hidden="true"
                        className="size-5 shrink-0 self-center text-red-500"
                      />
                    )}

                    <span className="sr-only">
                      {" "}
                      {item.changeType === "increase"
                        ? "Increased"
                        : "Decreased"}{" "}
                      by{" "}
                    </span>
                    {item.change}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Existing Analysis History */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-300 p-5">
            <div className="-mt-2 -ml-2 flex flex-wrap items-baseline">
              <h3 className="mt-2 ml-2 text-base font-semibold text-gray-900">
                Historial de analisis
              </h3>
            </div>
          </div>

          {analyses.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No hay análisis disponibles</p>
            </div>
          ) : (
            <>
              <ul role="list" className="divide-y divide-gray-100">
                {analyses.map((analysis) => (
                  <li
                    key={analysis.id}
                    className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 lg:px-8 cursor-pointer"
                    onClick={() => handleAnalysisClick(analysis)}
                  >
                    <div className="flex min-w-0 gap-x-4">
                      <img
                        alt=""
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          analysis.patient?.username
                        )}&background=random`}
                        className="size-12 flex-none rounded-full bg-gray-50"
                      />
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm/6 font-semibold text-gray-900">
                          <span className="absolute inset-x-0 -top-px bottom-0" />
                          {analysis.patient?.username}
                        </p>
                        <p className="mt-1 flex text-xs/5 text-gray-500">
                          {analysis.patient?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-x-4">
                      <div className="hidden sm:flex sm:flex-col sm:items-end">
                        <p className="text-sm/6 text-gray-900">
                          {analysis.type === "skin"
                            ? "Análisis de Piel"
                            : analysis.type}
                        </p>
                        <div className="mt-1 flex items-center gap-x-1.5">
                          <div
                            className={`flex-none rounded-full ${
                              StateColors[analysis?.state]
                            }/20 p-1`}
                          >
                            <div
                              className={`size-1.5 rounded-full ${
                                StateColors[analysis?.state]
                              }`}
                            />
                          </div>
                          <p className="text-xs/5 text-gray-500">
                            {StateLabels[analysis?.state]}
                          </p>
                        </div>
                      </div>
                      <ChevronRightIcon
                        aria-hidden="true"
                        className="size-5 flex-none text-gray-400"
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <nav
                aria-label="Pagination"
                className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
              >
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700">
                    Mostrando{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.pageSize + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.pageSize,
                        pagination.total
                      )}
                    </span>{" "}
                    de <span className="font-medium">{pagination.total}</span>{" "}
                    resultados
                  </p>
                </div>
                <div className="flex flex-1 justify-between sm:justify-end">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pageCount}
                    className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </nav>
            </>
          )}
        </div>
      </div>

      <AnalysisDetail
        analysis={selectedAnalysis}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </DashboardLayout>
  );
};

export default Dashboard;

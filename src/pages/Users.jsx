import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/20/solid";
import {
  UsersIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuthStore } from "../store/authStore";
import { useStatsStore } from "../store/statsStore";
import { userService } from "../services/user.service";

const ITEMS_PER_PAGE = 10;

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Users = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { totalUsers, blockedUsers, adminUsers } = useStatsStore();
  const [stats, setStats] = useState([
    {
      id: 1,
      name: "Total de Usuarios",
      stat: "0",
      icon: UsersIcon,
      change: "0",
      changeType: "increase",
    },
    {
      id: 2,
      name: "Usuarios Administradores",
      stat: "0",
      icon: ShieldCheckIcon,
      change: "0",
      changeType: "increase",
    },
    {
      id: 3,
      name: "Usuarios Bloqueados",
      stat: "0",
      icon: NoSymbolIcon,
      change: "0",
      changeType: "decrease",
    },
  ]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: ITEMS_PER_PAGE,
    total: 0,
    pageCount: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [blockingUsers, setBlockingUsers] = useState({});

  const fetchUsers = async (page = 1) => {
    try {
      setError(null);
      setLoading(true);
      const response = await userService.getUsers({
        search: searchTerm,
        page,
        pageSize: ITEMS_PER_PAGE,
      });
      setUsers(response.data);
      setPagination({
        page,
        pageSize: ITEMS_PER_PAGE,
        total: response.meta.pagination.total,
        pageCount: response.meta.pagination.pageCount,
      });

      await userService.getStats();
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message || "Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [navigate, token, user]);

  useEffect(() => {
    setStats([
      {
        id: 1,
        name: "Total de Usuarios",
        stat: totalUsers.toString(),
        icon: UsersIcon,
        change: `0%`,
        changeType: "increase",
      },
      {
        id: 2,
        name: "Usuarios Administradores",
        stat: adminUsers.toString(),
        icon: ShieldCheckIcon,
        change: `0%`,
        changeType: "increase",
      },
      {
        id: 3,
        name: "Usuarios Bloqueados",
        stat: blockedUsers.toString(),
        icon: NoSymbolIcon,
        change: `0%`,
        changeType: "decrease",
      },
    ]);
  }, [totalUsers, blockedUsers, adminUsers]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pageCount) {
      fetchUsers(newPage);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleToggleBlock = async (userId) => {
    try {
      setBlockingUsers((prev) => ({ ...prev, [userId]: true }));
      await userService.toggleUserBlock(userId);
      // Refresh the users list
      await fetchUsers(pagination.page);
    } catch (error) {
      console.error("Error toggling user block:", error);
      // Show error in UI
      setError(error.message || "Error al actualizar el estado del usuario");
    } finally {
      setBlockingUsers((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading && !users.length) {
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
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Stats Display */}
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Estadísticas de Usuarios
          </h3>

          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-5 shadow-sm sm:px-6 sm:pt-6"
              >
                <dt>
                  <div className="absolute rounded-md bg-rose-300 p-3">
                    <item.icon
                      className="size-6 text-white"
                      aria-hidden="true"
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
                        className="size-5 shrink-0 self-center text-green-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <ArrowDownIcon
                        className="size-5 shrink-0 self-center text-red-500"
                        aria-hidden="true"
                      />
                    )}
                    <span className="sr-only">
                      {item.changeType === "increase"
                        ? "Increased"
                        : "Decreased"}{" "}
                      by
                    </span>
                    {item.change}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Users List */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-300 p-5">
            <div className="-mt-2 -ml-2 flex flex-wrap items-center justify-between">
              <h3 className="mt-2 ml-2 text-base font-semibold text-gray-900">
                Lista de Usuarios
              </h3>
              <button
                onClick={() => navigate("/users/create")}
                className="mt-2 ml-2 inline-flex items-center rounded-md bg-rose-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                  />
                </svg>
                Crear Usuario
              </button>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No hay usuarios disponibles</p>
            </div>
          ) : (
            <>
              <ul role="list" className="divide-y divide-gray-100">
                {users.map((user, index) => (
                  <li
                    key={user.id}
                    className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 lg:px-8"
                  >
                    <div className="flex min-w-0 gap-x-4">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.username
                        )}&background=${index % 2 === 0 ? "d4d4d4" : "d3858f"}`}
                        alt=""
                        className="size-12 flex-none rounded-full bg-gray-50"
                      />
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.username}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Rol: {user.roleClinic}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-4">
                      <button
                        onClick={() => handleToggleBlock(user.id)}
                        disabled={blockingUsers[user.id]}
                        className={classNames(
                          "rounded-md px-3 py-2 text-sm font-semibold shadow-sm",
                          user.blocked
                            ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 hover:bg-green-100"
                            : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 hover:bg-red-100",
                          blockingUsers[user.id] &&
                            "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {blockingUsers[user.id] ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Procesando...
                          </span>
                        ) : user.blocked ? (
                          "Desbloquear"
                        ) : (
                          "Bloquear"
                        )}
                      </button>
                      <ChevronRightIcon
                        className="size-5 flex-none text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
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
    </DashboardLayout>
  );
};

export default Users;

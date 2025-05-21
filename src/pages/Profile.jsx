import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/auth.service";

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, login } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    documentId: "",
    roleClinic: "",
    device: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        navigate("/signin");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userData = await authService.getCurrentUser(token);
        setFormData({
          username: userData.username || "",
          email: userData.email || "",
          phone: userData.phone || "",
          documentId: userData.documentId || "",
          roleClinic: userData.roleClinic || "",
          device: userData.device || "",
        });
        login(userData, token);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message);
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

    fetchUserData();
  }, [token, navigate, login]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authService.updateUserProfile(
        user.id,
        formData
      );
      login(updatedUser, token);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !formData.username) {
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
      <div className="space-y-5 divide-y divide-gray-900/10">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-8 gap-y-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl"
          >
            <div className="p-4 sm:p-8">
              <div className="max-w-full">
                {/* Perfil Header */}
                <div className="flex items-center gap-x-8 pb-8 border-b border-gray-900/10">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      formData.username
                    )}&background=random&size=96`}
                    alt=""
                    className="size-24 rounded-full bg-gray-50"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold leading-7 text-gray-900">
                      {formData.username}
                    </h3>
                    <p className="text-lg leading-6 text-gray-600">
                      {user?.clinic?.name}
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Editar perfil
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {/* Columna Izquierda */}
                  <div className="space-y-8">
                    {/* Información Personal */}
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">
                        Información Personal
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="relative flex items-center">
                          <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="block w-full rounded-md border-0 pl-10 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                          />
                        </div>

                        <div className="relative flex items-center">
                          <IdentificationIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="documentId"
                            id="documentId"
                            value={formData.documentId}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Documento de Identidad"
                            className="block w-full rounded-md border-0 pl-10 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                          />
                        </div>

                        <div className="relative flex items-center">
                          <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="block w-full rounded-md border-0 pl-10 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                          />
                        </div>

                        <div className="relative flex items-center">
                          <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="block w-full rounded-md border-0 pl-10 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información de la Cuenta */}
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">
                        Información de la Cuenta
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-x-2 text-sm">
                          <ClockIcon className="size-5 text-gray-400" />
                          <span className="font-medium text-gray-700">
                            Creado el:
                          </span>
                          <span className="text-gray-600">
                            {user ? formatDate(user.createdAt) : "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-x-2 text-sm">
                          <ClockIcon className="size-5 text-gray-400" />
                          <span className="font-medium text-gray-700">
                            Última actualización:
                          </span>
                          <span className="text-gray-600">
                            {user ? formatDate(user.updatedAt) : "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-x-2 text-sm">
                          <ShieldCheckIcon className="size-5 text-gray-400" />
                          <span className="font-medium text-gray-700">
                            Estado de la cuenta:
                          </span>
                          <span
                            className={`${
                              user?.blocked ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {user?.blocked ? "Bloqueada" : "Activa"}
                          </span>
                          {user?.confirmed && (
                            <span className="ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              Verificada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha */}
                  <div>
                    {/* Información de la Clínica */}
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">
                        Información de la Clínica
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="relative flex items-center">
                          <BuildingOfficeIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={user?.clinic?.name || ""}
                            disabled
                            className="block w-full rounded-md border-0 pl-10 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                          />
                        </div>

                        <div className="relative flex items-center">
                          <ShieldCheckIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="roleClinic"
                            id="roleClinic"
                            value={formData.roleClinic}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Rol en la Clínica"
                            className="block w-full rounded-md border-0 pl-10 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                          />
                        </div>

                        <div className="relative flex items-center">
                          <DevicePhoneMobileIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="device"
                            id="device"
                            value={formData.device}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Dispositivo"
                            className="block w-full rounded-md border-0 pl-10 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                          />
                        </div>

                        {/* Información adicional de la clínica */}
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                          <div className="flex items-center gap-x-2 text-sm">
                            <BuildingOfficeIcon className="size-5 text-gray-400" />
                            <span className="font-medium text-gray-700">
                              ID de la Clínica:
                            </span>
                            <span className="text-gray-600">
                              {user?.clinic?.documentId || "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-x-2 text-sm">
                            <PhoneIcon className="size-5 text-gray-400" />
                            <span className="font-medium text-gray-700">
                              Teléfono:
                            </span>
                            <span className="text-gray-600">
                              {user?.clinic?.phone || "-"}
                            </span>
                          </div>
                          {user?.clinic?.website && (
                            <div className="flex items-center gap-x-2 text-sm">
                              <EnvelopeIcon className="size-5 text-gray-400" />
                              <span className="font-medium text-gray-700">
                                Sitio web:
                              </span>
                              <a
                                href={user.clinic.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-500"
                              >
                                {user.clinic.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;

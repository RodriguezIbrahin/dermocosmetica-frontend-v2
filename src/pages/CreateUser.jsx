import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import DashboardLayout from "../layouts/DashboardLayout";
import { userService } from "../services/user.service";
import { useAuthStore } from "../store/authStore";

export default function CreateUser() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError,
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      device: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (formData) => {
    try {
      // Preparar datos para enviar
      const userData = {
        ...formData,
        blocked: false,
        confirmed: true,
        roleClinic: "userClinic",
        clinic: user?.clinic,
        role: 1,
      };
      // Eliminar confirmPassword ya que no es necesario enviarlo
      delete userData.confirmPassword;

      await userService.createUser(userData);
      navigate("/users");
    } catch (error) {
      console.error("Error creating user:", error);
      setError("root", {
        type: "manual",
        message: error.message || "Error al crear el usuario",
      });
    }
  };

  return (
    <DashboardLayout>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-12 sm:space-y-16 max-w-3xl mx-auto py-8"
      >
        {errors.root && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {errors.root.message}
                </h3>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Crear Nuevo Usuario
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Complete la información del nuevo usuario para la clínica.
          </p>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Nombre de Usuario
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  id="username"
                  {...register("username", {
                    required: "El nombre de usuario es requerido",
                    minLength: {
                      value: 3,
                      message: "El nombre debe tener al menos 3 caracteres",
                    },
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-md sm:text-sm sm:leading-6"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Correo Electrónico
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "El correo electrónico es requerido",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Correo electrónico inválido",
                    },
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-md sm:text-sm sm:leading-6"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Contraseña
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="password"
                  id="password"
                  {...register("password", {
                    required: "La contraseña es requerida",
                    minLength: {
                      value: 6,
                      message: "La contraseña debe tener al menos 6 caracteres",
                    },
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-md sm:text-sm sm:leading-6"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Confirmar Contraseña
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="password"
                  id="confirmPassword"
                  {...register("confirmPassword", {
                    required: "Por favor confirme la contraseña",
                    validate: (value) =>
                      value === password || "Las contraseñas no coinciden",
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-md sm:text-sm sm:leading-6"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="phone"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Teléfono
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="tel"
                  id="phone"
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message:
                        "Por favor ingrese un número de teléfono válido (10 dígitos)",
                    },
                  })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-md sm:text-sm sm:leading-6"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="device"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Dispositivo
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  id="device"
                  {...register("device")}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-md sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Creando...
              </span>
            ) : (
              "Crear Usuario"
            )}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}

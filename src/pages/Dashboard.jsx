import DashboardLayout from "../layouts/DashboardLayout";
import { useAuthStore } from "../store/authStore";

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Bienvenido, {user?.username}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Información de Usuario
            </h3>
            <p className="text-gray-600">Email: {user?.email}</p>
            <p className="text-gray-600">Rol: {user?.roleClinic}</p>
            <p className="text-gray-600">
              Teléfono: {user?.phone || "No especificado"}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Información de la Clínica
            </h3>
            <p className="text-gray-600">Nombre: {user?.clinic?.name}</p>
            <p className="text-gray-600">Teléfono: {user?.clinic?.phone}</p>
            <p className="text-gray-600">Website: {user?.clinic?.website}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

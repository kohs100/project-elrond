import { Navigate, Outlet } from "react-router-dom";
import { useSupabaseAuth, type SingletonContextType } from "../hooks/useSupabaseAuth";

const ProtectedRoute = () => {
  const { singleton, loading } = useSupabaseAuth();

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-700 font-medium">
          로딩 중입니다...
        </p>
      </div>
    );
  return singleton ? (
    <Outlet context={{ singleton } satisfies SingletonContextType} />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;

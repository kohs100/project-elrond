import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import type { User } from "@supabase/supabase-js";

const MainMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      throw error;
    }

    const { user } = data;
    setUser(user);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return user ? (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">메인 메뉴</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/search")}
            className="bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            검색
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
          >
            대시보드 (WIP)
          </button>
          <button
            onClick={() => navigate("/map?mapid=d1_w")}
            className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            1일차 서관
          </button>
          <button
            onClick={() => navigate("/map?mapid=d1_e456")}
            className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            1일차 동관
          </button>
          <button
            onClick={() => navigate("/logout")}
            className="bg-red-500 text-white py-2 rounded hover:bg-red-600 mt-6"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default MainMenu;

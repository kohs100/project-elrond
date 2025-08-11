import { useNavigate, useOutletContext } from "react-router-dom";
import { type SingletonContextType } from "../hooks/useSupabaseAuth";

const MainMenu = () => {
  const navigate = useNavigate();
  const { singleton } = useOutletContext<SingletonContextType>();

  return <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center" style={{overflowY: "scroll"}}>
        <h2 className="text-2xl font-bold mb-6">Hello, {singleton.name}!</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/search")}
            className="bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            검색
          </button>
          <button
            onClick={() => navigate("/favorite")}
            className="bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
          >
            즐겨찾기
          </button>


          <button
            onClick={() => navigate("/map?mapid=d1_s")}
            className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            1일차 남관
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
            1일차 동456관
          </button>
          <button
            onClick={() => navigate("/map?mapid=d1_e7")}
            className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            1일차 동7관
          </button>

          <button
            onClick={() => navigate("/map?mapid=d2_s")}
            className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            2일차 남관
          </button>
          <button
            onClick={() => navigate("/map?mapid=d2_w")}
            className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            2일차 서관
          </button>
          <button
            onClick={() => navigate("/map?mapid=d2_e456")}
            className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            2일차 동456관
          </button>
          <button
            onClick={() => navigate("/map?mapid=d2_e7")}
            className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
          >
            2일차 동7관
          </button>

          <button
            onClick={() => navigate("/reset-name")}
            className="bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            이름 변경
          </button>
          <button
            onClick={() => navigate("/logout")}
            className="bg-red-500 text-white py-2 rounded hover:bg-red-600 mt-6"
          >
            로그아웃
          </button>
          <button
            onClick={() => navigate("/reset-password")}
            className="bg-red-500 text-white py-2 rounded hover:bg-red-600 mt-6"
          >
            비밀번호 재설정
          </button>

        </div>
      </div>
    </div>
};

export default MainMenu;

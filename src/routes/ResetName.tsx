import { useState, type FormEvent } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { SingletonContextType } from "../hooks/useSupabaseAuth";

export default function ResetName() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { singleton } = useOutletContext<SingletonContextType>();

  const handleResetName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("user").update({
      name: name,
    }).eq('id', singleton.uid);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ 이름이 성공적으로 변경되었습니다!");
      setTimeout(() => navigate("/"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">이름 재설정</h2>
        <form onSubmit={handleResetName}>
          <input
            type="text"
            placeholder="새 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border w-full p-2 mb-4 rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
          >
            {loading ? "처리 중..." : "이름 변경"}
          </button>
        </form>
        {message && (
          <p className="mt-3 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}

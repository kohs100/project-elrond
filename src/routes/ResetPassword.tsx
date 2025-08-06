import { useState, type FormEvent } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ 비밀번호가 성공적으로 변경되었습니다!");
      setTimeout(() => navigate("/"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">비밀번호 재설정</h2>
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="새 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border w-full p-2 mb-4 rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
          >
            {loading ? "처리 중..." : "비밀번호 변경"}
          </button>
        </form>
        {message && (
          <p className="mt-3 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}

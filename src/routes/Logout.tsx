import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const signOut = async () => {
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    };
    signOut();
  }, [navigate]);

  return <div>로그아웃 중...</div>;
};

export default Logout;

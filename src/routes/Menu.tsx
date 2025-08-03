import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import type { User } from "@supabase/supabase-js";

const MainMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    const {data, error} = await supabase.auth.getUser();
    if (error) {
      throw error;
    }

    const {user} = data;
    setUser(user);
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return user
   ? <div>
    <h2>Hello, {user.email}</h2>
    <p><a href="/logout">Logout</a></p>
    <p><a href="/search">Search</a></p>
    <p><a href="/map?mapid=d1_w">Map (Day1 West)</a></p>
    <p><a href="/map?mapid=d1_e456">Map (Day1 East 456)</a></p>
    <p><a href="/dashboard">Dashboard (WIP)</a></p>
   </div>
   : <></>;
};

export default MainMenu;

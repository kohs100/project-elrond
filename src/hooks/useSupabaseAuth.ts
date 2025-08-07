import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

export type Singleton = {
  uid: string,
  name: string,
}

export type SingletonContextType = {
  singleton: Singleton
}

export const useSupabaseAuth = () => {
  const [singleton, setSingleton] = useState<Singleton | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSession = async (sess: Session | null) => {
    if (sess?.user?.id) {
      const { data, error } = await supabase.from("user").select("*").eq("id", sess.user.id);
      if (error) throw error;
      else if (data === null) throw new Error("User read failed!!");
      else if (data.length > 1) throw new Error("Too many users!!");
      else if (data.length == 0) {
        const temp_name = sess.user.email ? sess.user.email : "NOEMAIL";
        const { error } = await supabase.from("user").insert({
          id: sess.user.id,
          name: temp_name
        });
        if (error) {
          throw new Error("User creation failed!!");
        } else {
          loginSuccess({
            uid: sess.user.id,
            name: temp_name
          })
        }
      } else {
        loginSuccess({
          uid: sess.user.id,
          name: data[0].name
        })
      }
    }
  }

  const loginFailed = () => {
    setSingleton(null);
    setLoading(false);
  }

  const loginSuccess = (singleton: Singleton) => {
    setSingleton(singleton);
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) handleSession(data.session);
      else loginFailed();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { singleton, loading };
};

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUser() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (auth.user) {
        setUser(auth.user);
        const { data } = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
        setProfile(data);
      }
    })();
  }, []);

  return { user, profile };
}

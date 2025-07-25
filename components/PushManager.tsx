"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PushManager() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const registerPush = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      // Aguarda o service worker estar ativo
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Evita múltiplas inscrições
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        });
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const sub: any = subscription.toJSON();

      await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint: sub.endpoint,
        keys_p256dh: sub.keys.p256dh,
        keys_auth: sub.keys.auth,
      });
    };

    registerPush().catch(console.error);
  }, []);

  return null;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64String = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64String);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

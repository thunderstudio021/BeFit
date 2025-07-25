"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PushSubscriptionButton() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "done" | "error" | "unavailable"
  >("loading");

  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setStatus("unavailable");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          setStatus("idle");
          return;
        }

        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setStatus("done"); // já está ativado
        } else {
          setStatus("idle"); // pode ativar
        }
      } catch (err) {
        console.error("Erro ao checar subscription:", err);
        setStatus("error");
      }
    };

    checkExistingSubscription();
  }, []);

  const handlePushActivation = async () => {
    setStatus("loading");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("error");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) throw new Error("VAPID key ausente");

        const applicationServerKey = urlBase64ToUint8Array(vapidKey);

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const endpoint = subscription.endpoint;
      const p256dh = subscription.getKey("p256dh");
      const auth = subscription.getKey("auth");

      const keys_p256dh = p256dh
        ? btoa(String.fromCharCode(...new Uint8Array(p256dh)))
        : null;
      const keys_auth = auth
        ? btoa(String.fromCharCode(...new Uint8Array(auth)))
        : null;

      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint,
        keys_p256dh,
        keys_auth,
      });

      if (error) throw error;

      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  if (status !== "idle") return null;

  return (
    <Button
      onClick={handlePushActivation}
      className="btn-neon-purple gap-2"
      disabled={status === "loading"}
    >
      <Bell className="w-4 h-4" />
      Ativar Notificações
    </Button>
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64String = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64String);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

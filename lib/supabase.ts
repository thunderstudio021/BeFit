'use client'

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createBrowserSupabaseClient()

export async function getUser() {
  const {
    data: {
      session,
    },
    error: sessionError
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    console.error("Erro ao obter sessão:", sessionError)
    return null
  }

  const userId = session.user.id

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, fitcoins, username")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Erro ao buscar perfil:", error)
    return null
  }

  return data
}
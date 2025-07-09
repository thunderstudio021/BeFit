import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email, password, user_type } = await req.json()

  const { data: authData, error } = await supabase.auth.signUp({ email, password })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Cria profile com user_type
  await supabase.from("profiles").insert({
    id: authData.user?.id,
    user_type
  })

  return NextResponse.json({ message: "User created!" })
}

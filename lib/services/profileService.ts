import { supabase } from '@/lib/supabase'

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[profileService] Erro ao buscar perfil:', error)
    throw error
  }

  return data
}

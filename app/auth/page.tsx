"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  const router = useRouter()

  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    whatsapp: "",
    password: ""
  })

  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password
    })
    if (error) return setError(error.message)
    await supabase.auth.setSession({
      access_token: data.session?.access_token!,
      refresh_token: data.session?.refresh_token!
    })

    window.location.href = "/" // redireciona após login
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if(registerData.whatsapp.length < 10){
      setError("Telefone invalido!")
      return "";
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password
    })
    if (signUpError) return setError(signUpError.message)

    const { error: updateError } = await supabase
    .from("profiles")
    .update({
      user_type: "free", // ou o que desejar
      full_name: `${registerData.firstName} ${registerData.lastName}`,
      username: registerData.username,
      whatsapp: registerData.whatsapp,
      email: registerData.email,
    })
    .eq("id", data.user?.id)

    if (updateError) {
      console.error("Erro ao inserir perfil:", updateError)
      return setError("Erro ao salvar perfil.")
    }

    window.location.href = "/"
  }

  function formatPhone(value: string) {
    // Remove tudo que não for número
    const cleaned = value.replace(/\D/g, '');

    // Aplica máscara conforme a quantidade de dígitos
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      setRegisterData({ ...registerData, whatsapp: formatted });
    };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={"https://supabase.befitbrasil.app/storage/v1/object/public/befit/BEFIT---LOGO-BRANCA.png"} />
          <p className="text-gray-300">Sua jornada fitness começa aqui</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger value="login" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300">
              Cadastro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Entrar</CardTitle>
                <CardDescription className="text-gray-400">Entre com suas credenciais para acessar sua conta</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input id="email" type="email" required value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className="bg-gray-700 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Senha</Label>
                    <Input id="password" type="password" required value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="bg-gray-700 text-white" />
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">Entrar</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Criar Conta</CardTitle>
                <CardDescription className="text-gray-400">Preencha os dados para criar sua conta</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-300">Nome</Label>
                      <Input id="firstName" required value={registerData.firstName} onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })} className="bg-gray-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-300">Sobrenome</Label>
                      <Input id="lastName" required value={registerData.lastName} onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })} className="bg-gray-700 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300">Usuário</Label>
                    <Input id="username" required value={registerData.username} onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })} className="bg-gray-700 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input id="email" type="email" required value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} className="bg-gray-700 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-gray-300">WhatsApp</Label>
                    <Input id="whatsapp" required minLength={10} value={registerData.whatsapp} onChange={(e) => handlePhoneChange(e)} className="bg-gray-700 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Senha</Label>
                    <Input id="password" type="password" required value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} className="bg-gray-700 text-white" />
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">Criar Conta</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6 text-gray-400 text-sm">
          Ao continuar, você concorda com nossos <a href="#" className="text-purple-400 hover:text-purple-300">Termos de Uso</a> e <a href="#" className="text-purple-400 hover:text-purple-300">Política de Privacidade</a>
        </div>
      </div>
    </div>
  )
}

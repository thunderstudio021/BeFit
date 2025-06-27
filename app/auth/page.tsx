"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    whatsapp: "",
    password: "",
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login:", loginData)
    // Aqui será implementada a lógica de login
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Register:", registerData)
    // Aqui será implementada a lógica de cadastro
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">BBFitness</h1>
          <p className="text-gray-300">Sua jornada fitness começa aqui</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              Cadastro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Entrar</CardTitle>
                <CardDescription className="text-gray-400">
                  Entre com suas credenciais para acessar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                  >
                    Entrar
                  </Button>
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
                      <Label htmlFor="firstName" className="text-gray-300">
                        Nome
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="João"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-300">
                        Sobrenome
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Silva"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300">
                      Usuário
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="@seuusuario"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerEmail" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-gray-300">
                      WhatsApp <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={registerData.whatsapp}
                      onChange={(e) => setRegisterData({ ...registerData, whatsapp: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="text-gray-300">
                      Senha
                    </Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                  >
                    Criar Conta
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Coins, TrendingUp, TrendingDown, Calendar, Clock, Award, Sparkles } from "lucide-react"
import AppLayout from "@/components/app-layout"
import { useEffect, useState } from "react"
import { formatInTimeZone } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface CompletedChallenge {
  id: number
  name: string
  completionDate: string
  fitcoinsEarned: number
  category: string
}

interface OngoingChallenge {
  id: number
  name: string
  progress: number
  totalDays: number
  completedDays: number
  timeRemaining: string
  category: string
}

interface FitcoinSummary {
  earned: number
  spent: number
  balance: number
}

export default function StatisticsPage() {
  const [completedChallenges, setCompletedChallenges] = useState<CompletedChallenge[]>([
    {
      id: 1,
      name: "30 Dias de Exercícios",
      completionDate: "2024-12-15T10:00:00Z",
      fitcoinsEarned: 5,
      category: "Fitness",
    },
    {
      id: 2,
      name: "Hidratação Perfeita",
      completionDate: "2024-12-10T15:30:00Z",
      fitcoinsEarned: 3,
      category: "Saúde",
    },
    {
      id: 3,
      name: "Alimentação Saudável",
      completionDate: "2024-12-05T20:00:00Z",
      fitcoinsEarned: 4,
      category: "Nutrição",
    },
  ])

  const [ongoingChallenges, setOngoingChallenges] = useState<OngoingChallenge[]>([
    {
      id: 4,
      name: "Meditação Diária",
      progress: 65,
      totalDays: 21,
      completedDays: 14,
      timeRemaining: "7 dias",
      category: "Bem-estar",
    },
    {
      id: 5,
      name: "10.000 Passos",
      progress: 40,
      totalDays: 30,
      completedDays: 12,
      timeRemaining: "18 dias",
      category: "Fitness",
    },
    {
      id: 6,
      name: "Leitura Semanal",
      progress: 85,
      totalDays: 7,
      completedDays: 6,
      timeRemaining: "1 dia",
      category: "Desenvolvimento",
    },
  ])

  const [fitcoinSummary, setFitcoinSummary] = useState<FitcoinSummary>({
    earned: 45,
    spent: 28,
    balance: 17,
  })

  useEffect(() => {
  const loadChallengeData = async () => {
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id
    if (!userId) return

    // 1. Buscar todos os desafios do usuário
    const { data: challenges, error } = await supabase
      .from("challange")
      .select(`
        id,
        progress,
        post_id,
        posts:post_id (
          id,
          poll_options
        )
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Erro ao buscar desafios:", error)
      return
    }

    const completed: CompletedChallenge[] = []
    const ongoing: OngoingChallenge[] = []

    let totalEarned = 0

    challenges.forEach((c:any) => {
      const opts = c.posts?.poll_options || {}
      const totalDays = opts.days || 0
      const name = opts.title || "Desafio"
      const category = opts.category || "Geral"
      const completedDays = c.progress || 0
      const progressPercent = Math.floor((completedDays / totalDays) * 100)
      const remainingDays = totalDays - completedDays

      if (completedDays >= totalDays) {
        completed.push({
          id: c.id,
          name,
          completionDate: new Date().toISOString(),
          fitcoinsEarned: 1, // ou qualquer lógica de recompensa
          category,
        })
        totalEarned += 1
      } else {
        ongoing.push({
          id: c.id,
          name,
          progress: progressPercent,
          totalDays,
          completedDays,
          timeRemaining: `${remainingDays} dias`,
          category,
        })
      }
    })

    // 2. Buscar gastos em Fitcoins
    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("price_paid")
      .eq("user_id", userId)
      .eq("currency", "fitcoin")

    const totalSpent = purchases?.reduce((acc, p) => acc + Number(p.price_paid), 0) || 0

    // 3. Atualiza estados
    setCompletedChallenges(completed)
    setOngoingChallenges(ongoing)
    setFitcoinSummary({
      earned: totalEarned,
      spent: totalSpent,
      balance: totalEarned - totalSpent,
    })
  }

  loadChallengeData()
}, [])

  const formatDate = (dateString: string) => {
    return formatInTimeZone(dateString, "dd/MM/yyyy")
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Fitness: "bg-purple-500/20 text-purple-500 border-purple-500/30",
      Saúde: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      Nutrição: "bg-green-500/20 text-green-500 border-green-500/30",
      "Bem-estar": "bg-pink-500/20 text-pink-500 border-pink-500/30",
      Desenvolvimento: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    }
    return colors[category as keyof typeof colors] || "bg-gray-500/20 text-gray-500 border-gray-500/30"
  }

  return (
    <AppLayout>
      <div className="flex-1 p-4 pb-16 md:pb-4 md:pl-72 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Minhas Estatísticas</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso e conquistas</p>
        </div>

        <div className="space-y-6">
          {/* Resumo de Fitcoins */}
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                Resumo de Fitcoins - Dezembro 2024
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fitcoins Ganhos */}
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ganhos</p>
                      <p className="text-2xl font-bold text-green-500">{fitcoinSummary.earned}</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-500/80">Fitcoins conquistados</p>
                </div>

                {/* Fitcoins Gastos */}
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gastos</p>
                      <p className="text-2xl font-bold text-red-500">{fitcoinSummary.spent}</p>
                    </div>
                  </div>
                  <p className="text-xs text-red-500/80">Fitcoins utilizados</p>
                </div>

                {/* Saldo */}
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo</p>
                      <p className="text-2xl font-bold text-blue-500">+{fitcoinSummary.balance}</p>
                    </div>
                  </div>
                  <p className="text-xs text-blue-500/80">Diferença do mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Desafios em Andamento */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Desafios em Andamento
                <Badge variant="secondary" className="ml-auto">
                  {ongoingChallenges.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ongoingChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Nenhum desafio em andamento</p>
                  <p className="text-sm text-muted-foreground/80">Que tal começar um novo desafio?</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ongoingChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{challenge.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge className={getCategoryColor(challenge.category)} variant="outline">
                              {challenge.category}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{challenge.timeRemaining} restantes</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-500">{challenge.progress}%</p>
                          <p className="text-xs text-muted-foreground">
                            {challenge.completedDays}/{challenge.totalDays} dias
                          </p>
                        </div>
                      </div>
                      <Progress
                        value={challenge.progress}
                        className="h-2 bg-purple-500/20"
                        indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desafios Concluídos */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                Desafios Concluídos
                <Badge variant="secondary" className="ml-auto">
                  {completedChallenges.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Nenhum desafio concluído ainda</p>
                  <p className="text-sm text-muted-foreground/80">Complete seu primeiro desafio para aparecer aqui!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="p-4 rounded-lg border bg-green-500/5 border-green-500/20 hover:bg-green-500/10 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Award className="w-5 h-5 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{challenge.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge className={getCategoryColor(challenge.category)} variant="outline">
                                {challenge.category}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Concluído em {formatDate(challenge.completionDate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Coins className="w-4 h-4" />
                            <span className="font-bold">+{challenge.fitcoinsEarned}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Fitcoins</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

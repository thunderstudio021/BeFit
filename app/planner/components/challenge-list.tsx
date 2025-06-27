"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Trophy } from "lucide-react"
import { useFitcoin } from "@/hooks/use-fitcoin"

interface Challenge {
  id: string
  title: string
  type: string
  completed: boolean
  addedAt: string
}

export default function ChallengeList() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const { addFitcoin } = useFitcoin()

  // Carregar desafios do localStorage
  useEffect(() => {
    const loadChallenges = () => {
      const savedChallenges = localStorage.getItem("userChallenges")
      if (savedChallenges) {
        setChallenges(JSON.parse(savedChallenges))
      }
    }

    loadChallenges()

    // Adicionar event listener para atualizar quando houver mudanças
    window.addEventListener("storage", loadChallenges)

    return () => {
      window.removeEventListener("storage", loadChallenges)
    }
  }, [])

  // Marcar desafio como concluído
  const completeChallenge = (id: string) => {
    const updatedChallenges = challenges.map((challenge) =>
      challenge.id === id ? { ...challenge, completed: true } : challenge,
    )

    setChallenges(updatedChallenges)
    localStorage.setItem("userChallenges", JSON.stringify(updatedChallenges))

    // Adicionar exatamente 1 fitcoin ao completar desafio
    addFitcoin(1)
    alert("Desafio concluído!")
  }

  // Se não houver desafios, retornar null
  if (challenges.length === 0) {
    return null
  }

  return (
    <Card className="card-neon mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Trophy className="w-5 h-5 text-orange-500" />
          Desafios Ativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                challenge.completed
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-muted/50 hover:shadow-glow-subtle"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    challenge.completed ? "bg-green-500/20" : "bg-orange-500/20"
                  }`}
                >
                  {challenge.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Trophy className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <span className={`${challenge.completed ? "text-green-500" : "text-foreground"}`}>
                  {challenge.title}
                </span>
              </div>

              {!challenge.completed && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-green-500/10 hover:text-green-500 transition-all duration-300"
                  onClick={() => completeChallenge(challenge.id)}
                >
                  Concluir
                </Button>
              )}

              {challenge.completed && (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Concluído
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

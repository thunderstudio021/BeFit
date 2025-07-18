import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon, XCircleIcon } from "lucide-react"
import Link from "next/link"

export default function SubscribePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Desbloqueie seu Potencial com o Premium!</h1>
        <p className="mt-2 text-sm text-gray-600">
          Parece que você tentou acessar um recurso exclusivo para assinantes Premium. Assine agora para ter acesso
          ilimitado a todas as funcionalidades!
        </p>

        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-purple-700">Plano Premium</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Acesso ilimitado ao Planner de Treinos
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Conteúdo Exclusivo da Área Premium
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Descontos Exclusivos na Loja Fitcoin
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                Suporte Prioritário
              </li>
              <li className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                Sem Anúncios
              </li>
            </ul>
            <div className="text-3xl font-bold text-gray-900">
              R$ 29,90 <span className="text-base font-normal text-gray-500">/ mês</span>
            </div>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="https://lastlink.com/p/C4D8D0865/checkout-payment">Assinar Agora</Link>
            </Button>
            <p className="text-xs text-gray-500 mt-2">*Este é um botão de checkout simulado para demonstração.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

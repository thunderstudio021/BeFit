"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  CheckCircle,
  Plus,
  Droplet,
  Trophy,
  UtensilsCrossed,
  Dumbbell,
  Target,
  ShoppingCart,
  Sparkles,
  Award,
  Edit,
  Trash2,
  Settings,
  Clock,
} from "lucide-react"
import AppLayout from "@/components/app-layout"
import { useEffect, useState } from "react"
import { useFitcoin } from "@/hooks/use-fitcoin"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/hooks/useUser"

interface MealItem {
  id: number
  meal: string
  food: string
  completed: boolean
}

interface WorkoutItem {
  id: number
  type: string
  name: string
  time: string
  completed: boolean
}

interface ShoppingItem {
  id: number
  item: string
  checked: boolean
}

interface DailyGoal {
  id: number
  goal: string
  checked: boolean
}

interface Challenge {
  id: number
  title: string
  totalDays: number
  completedDays: number
  motivationalPhrase: string
  completed: boolean
  lastCheckDate?: string
}

export default function PlannerPage() {
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  const today = new Date().getDay()
  const currentDate = new Date()

 

  // Estados para notificações
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "challenge" | "fitcoin"
    title: string
    message: string
  }>({ show: false, type: "success", title: "", message: "" })

  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0])
  const {user, profile} = useUser();

   // Estados para água
  const [waterIntake, setWaterIntake] = useState(0)
  const [waterGoal, setWaterGoal] = useState(profile?.water * 1000) // 2L em ml
  const [showWaterCelebration, setShowWaterCelebration] = useState(false)
  const [showWaterSettings, setShowWaterSettings] = useState(false)
  const [tempWaterGoal, setTempWaterGoal] = useState(2)
  const { addFitcoin } = useFitcoin()


  // Estados para desafios
  const [challenges, setChallenges] = useState<Challenge[]>([])

  async function fetchUserChallenges(userId: string) {
  const { data: challenges, error } = await supabase
    .from('challange')
    .select(`
      id,
      post_id,
      progress,
      posts:post_id (
        poll_options
      ),
      checks:challenge_check(
        date
      )
    `)
    .eq('user_id', userId)
    console.log('challenges', challenges);
  if (error) {
    console.error('Erro ao buscar desafios:', error)
    return []
  }

  return challenges.map((c: any) => {
    const opts = c.posts?.poll_options || {}
    const lastCheck = c.checks?.sort((a, b) => b.date.localeCompare(a.date))?.[0]?.date || null
    console.log('lastCheck', lastCheck);
    return {
      id: c.id,
      title: opts.title || 'Desafio',
      totalDays: opts.days || 0,
      completedDays: c.progress || 0,
      motivationalPhrase: getRandomPhrase(),
      completed: (c.progress || 0) >= (opts.days || 0),
      lastCheckDate: lastCheck,
    }
  })
}


function getRandomPhrase() {
  const phrases = [
    "Um passo de cada vez. Você está indo bem!",
    "Persistência supera talento. Continue firme!",
    "Desistir não é uma opção. Bora pra cima!",
    "Cada dia é uma vitória. Você consegue!",
    "Seu esforço vai valer a pena. Orgulhe-se disso!",
    "Continue. Você já chegou até aqui!",
    "Você é mais forte do que pensa!",
    "Desafie-se, surpreenda-se!",
    "O progresso mora na constância!",
    "Não pare agora. Você está quase lá!",
  ]
  return phrases[Math.floor(Math.random() * phrases.length)]
}



  // Seus estados
  const [meals, setMeals] = useState<MealItem[]>([])
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([])

  const fetchData = async () => {

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      

      // 1) Meals
      const { data: mealsData } = await supabase
        .from("planner_meals")
        .select("*")
        .eq("user_id", user.id)

      const { data: mealsCheck } = await supabase
        .from("planner_meals_check")
        .select("*")
        .in("planner_meals_id", mealsData?.map(m => m.id) || [])
        .eq("date", date)

      const mergedMeals = mealsData?.map(m => ({
        id: m.id,
        meal: m.meal_name,
        food: m.food_description,
        completed: mealsCheck?.find(c => c.planner_meals_id === m.id)?.is_completed || false
      })) || []

      setMeals(mergedMeals)

      // 2) Workouts
      const { data: workoutsData } = await supabase
        .from("planner_workouts")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)

      const { data: workoutsCheck } = await supabase
        .from("planner_workouts_check")
        .select("*")
        .in("planner_workouts_id", workoutsData?.map(w => w.id) || [])
        .eq("date", date)

      const mergedWorkouts = workoutsData?.map(w => ({
        id: w.id,
        name: w.workout_name,
        type: w.workout_type,
        time: w.scheduled_time,
        completed: workoutsCheck?.find(c => c.planner_workouts_id === w.id)?.is_completed || false
      })) || []

      setWorkouts(mergedWorkouts)

      // 3) Shopping
      const { data: shoppingData } = await supabase
        .from("planner_shopping")
        .select("*")
        .eq("user_id", user.id)

      const { data: shoppingCheck } = await supabase
        .from("planner_shopping_check")
        .select("*")
        .in("planner_shopping_id", shoppingData?.map(s => s.id) || [])
        .eq("date", date)

      const mergedShopping = shoppingData?.map(s => ({
        id: s.id,
        item: s.item_name,
        checked: shoppingCheck?.find(c => c.planner_shopping_id === s.id)?.is_checked || false
      })) || []

      setShoppingList(mergedShopping)

      // 4) Daily Goals
      const { data: goalsData } = await supabase
        .from("planner_goals")
        .select("*")
        .eq("user_id", user.id)

      const { data: goalsCheck } = await supabase
        .from("planner_goals_check")
        .select("*")
        .in("goals_planner_id", goalsData?.map(g => g.id) || [])
        .eq("date", date)

      const mergedGoals = goalsData?.map(g => ({
        id: g.id,
        goal: g.goal_description,
        checked: goalsCheck?.find(c => c.goals_planner_id === g.id)?.is_completed || false
      })) || []

      setDailyGoals(mergedGoals)

      const challanges = await fetchUserChallenges(user.id);
      setChallenges(challanges);

      const water = await getWaterTotal(user.id, date);
      setWaterIntake(water)

      const { data: profile2 } = await supabase
        .from("profiles")
        .select("water")
        .eq("id", user.id)
        console.log('profile2', profile2);
      setWaterGoal(profile2[0].water * 1000)
    }

  useEffect(() => {
    fetchData()
  }, [date])

  // Estados para edição
  const [editingMeal, setEditingMeal] = useState<number | null>(null)
  const [editingWorkout, setEditingWorkout] = useState<number | null>(null)
  const [editingShopping, setEditingShopping] = useState<number | null>(null)
  const [editingGoal, setEditingGoal] = useState<number | null>(null)
  const [editingWorkoutType, setEditingWorkoutType] = useState<number | null>(null)
  const [newItemText, setNewItemText] = useState("")

  // Estados temporários para edição
  const [tempMealFood, setTempMealFood] = useState("")
  const [tempWorkoutName, setTempWorkoutName] = useState("")
  const [tempWorkoutType, setTempWorkoutType] = useState("")
  const [tempShoppingItem, setTempShoppingItem] = useState("")
  const [tempDailyGoal, setTempDailyGoal] = useState("")

  // Frase do dia
  const dailyQuote = {
    text: "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    author: "Robert Collier",
  }

  // Função para verificar se pode fazer check no desafio (24h)
  function canCheckChallenge(challenge: Challenge) {
    if (!challenge.lastCheckDate) return true

    const today = new Date()
    
    // Parse como UTC puro (ano, mês, dia)
    const [year, month, day] = challenge.lastCheckDate.split('-').map(Number)
    const lastDate = new Date(Date.UTC(year, month - 1, day))

    const isSameDay =
      today.getUTCFullYear() === lastDate.getUTCFullYear() &&
      today.getUTCMonth() === lastDate.getUTCMonth() &&
      today.getUTCDate() === lastDate.getUTCDate()

    console.log('canCheckChallenge', lastDate.toDateString(), today.toDateString(), !isSameDay, challenge.lastCheckDate)

    return !isSameDay
  }

  // Função para mostrar notificação
  const showNotification = (type: "success" | "challenge" | "fitcoin", title: string, message: string) => {
    setNotification({ show: true, type, title, message })
    setTimeout(() => setNotification({ show: false, type: "success", title: "", message: "" }), 4000)
  }

  // Adicionar água
  // Adicionar água
  const addWater = async () => {
    if (waterIntake < waterGoal) {
      const newIntake = waterIntake + 250
      setWaterIntake(newIntake)

      const today = date;

      // Upsert ingestão de água
      await supabase.rpc("upsert_water_challenge", {
        p_user_id: user.id,
        p_date: today,
        p_amount: 250
      })

      if (newIntake >= waterGoal && waterIntake < waterGoal) {
        setShowWaterCelebration(true)
        addFitcoin(user, 1)
        showNotification("fitcoin", "Meta de Água Concluída! 💧", "Você ganhou 1 Fitcoin por manter-se hidratado!")
        setTimeout(() => setShowWaterCelebration(false), 3000)
      }
    }
  }

  // Atualizar meta de água
  const updateWaterGoal = async () => {
    setWaterGoal(tempWaterGoal * 1000)
    await supabase.from("profiles").update({water: tempWaterGoal * 1000}).eq("id", user.id)
    setShowWaterSettings(false)
    showNotification("success", "Meta Atualizada! ⚙️", `Nova meta: ${tempWaterGoal}L por dia`)
  }

async function registerChallengeCheck(challengeId: number) {
  await supabase.from('challenge_check').insert({
    challenge_id: challengeId,
    date: new Date().toISOString().split('T')[0]
  })
}

const getWaterTotal = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from("water_challange")
    .select("total")
    .eq("user_id", userId)
    .eq("date", date)
    .single()

  if (error) {
    console.error("Erro ao buscar total de água:", error)
    return 0
  }

  return data.total || 0
}


  // Completar dia do desafio
  const completeChallenge = async (challengeId: number) => {
  const today = new Date().toISOString().split('T')[0]

  const challenge = challenges.find((c) => c.id === challengeId)
  if (!challenge) return

  if (!canCheckChallenge(challenge)) {
    showNotification("success", "Aguarde! ⏰", "Você já marcou hoje. Volte em 24 horas!")
    return
  }

  try {
    // 1. Salva o check no Supabase
    await registerChallengeCheck(challengeId)

    // 2. Atualiza localmente
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id !== challengeId) return c

        const newCompletedDays = c.completedDays + 1
        const isCompleted = newCompletedDays >= c.totalDays
        const now = new Date().toISOString()

        if (isCompleted) {
          addFitcoin(user, 1)
          showNotification("challenge", "Desafio Concluído! 🏆", "Parabéns! Você ganhou 1 Fitcoin!")

          // Remove o desafio após 2 segundos
          setTimeout(() => {
            setChallenges((prev) => prev.filter((c) => c.id !== challengeId))
          }, 2000)
        } else {
          showNotification("success", "Dia Concluído! ✅", c.motivationalPhrase)
        }

        return {
          ...c,
          completedDays: newCompletedDays,
          completed: isCompleted,
          lastCheckDate: today,
          checkedToday: true,
        }
      })
    )
  } catch (error) {
    //showNotification("error", "Erro", "Não foi possível registrar o progresso. Tente novamente.")
  }
}

  // -------------------------
// 🥗 Funções para refeições
// -------------------------

const toggleMeal = async (id: string) => {
  const completed = !meals.find(m => m.id === id)?.completed
  setMeals(prev => prev.map(m => m.id === id ? { ...m, completed } : m))

  await supabase.from("planner_meals_check").upsert({
    planner_meals_id: id,
    date: date,
    is_completed: completed,
  }, { onConflict: ["planner_meals_id", "date"] })
}

const addMeal = async () => {
  if (newItemText.trim()) {
    const { data, error } = await supabase.from("planner_meals").insert({
      user_id: user.id,
      meal_name: newItemText,
      food_description: "Escolha o alimento"
    }).select().single()

    if (!error && data) {
      setMeals(prev => [...prev, {
        id: data.id,
        meal: data.meal_name,
        food: data.food_description,
        completed: false
      }])
      setNewItemText("")
    }
  }
}

const updateMeal = async (id: string, food: string) => {
  await supabase.from("planner_meals").update({
    food_description: food
  }).eq("id", id)

  setMeals(prev => prev.map(m => m.id === id ? { ...m, food } : m))
  setEditingMeal(null)
}

const deleteMeal = async (id: string) => {
  await supabase.from("planner_meals").delete().eq("id", id)
  setMeals(prev => prev.filter(m => m.id !== id))
}

// -------------------------
// 🏋️ Funções para treinos
// -------------------------

const toggleWorkout = async (id: string) => {
  const completed = !workouts.find(w => w.id === id)?.completed
  setWorkouts(prev => prev.map(w => w.id === id ? { ...w, completed } : w))

  await supabase.from("planner_workouts_check").upsert({
    planner_workouts_id: id,
    date: date,
    is_completed: completed
  }, { onConflict: ["planner_workouts_id", "date"] })
}

const addWorkout = async () => {
  if (newItemText.trim()) {
    const { data, error } = await supabase.from("planner_workouts").insert({
      user_id: user.id,
      workout_name: newItemText,
      workout_type: "Exercício",
      scheduled_time: "08:00",
      date: date
    }).select().single()

    if (!error && data) {
      setWorkouts(prev => [...prev, {
        id: data.id,
        name: data.workout_name,
        type: data.workout_type,
        time: data.scheduled_time,
        completed: false
      }])
      setNewItemText("")
    }
  }
}

const updateWorkout = async (id: string, name: string) => {
  await supabase.from("planner_workouts").update({
    workout_name: name
  }).eq("id", id)

  setWorkouts(prev => prev.map(w => w.id === id ? { ...w, name } : w))
  setEditingWorkout(null)
}

const updateWorkoutType = async (id: string, type: string) => {
  await supabase.from("planner_workouts").update({
    workout_type: type
  }).eq("id", id)

  setWorkouts(prev => prev.map(w => w.id === id ? { ...w, type } : w))
  setEditingWorkoutType(null)
}

const deleteWorkout = async (id: string) => {
  await supabase.from("planner_workouts").delete().eq("id", id)
  setWorkouts(prev => prev.filter(w => w.id !== id))
}

// -------------------------
// 🛒 Funções para lista de compras
// -------------------------

const toggleShoppingItem = async (id: string) => {
  const checked = !shoppingList.find(i => i.id === id)?.checked
  setShoppingList(prev => prev.map(i => i.id === id ? { ...i, checked } : i))

  await supabase.from("planner_shopping_check").upsert({
    planner_shopping_id: id,
    date: date,
    is_checked: checked,
  }, { onConflict: ["planner_shopping_id", "date"] })
}

const addShoppingItem = async () => {
  if (newItemText.trim()) {
    const { data, error } = await supabase.from("planner_shopping").insert({
      user_id: user.id,
      item_name: newItemText,
    }).select().single()

    if (!error && data) {
      setShoppingList(prev => [...prev, {
        id: data.id,
        item: data.item_name,
        checked: false
      }])
      setNewItemText("")
    }
  }
}

const updateShoppingItem = async (id: string, item: string) => {
  await supabase.from("planner_shopping").update({
    item_name: item
  }).eq("id", id)

  setShoppingList(prev => prev.map(s => s.id === id ? { ...s, item } : s))
  setEditingShopping(null)
}

const deleteShoppingItem = async (id: string) => {
  await supabase.from("planner_shopping").delete().eq("id", id)
  setShoppingList(prev => prev.filter(i => i.id !== id))
}

// -------------------------
// 🎯 Funções para metas diárias
// -------------------------

const toggleDailyGoal = async (id: string) => {
  const checked = !dailyGoals.find(g => g.id === id)?.checked
  setDailyGoals(prev => prev.map(g => g.id === id ? { ...g, checked } : g))

  await supabase.from("planner_goals_check").upsert({
    goals_planner_id: id,
    date: date,
    is_completed: checked,
  }, { onConflict: ["goals_planner_id", "date"] })
}

const addDailyGoal = async () => {
  if (newItemText.trim()) {
    const { data, error } = await supabase.from("planner_goals").insert({
      user_id: user.id,
      goal_description: newItemText,
    }).select().single()

    if (!error && data) {
      setDailyGoals(prev => [...prev, {
        id: data.id,
        goal: data.goal_description,
        checked: false
      }])
      setNewItemText("")
    }
  }
}

const updateDailyGoal = async (id: string, goal: string) => {
  await supabase.from("planner_goals").update({
    goal_description: goal
  }).eq("id", id)

  setDailyGoals(prev => prev.map(g => g.id === id ? { ...g, goal } : g))
  setEditingGoal(null)
}

const deleteDailyGoal = async (id: string) => {
  await supabase.from("planner_goals").delete().eq("id", id)
  setDailyGoals(prev => prev.filter(g => g.id !== id))
}

const changeDate = (date:Date) => {
  setDate(date.toISOString().split("T")[0]);
  fetchData();
}
  return (
    <AppLayout>
      <div className="flex-1 p-4 pb-16 md:pb-4 md:pl-72 relative z-10">
        {/* Notificação Padrão da Plataforma com Animação Melhorada */}
        {notification.show && notification.type !== "fitcoin" && (
          <div
            className="fixed bottom-20 right-4 z-50 transition-all duration-700 ease-out"
            style={{
              opacity: notification.show ? 1 : 0,
              transform: notification.show ? "translateY(0px)" : "translateY(20px)",
              animation: notification.show
                ? "float-up 0.7s ease-out forwards, fade-out 0.5s ease-in 3.5s forwards"
                : "none",
            }}
          >
            <div
              className={`px-3 py-2 rounded-lg border backdrop-blur-sm shadow-lg max-w-xs ${
                notification.type === "challenge"
                  ? "bg-gradient-to-r from-purple-500/90 to-blue-500/90 border-purple-500/50"
                  : "bg-gradient-to-r from-green-500/90 to-emerald-500/90 border-green-500/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    notification.type === "challenge" ? "bg-white/20" : "bg-white/20"
                  }`}
                >
                  {notification.type === "challenge" ? (
                    <Trophy className="w-3 h-3 text-white" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-xs leading-tight">{notification.title}</p>
                  <p className="text-white/80 text-xs leading-tight truncate">{notification.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estilos CSS para animação personalizada */}
        <style jsx>{`
          @keyframes float-up {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(-5px);
            }
          }
          
          @keyframes fade-out {
            0% {
              opacity: 1;
              transform: translateY(-5px);
            }
            100% {
              opacity: 0;
              transform: translateY(-15px);
            }
          }
        `}</style>

        {/* Header com datas redondas */}
        <div className="mb-6">
          <Tabs defaultValue={weekDays[today].toLowerCase()} className="w-full">
            <TabsList className="w-full grid grid-cols-7 bg-transparent gap-2 h-auto mb-6 p-0">
              {weekDays.map((day, index) => {
                const date = new Date(currentDate)
                date.setDate(currentDate.getDate() - currentDate.getDay() + index)

                return (
                  <TabsTrigger
                    key={day}
                    value={day.toLowerCase()}
                    onClick={() => changeDate(date)}
                    className={`data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full aspect-square p-2 md:p-3 transition-all duration-300 data-[state=active]:shadow-glow-purple bg-card/50 backdrop-blur-sm border border-border/50 hover:scale-105 w-16 h-16 md:w-14 md:h-14 ${
                      index === today ? "ring-2 ring-purple-500/50" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-xs font-medium">{day}</span>
                      <span className="text-lg md:text-base font-bold">{date.getDate()}</span>
                    </div>
                  </TabsTrigger>
                )
              })}
            </TabsList>

              <div className="mt-0 space-y-6">
                {/* Frase do Dia */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
                  <CardContent className="relative p-6 text-center">
                    <div className="mb-4">
                      <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                    </div>
                    <blockquote className="text-lg md:text-xl font-semibold text-foreground mb-3 leading-relaxed italic">
                      "{dailyQuote.text}"
                    </blockquote>
                    <cite className="text-sm text-muted-foreground font-medium">— {dailyQuote.author}</cite>
                    <div className="mt-4 flex justify-center">
                      <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Desafios Ativos */}
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      Desafios Ativos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {challenges.map((challenge) => (
                        <div
                          key={challenge.id}
                          className={`min-w-[280px] p-4 rounded-xl border transition-all duration-500 ${
                            challenge.completed
                              ? "bg-green-500/20 border-green-500/30 opacity-50 animate-pulse"
                              : "bg-card/50 border-border/50 hover:border-purple-500/50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-foreground">{challenge.title}</h4>
                            <span className="text-xs bg-purple-500/20 px-2 py-1 rounded-full text-purple-500">
                              {challenge.completedDays}/{challenge.totalDays}
                            </span>
                          </div>

                          <Progress
                            value={(challenge.completedDays / challenge.totalDays) * 100}
                            className="h-2 mb-3 bg-purple-500/20"
                            indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
                          />

                          <p className="text-xs text-muted-foreground mb-3 italic">{challenge.motivationalPhrase}</p>

                          <Button
                            onClick={() => completeChallenge(challenge.id)}
                            disabled={challenge.completed || !canCheckChallenge(challenge)}
                            className={`w-full ${
                              challenge.completed
                                ? "btn-neon-green"
                                : !canCheckChallenge(challenge)
                                  ? "opacity-50 cursor-not-allowed"
                                  : "btn-neon-purple"
                            }`}
                            size="sm"
                          >
                            {challenge.completed
                              ? "Concluído! 🏆"
                              : !canCheckChallenge(challenge)
                                ? "Aguarde 24h ⏰"
                                : "Marcar Dia ✓"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Meta de Água */}
                <Card
                  className={`relative overflow-hidden transition-all duration-500 ${
                    showWaterCelebration
                      ? "bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border-blue-400/50 shadow-glow-blue"
                      : "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                  }`}
                >
                  {showWaterCelebration && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 animate-pulse"></div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                          <Droplet className="w-5 h-5 text-white" />
                        </div>
                        Meta de Água
                        {waterIntake >= waterGoal && <Award className="w-5 h-5 text-yellow-500 animate-bounce" />}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowWaterSettings(!showWaterSettings)}
                        className="text-blue-500 hover:text-blue-400"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    {showWaterCelebration && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-blue-500/90 backdrop-blur-sm rounded-lg p-4 text-center animate-bounce">
                          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <p className="text-white font-bold">Parabéns!</p>
                          <p className="text-white text-sm">Meta de água concluída!</p>
                        </div>
                      </div>
                    )}

                    {showWaterSettings && (
                      <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            type="number"
                            value={tempWaterGoal}
                            onChange={(e) => setTempWaterGoal(Number(e.target.value))}
                            className="w-20 text-center"
                            min="1"
                            max="5"
                          />
                          <span className="text-sm text-muted-foreground">litros por dia</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={updateWaterGoal} className="btn-neon-blue">
                            Salvar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowWaterSettings(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {waterIntake}ml / {waterGoal}ml
                        </span>
                        <Button
                          size="sm"
                          onClick={addWater}
                          className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-glow-blue transform hover:scale-105 transition-all duration-200"
                        >
                          <Plus className="w-4 h-4" /> 250ml
                        </Button>
                      </div>
                      <Progress
                        value={(waterIntake / waterGoal) * 100}
                        className="h-3 bg-blue-500/20"
                        indicatorClassName="bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-500"
                      />
                      <p className="text-xs text-center text-muted-foreground">
                        {waterIntake >= waterGoal
                          ? "🎉 Meta atingida!"
                          : `Faltam ${waterGoal - waterIntake}ml para sua meta`}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Planner Alimentar */}
                <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                          <UtensilsCrossed className="w-5 h-5 text-white" />
                        </div>
                        Planner Alimentar
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setNewItemText("")
                          setEditingMeal(-1)
                        }}
                        className="btn-neon-orange"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingMeal === -1 && (
                      <div className="mb-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <Input
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          placeholder="Ex: Lanche da Tarde"
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={addMeal} className="btn-neon-orange">
                            Adicionar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingMeal(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      {meals.map((meal) => (
                        <div
                          key={meal.id}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            meal.completed ? "bg-green-500/20 border-green-500/30" : "bg-muted/50 hover:bg-muted/70"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => toggleMeal(meal.id)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  meal.completed ? "bg-green-500/30" : "bg-orange-500/20"
                                }`}
                              >
                                {meal.completed ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                                )}
                              </button>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{meal.meal}</p>
                                {editingMeal === meal.id ? (
                                  <Input
                                    value={tempMealFood}
                                    onChange={(e) => setTempMealFood(e.target.value)}
                                    onBlur={() => {
                                      updateMeal(meal.id, tempMealFood)
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        updateMeal(meal.id, tempMealFood)
                                      }
                                    }}
                                    className="mt-1"
                                    autoFocus
                                  />
                                ) : (
                                  <p className="text-sm text-muted-foreground">{meal.food}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setTempMealFood(meal.food)
                                  setEditingMeal(meal.id)
                                }}
                                className="w-8 h-8 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteMeal(meal.id)}
                                className="w-8 h-8 p-0 text-red-500 hover:text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Planner de Treino */}
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-white" />
                        </div>
                        Planner de Treino
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setNewItemText("")
                          setEditingWorkout(-1)
                        }}
                        className="btn-neon-purple"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingWorkout === -1 && (
                      <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <Input
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          placeholder="Ex: Treino de Pernas"
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={addWorkout} className="btn-neon-purple">
                            Adicionar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingWorkout(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      {workouts.map((workout) => (
                        <div
                          key={workout.id}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            workout.completed ? "bg-green-500/20 border-green-500/30" : "bg-muted/50 hover:bg-muted/70"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => toggleWorkout(workout.id)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  workout.completed ? "bg-green-500/30" : "bg-purple-500/20"
                                }`}
                              >
                                {workout.completed ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Dumbbell className="w-4 h-4 text-purple-500" />
                                )}
                              </button>
                              <div className="flex-1">
                                {editingWorkout === workout.id ? (
                                  <Input
                                    value={tempWorkoutName}
                                    onChange={(e) => setTempWorkoutName(e.target.value)}
                                    onBlur={() => {
                                      updateWorkout(workout.id, tempWorkoutName)
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        updateWorkout(workout.id, tempWorkoutName)
                                      }
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  <>
                                    <p className="font-medium text-foreground">{workout.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      <span>{workout.time}</span>
                                      {editingWorkoutType === workout.id ? (
                                        <Input
                                          value={tempWorkoutType}
                                          onChange={(e) => setTempWorkoutType(e.target.value)}
                                          onBlur={() => {
                                            updateWorkoutType(workout.id, tempWorkoutType)
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              updateWorkoutType(workout.id, tempWorkoutType)
                                            }
                                          }}
                                          className="w-20 h-6 text-xs"
                                          autoFocus
                                        />
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setTempWorkoutType(workout.type)
                                            setEditingWorkoutType(workout.id)
                                          }}
                                          className="bg-purple-500/20 px-2 py-0.5 rounded hover:bg-purple-500/30 transition-colors"
                                        >
                                          {workout.type}
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setTempWorkoutName(workout.name)
                                  setEditingWorkout(workout.id)
                                }}
                                className="w-8 h-8 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteWorkout(workout.id)}
                                className="w-8 h-8 p-0 text-red-500 hover:text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Compras */}
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        Lista de Compras
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setNewItemText("")
                          setEditingShopping(-1)
                        }}
                        className="btn-neon-green"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingShopping === -1 && (
                      <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <Input
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          placeholder="Ex: Whey Protein"
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={addShoppingItem} className="btn-neon-green">
                            Adicionar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingShopping(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {shoppingList.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                            item.checked ? "bg-green-500/20 border-green-500/30" : "bg-muted/50 hover:bg-muted/70"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => toggleShoppingItem(item.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                item.checked ? "bg-green-500/30" : "bg-green-500/20"
                              }`}
                            >
                              {item.checked ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <ShoppingCart className="w-4 h-4 text-green-500" />
                              )}
                            </button>
                            {editingShopping === item.id ? (
                              <Input
                                value={tempShoppingItem}
                                onChange={(e) => setTempShoppingItem(e.target.value)}
                                onBlur={() => {
                                  updateShoppingItem(item.id, tempShoppingItem)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    updateShoppingItem(item.id, tempShoppingItem)
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span
                                className={`font-medium ${
                                  item.checked ? "text-green-500 line-through" : "text-foreground"
                                }`}
                              >
                                {item.item}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setTempShoppingItem(item.item)
                                setEditingShopping(item.id)
                              }}
                              className="w-8 h-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteShoppingItem(item.id)}
                              className="w-8 h-8 p-0 text-red-500 hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Metas Diárias */}
                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        Metas Diárias
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setNewItemText("")
                          setEditingGoal(-1)
                        }}
                        className="btn-neon-yellow"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingGoal === -1 && (
                      <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Input
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          placeholder="Ex: Ler 30 páginas"
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={addDailyGoal} className="btn-neon-yellow">
                            Adicionar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingGoal(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {dailyGoals.map((goal) => (
                        <div
                          key={goal.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                            goal.checked ? "bg-green-500/20 border-green-500/30" : "bg-muted/50 hover:bg-muted/70"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => toggleDailyGoal(goal.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                goal.checked ? "bg-green-500/30" : "bg-yellow-500/20"
                              }`}
                            >
                              {goal.checked ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Target className="w-4 h-4 text-yellow-500" />
                              )}
                            </button>
                            {editingGoal === goal.id ? (
                              <Input
                                value={tempDailyGoal}
                                onChange={(e) => setTempDailyGoal(e.target.value)}
                                onBlur={() => {
                                  updateDailyGoal(goal.id, tempDailyGoal)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    updateDailyGoal(goal.id, tempDailyGoal)
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span className={`font-medium ${goal.checked ? "text-green-500" : "text-foreground"}`}>
                                {goal.goal}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setTempDailyGoal(goal.goal)
                                setEditingGoal(goal.id)
                              }}
                              className="w-8 h-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteDailyGoal(goal.id)}
                              className="w-8 h-8 p-0 text-red-500 hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}

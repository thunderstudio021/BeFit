// Tipos
export interface PurchasedProduct {
  id: string
  title: string
  type: "ebook" | "video" | "audio" | "image" | "course"
  image: string
  price: number
  currency: "fitcoin" | "real"
  description: string
  fileSize?: string
  format?: string
  downloadUrl?: string
}

export interface Purchase {
  id: string
  title: string
  type: "ebook" | "video" | "audio" | "image" | "course"
  image: string
  purchaseDate: string
  price: number
  currency: "fitcoin" | "real"
  status: "completed" | "processing" | "failed"
  downloadUrl?: string
  fileSize?: string
  format?: string
  description: string
}

// Função para adicionar um produto às compras do usuário
export function addToPurchases(product: PurchasedProduct): void {
  if (typeof window === "undefined") return

  // Obter compras existentes
  const storedPurchases = localStorage.getItem("bbfitness_purchases")
  const purchases: Purchase[] = storedPurchases ? JSON.parse(storedPurchases) : []

  // Verificar se o produto já existe nas compras
  const existingProduct = purchases.find((p) => p.id === product.id)
  if (existingProduct) return

  // Criar nova compra
  const newPurchase: Purchase = {
    ...product,
    purchaseDate: new Date().toISOString(),
    status: "completed",
  }

  // Adicionar à lista e salvar
  purchases.push(newPurchase)
  localStorage.setItem("bbfitness_purchases", JSON.stringify(purchases))
}

// Função para obter todas as compras
export function getPurchases(): Purchase[] {
  if (typeof window === "undefined") return []

  const storedPurchases = localStorage.getItem("bbfitness_purchases")
  return storedPurchases ? JSON.parse(storedPurchases) : []
}

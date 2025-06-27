import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from "date-fns"
import { formatInTimeZone as formatInTz } from "date-fns-tz"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fuso horário de São Paulo
const SAO_PAULO_TIMEZONE = "America/Sao_Paulo"

/**
 * Formatar data no fuso horário de São Paulo
 */
export function formatInTimeZone(date: Date | string | number, formatStr: string, options?: { locale?: any }): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date
  return formatInTz(dateObj, SAO_PAULO_TIMEZONE, formatStr, {
    locale: options?.locale || ptBR,
  })
}

/**
 * Obter data atual no fuso horário de São Paulo
 */
export function getNowInSaoPaulo(): Date {
  return new Date()
}

/**
 * Converter data UTC para fuso horário de São Paulo
 */
export function convertToSaoPauloTime(date: Date | string | number): Date {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date
  return dateObj
}

/**
 * Converter data do fuso horário de São Paulo para UTC
 */
export function convertFromSaoPauloTime(date: Date): Date {
  return date
}

/**
 * Formatar tempo relativo (ex: "há 2 horas") no fuso horário de São Paulo
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date

  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: ptBR,
  })
}

/**
 * Formatar data completa em português brasileiro
 */
export function formatFullDate(date: Date | string | number): string {
  return formatInTimeZone(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

/**
 * Formatar data e hora em português brasileiro
 */
export function formatDateTime(date: Date | string | number): string {
  return formatInTimeZone(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

/**
 * Formatar apenas a hora
 */
export function formatTime(date: Date | string | number): string {
  return formatInTimeZone(date, "HH:mm", { locale: ptBR })
}

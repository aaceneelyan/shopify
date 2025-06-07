"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface NotificationSettings {
  frequency: string
  maxNotifications: number
  orderThreshold: number
  customBody: string
  storeName: string
  customLogo: string | null
}

export interface OrderData {
  items: number
  amount: string
  store: string
  timestamp: number
  orderId: string
}

interface NotificationContextType {
  settings: NotificationSettings
  updateSettings: (newSettings: NotificationSettings) => void
  notificationHistory: OrderData[]
  addToHistory: (order: OrderData) => void
  isScheduleActive: boolean
  setIsScheduleActive: (active: boolean) => void
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    frequency: "5",
    maxNotifications: 10,
    orderThreshold: 0,
    customBody: "You have a new order for {items} item(s) totaling ${amount} from {store}.",
    storeName: "Online Store",
    customLogo: null,
  })

  const [notificationHistory, setNotificationHistory] = useState<OrderData[]>([])
  const [isScheduleActive, setIsScheduleActive] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("shopify-notification-settings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }

      const scheduleActive = await AsyncStorage.getItem("notification-schedule-active")
      setIsScheduleActive(scheduleActive === "true")

      const enabled = await AsyncStorage.getItem("notifications-enabled")
      setNotificationsEnabled(enabled === "true")

      const history = await AsyncStorage.getItem("notification-history")
      if (history) {
        setNotificationHistory(JSON.parse(history))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const updateSettings = async (newSettings: NotificationSettings) => {
    setSettings(newSettings)
    try {
      await AsyncStorage.setItem("shopify-notification-settings", JSON.stringify(newSettings))
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  const addToHistory = async (order: OrderData) => {
    const newHistory = [order, ...notificationHistory.slice(0, 19)]
    setNotificationHistory(newHistory)
    try {
      await AsyncStorage.setItem("notification-history", JSON.stringify(newHistory))
    } catch (error) {
      console.error("Error saving history:", error)
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        settings,
        updateSettings,
        notificationHistory,
        addToHistory,
        isScheduleActive,
        setIsScheduleActive,
        notificationsEnabled,
        setNotificationsEnabled,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

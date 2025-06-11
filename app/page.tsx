"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, Smartphone, XCircle, Check, ShoppingBag } from "lucide-react"
import Image from "next/image"

interface NotificationSettings {
  frequency: string
  maxNotifications: number
  orderThreshold: number
  customBody: string
  storeName: string
  notificationColor: string
  customLogo: string | null
}

interface OrderData {
  items: number
  amount: string
  store: string
  timestamp: number
  orderId: string
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isScheduleActive, setIsScheduleActive] = useState(false)
  const [notificationHistory, setNotificationHistory] = useState<OrderData[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationCountRef = useRef(0)
  const lastResetDateRef = useRef(new Date().toDateString())

  const [settings, setSettings] = useState<NotificationSettings>({
    frequency: "5", // This will now support seconds format like "10s"
    maxNotifications: 10,
    orderThreshold: 0,
    customBody: "{store} has a new order for {items} item(s) totaling ${amount} from Online Store.",
    storeName: "HoH Fashion",
    notificationColor: "#95bf47",
    customLogo: null,
  })

  useEffect(() => {
    // Check if notifications are supported
    if ("Notification" in window) {
      setIsSupported(true)
      loadSettings()
    }
  }, [])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("shopify-notification-settings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
    const scheduleActive = localStorage.getItem("notification-schedule-active")
    setIsScheduleActive(scheduleActive === "true")

    const enabled = localStorage.getItem("notifications-enabled")
    setNotificationsEnabled(enabled === "true")

    const history = localStorage.getItem("notification-history")
    if (history) {
      setNotificationHistory(JSON.parse(history))
    }
  }

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings)
    localStorage.setItem("shopify-notification-settings", JSON.stringify(newSettings))
  }

  const generateRandomOrder = (): OrderData => {
    const items = Math.floor(Math.random() * 5) + 1
    const baseAmount = Math.random() * 150 + 25
    const amount = Math.max(baseAmount, settings.orderThreshold).toFixed(2)
    const orderId = `#${Math.floor(Math.random() * 9000) + 1000}`

    return {
      items,
      amount,
      store: settings.storeName,
      timestamp: Date.now(),
      orderId,
    }
  }

  const formatNotificationBody = (template: string, order: OrderData): string => {
    return template
      .replace("{items}", order.items.toString())
      .replace("{amount}", order.amount)
      .replace("{store}", order.store)
      .replace("{orderId}", order.orderId)
  }

  const showIOSNotification = (order: OrderData) => {
    const body = formatNotificationBody(settings.customBody, order)

    if (Notification.permission === "granted") {
      // Use undefined title to let iOS handle it completely
      const notification = new Notification(undefined as any, {
        body: body,
        icon: settings.customLogo || "/shopify-logo.jpg",
        badge: "/shopify-logo.jpg",
        tag: `order-${order.orderId}-${Date.now()}`,
        requireInteraction: true,
        silent: false,
        timestamp: Date.now(),
        data: {
          orderId: order.orderId,
          amount: order.amount,
          items: order.items,
          url: "/",
        },
      })

      // Handle click - focus window and close notification
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // Handle error
      notification.onerror = (error) => {
        console.error("Notification error:", error)
      }

      // Log when notification is shown
      notification.onshow = () => {
        console.log("iOS notification shown successfully")
      }

      // Log when notification is closed
      notification.onclose = () => {
        console.log("iOS notification closed")
      }
    }

    // Add to history
    const newHistory = [order, ...notificationHistory.slice(0, 19)]
    setNotificationHistory(newHistory)
    localStorage.setItem("notification-history", JSON.stringify(newHistory))
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setNotificationsEnabled(true)
        localStorage.setItem("notifications-enabled", "true")
        return true
      }
    }
    return false
  }

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      // Send a welcome notification
      const welcomeOrder = {
        items: 1,
        amount: "49.99",
        store: settings.storeName,
        timestamp: Date.now(),
        orderId: "#1001",
      }
      showIOSNotification(welcomeOrder)
    }
  }

  const disableNotifications = () => {
    setNotificationsEnabled(false)
    localStorage.setItem("notifications-enabled", "false")
    stopSchedule()
  }

  const startSchedule = () => {
    if (!notificationsEnabled) return

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Reset daily counter if it's a new day
    const currentDate = new Date().toDateString()
    if (lastResetDateRef.current !== currentDate) {
      notificationCountRef.current = 0
      lastResetDateRef.current = currentDate
    }

    // Handle both seconds and minutes
    let intervalMs: number
    if (settings.frequency.endsWith("s")) {
      // Seconds format (e.g., "10s")
      const seconds = Number.parseInt(settings.frequency.replace("s", ""))
      intervalMs = seconds * 1000
    } else {
      // Minutes format (e.g., "5")
      const frequencyMinutes = Number.parseInt(settings.frequency)
      intervalMs = frequencyMinutes * 60 * 1000
    }

    intervalRef.current = setInterval(() => {
      // Check if we've reached the daily limit
      if (notificationCountRef.current >= settings.maxNotifications) {
        return
      }

      // Reset counter if it's a new day
      const currentDate = new Date().toDateString()
      if (lastResetDateRef.current !== currentDate) {
        notificationCountRef.current = 0
        lastResetDateRef.current = currentDate
      }

      const order = generateRandomOrder()

      // Check if order meets threshold
      if (Number.parseFloat(order.amount) >= settings.orderThreshold) {
        showIOSNotification(order)
        notificationCountRef.current++
      }
    }, intervalMs)

    setIsScheduleActive(true)
    localStorage.setItem("notification-schedule-active", "true")
  }

  const stopSchedule = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsScheduleActive(false)
    localStorage.setItem("notification-schedule-active", "false")
  }

  const sendTest = () => {
    if (notificationsEnabled) {
      const testOrder = generateRandomOrder()
      showIOSNotification(testOrder)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoData = e.target?.result as string
        const newSettings = { ...settings, customLogo: logoData }
        saveSettings(newSettings)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Not Supported
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Notifications are not supported in this browser.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS-style status bar safe area */}
      <div className="safe-area-inset-top bg-white"></div>

      <div className="px-4 py-6 space-y-6">
        {/* Header - iOS style */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shopify</h1>
              <p className="text-sm text-gray-500">Order Notifications</p>
            </div>
          </div>
        </div>

        {/* Status Card - iOS style */}
        <Card className="shadow-sm border-0 bg-white rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-blue-500" />
              Notification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Push Notifications</span>
              <Badge
                variant={notificationsEnabled ? "default" : "secondary"}
                className={notificationsEnabled ? "bg-green-500" : "bg-gray-400"}
              >
                {notificationsEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Auto Notifications</span>
              <Badge
                variant={isScheduleActive ? "default" : "secondary"}
                className={isScheduleActive ? "bg-blue-500" : "bg-gray-400"}
              >
                {isScheduleActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="space-y-3 pt-2">
              {!notificationsEnabled ? (
                <Button
                  onClick={enableNotifications}
                  className="w-full bg-blue-500 hover:bg-blue-600 rounded-xl h-12 text-base font-medium"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Notifications
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={isScheduleActive ? stopSchedule : startSchedule}
                    variant={isScheduleActive ? "destructive" : "default"}
                    className={`w-full rounded-xl h-12 text-base font-medium ${
                      isScheduleActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {isScheduleActive ? "Stop Auto Notifications" : "Start Auto Notifications"}
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={sendTest} variant="outline" className="flex-1 rounded-xl h-11 border-gray-300">
                      Test
                    </Button>
                    <Button
                      onClick={disableNotifications}
                      variant="outline"
                      className="flex-1 rounded-xl h-11 border-gray-300"
                    >
                      Disable
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings - iOS style */}
        <Card className="shadow-sm border-0 bg-white rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-gray-600" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="frequency" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-xl p-1">
                <TabsTrigger value="frequency" className="rounded-lg text-sm">
                  Frequency
                </TabsTrigger>
                <TabsTrigger value="appearance" className="rounded-lg text-sm">
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="filters" className="rounded-lg text-sm">
                  Filters
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg text-sm">
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="frequency" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-gray-700 font-medium">
                    Notification Frequency
                  </Label>
                  <Select
                    value={settings.frequency}
                    onValueChange={(value) => saveSettings({ ...settings, frequency: value })}
                  >
                    <SelectTrigger className="rounded-xl border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2s">Every 2 seconds</SelectItem>
                      <SelectItem value="5s">Every 5 seconds</SelectItem>
                      <SelectItem value="10s">Every 10 seconds</SelectItem>
                      <SelectItem value="20s">Every 20 seconds</SelectItem>
                      <SelectItem value="1">Every minute</SelectItem>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                      <SelectItem value="1440">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxNotifications" className="text-gray-700 font-medium">
                    Max Notifications per Day
                  </Label>
                  <Input
                    id="maxNotifications"
                    type="number"
                    value={settings.maxNotifications}
                    onChange={(e) =>
                      saveSettings({ ...settings, maxNotifications: Number.parseInt(e.target.value) || 0 })
                    }
                    min="1"
                    max="100"
                    className="rounded-xl border-gray-300"
                  />
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName" className="text-gray-700 font-medium">
                    Store Name
                  </Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) => saveSettings({ ...settings, storeName: e.target.value })}
                    placeholder="HoH Fashion"
                    className="rounded-xl border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customBody" className="text-gray-700 font-medium">
                    Notification Message
                  </Label>
                  <Input
                    id="customBody"
                    value={settings.customBody}
                    onChange={(e) => saveSettings({ ...settings, customBody: e.target.value })}
                    placeholder="{store} has a new order..."
                    className="rounded-xl border-gray-300"
                  />
                  <p className="text-xs text-gray-500">
                    Use {"{items}"}, {"{amount}"}, {"{store}"} as placeholders
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-gray-700 font-medium">
                    Custom Logo
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="flex-1 rounded-xl border-gray-300"
                    />
                    {settings.customLogo && (
                      <div className="w-12 h-12 rounded-xl border overflow-hidden">
                        <Image
                          src={settings.customLogo || "/placeholder.svg"}
                          alt="Custom logo"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="orderThreshold" className="text-gray-700 font-medium">
                    Minimum Order Amount ($)
                  </Label>
                  <Input
                    id="orderThreshold"
                    type="number"
                    value={settings.orderThreshold}
                    onChange={(e) =>
                      saveSettings({ ...settings, orderThreshold: Number.parseFloat(e.target.value) || 0 })
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="rounded-xl border-gray-300"
                  />
                  <p className="text-xs text-gray-500">Only notify for orders above this amount</p>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Recent Notifications</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notificationHistory.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No notifications yet</p>
                    ) : (
                      notificationHistory.map((order, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Order {order.orderId}</p>
                            <p className="text-xs text-gray-600">
                              {formatNotificationBody(settings.customBody, order)}
                            </p>
                            <p className="text-xs text-gray-500">{new Date(order.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* iOS Installation Guide */}
        <InstallPrompt />
      </div>
    </div>
  )
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)
  }, [])

  if (isStandalone) {
    return null
  }

  return (
    <Card className="shadow-sm border-0 bg-white rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="w-5 h-5 text-blue-500" />
          Install App
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isIOS ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">To install this app on your iOS device:</p>
            <ol className="text-sm space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                  1
                </span>
                Tap the share button <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⎋</span> in
                Safari
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                  2
                </span>
                Select "Add to Home Screen" <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">➕</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                  3
                </span>
                Tap "Add" to install the app
              </li>
            </ol>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Your browser will prompt you to install this app when available.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function Page() {
  return <PushNotificationManager />
}

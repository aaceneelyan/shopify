export const generateRandomOrder = (storeName: string, orderThreshold: number) => {
  const items = Math.floor(Math.random() * 5) + 1
  const baseAmount = Math.random() * 150 + 25
  const amount = Math.max(baseAmount, orderThreshold).toFixed(2)
  const orderId = `#${Math.floor(Math.random() * 9000) + 1000}`

  return {
    items,
    amount,
    store: storeName,
    timestamp: Date.now(),
    orderId,
  }
}

export const formatNotificationBody = (template: string, order: any): string => {
  return template
    .replace("{items}", order.items.toString())
    .replace("{amount}", order.amount)
    .replace("{store}", order.store)
    .replace("{orderId}", order.orderId)
}

"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"

import { useNotification } from "../context/NotificationContext"
import HistoryTab from "./HistoryTab"

const SettingsCard: React.FC = () => {
  const { settings, updateSettings } = useNotification()
  const [activeTab, setActiveTab] = useState("frequency")

  const tabs = [
    { id: "frequency", label: "Frequency", icon: "time" },
    { id: "appearance", label: "Appearance", icon: "color-palette" },
    { id: "filters", label: "Filters", icon: "filter" },
    { id: "history", label: "History", icon: "list" },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "frequency":
        return (
          <View style={styles.tabContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notification Frequency</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={settings.frequency}
                  onValueChange={(value) => updateSettings({ ...settings, frequency: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Every minute" value="1" />
                  <Picker.Item label="Every 5 minutes" value="5" />
                  <Picker.Item label="Every 15 minutes" value="15" />
                  <Picker.Item label="Every 30 minutes" value="30" />
                  <Picker.Item label="Every hour" value="60" />
                  <Picker.Item label="Daily" value="1440" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Notifications per Day</Text>
              <TextInput
                style={styles.textInput}
                value={settings.maxNotifications.toString()}
                onChangeText={(text) => updateSettings({ ...settings, maxNotifications: Number.parseInt(text) || 0 })}
                keyboardType="numeric"
                placeholder="10"
              />
            </View>
          </View>
        )

      case "appearance":
        return (
          <View style={styles.tabContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Store Name</Text>
              <TextInput
                style={styles.textInput}
                value={settings.storeName}
                onChangeText={(text) => updateSettings({ ...settings, storeName: text })}
                placeholder="Online Store"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notification Message</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={settings.customBody}
                onChangeText={(text) => updateSettings({ ...settings, customBody: text })}
                placeholder="You have a new order..."
                multiline
                numberOfLines={3}
              />
              <Text style={styles.helperText}>
                Use {"{items}"}, {"{amount}"}, {"{store}"} as placeholders
              </Text>
            </View>
          </View>
        )

      case "filters":
        return (
          <View style={styles.tabContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Minimum Order Amount ($)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.orderThreshold.toString()}
                onChangeText={(text) => updateSettings({ ...settings, orderThreshold: Number.parseFloat(text) || 0 })}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
              <Text style={styles.helperText}>Only notify for orders above this amount</Text>
            </View>
          </View>
        )

      case "history":
        return <HistoryTab />

      default:
        return null
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="settings" size={20} color="#666" />
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {renderTabContent()}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  tabBar: {
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "white",
  },
  tabContent: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
  },
  picker: {
    height: 50,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
  },
})

export default SettingsCard

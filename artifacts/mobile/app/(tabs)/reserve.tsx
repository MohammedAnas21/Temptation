import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LogoBrand } from "@/components/LogoBrand";
import { useUser } from "@/contexts/UserContext";
import { Reservation } from "@/contexts/UserContext";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";

const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM",
];

const UPCOMING_DAYS = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    label: d.toLocaleDateString("en-IN", { weekday: "short" }),
    date: d.getDate(),
    full: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    isToday: i === 0,
  };
});

type SeatingType = "indoor" | "outdoor";
type TableStatus = "available" | "occupied" | "reserved" | "selected";

interface TableDef {
  id: string;
  seats: number;
  x: number;
  y: number;
  status: TableStatus;
  shape: "round" | "rect";
}

const INITIAL_TABLES: TableDef[] = [
  { id: "T1", seats: 2, x: 30, y: 30, status: "available", shape: "round" },
  { id: "T2", seats: 2, x: 110, y: 30, status: "occupied", shape: "round" },
  { id: "T3", seats: 4, x: 200, y: 30, status: "available", shape: "rect" },
  { id: "T4", seats: 4, x: 290, y: 30, status: "reserved", shape: "rect" },
  { id: "T5", seats: 2, x: 30, y: 120, status: "available", shape: "round" },
  { id: "T6", seats: 6, x: 120, y: 120, status: "available", shape: "rect" },
  { id: "T7", seats: 2, x: 260, y: 120, status: "occupied", shape: "round" },
  { id: "T8", seats: 4, x: 330, y: 115, status: "available", shape: "rect" },
  { id: "T9", seats: 6, x: 30, y: 210, status: "reserved", shape: "rect" },
  { id: "T10", seats: 2, x: 200, y: 215, status: "available", shape: "round" },
  { id: "T11", seats: 2, x: 280, y: 215, status: "available", shape: "round" },
  { id: "T12", seats: 4, x: 350, y: 210, status: "occupied", shape: "rect" },
];

const STATUS_COLORS = {
  available: "#2D6A4F",
  occupied: "#C62828",
  reserved: "#C8973A",
  selected: "#D4AF37",
};

export default function ReserveScreen() {
  const colors = useColors();
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const { addReservation, reservations, cancelReservation } = useUser();

  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [seating, setSeating] = useState<SeatingType>("indoor");
  const [requests, setRequests] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"visual" | "picker">("visual");
  const [tables, setTables] = useState<TableDef[]>(INITIAL_TABLES);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const hp = layout.hp;
  const sc = layout.mapScale;

  const handleTablePress = (table: TableDef) => {
    if (table.status === "occupied" || table.status === "reserved") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === table.id) {
          const newStatus = t.status === "selected" ? "available" : "selected";
          setSelectedTable(newStatus === "selected" ? t.id : null);
          return { ...t, status: newStatus };
        }
        if (t.status === "selected") return { ...t, status: "available" };
        return t;
      })
    );
    if (table.status === "available") setGuests(table.seats);
  };

  const handleConfirm = () => {
    if (!selectedTime) {
      Alert.alert("Select Time", "Please choose a time slot for your reservation.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const tableName = selectedTable ? ` · Table ${selectedTable}` : "";
    const newRes: Reservation = {
      id: Date.now().toString(),
      date: UPCOMING_DAYS[selectedDay].full,
      time: selectedTime,
      guests,
      seating,
      requests: requests + tableName,
      status: "confirmed",
    };
    addReservation(newRes);
    setSelectedTime("");
    setRequests("");
    setGuests(2);
    setSelectedTable(null);
    setTables(INITIAL_TABLES);
    Alert.alert(
      "Table Reserved! 🎉",
      `Your${selectedTable ? ` ${selectedTable}` : ""} reservation for ${guests} on ${UPCOMING_DAYS[selectedDay].full} at ${selectedTime} (${seating === "indoor" ? "Indoor" : "Outdoor"}) has been confirmed!`
    );
  };

  const STATUS_COLORS_LOCAL: Record<string, string> = {
    confirmed: "#40916C",
    pending: "#C8973A",
    cancelled: "#888",
  };

  const floorWidth = 420;
  const floorHeight = 280;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: hp }]}>
        <LogoBrand variant="mini" />
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Reserve Table</Text>
          {reservations.length > 0 && (
            <Pressable onPress={() => setShowHistory(!showHistory)}>
              <Text style={[styles.historyBtn, { color: colors.gold }]}>
                {showHistory ? "New Booking" : "My Bookings"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {showHistory ? (
        <ScrollView contentContainerStyle={{ padding: hp, gap: 12, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          {reservations.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="calendar" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No reservations yet</Text>
            </View>
          ) : (
            reservations.map((r) => (
              <View key={r.id} style={[styles.resCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.resHeader}>
                  <View>
                    <Text style={[styles.resDate, { color: colors.foreground }]}>{r.date} · {r.time}</Text>
                    <Text style={[styles.resInfo, { color: colors.mutedForeground }]}>
                      {r.guests} guests · {r.seating === "indoor" ? "Indoor" : "Outdoor"}
                    </Text>
                  </View>
                  <View style={[styles.resBadge, { backgroundColor: STATUS_COLORS_LOCAL[r.status] + "22" }]}>
                    <Text style={[styles.resBadgeText, { color: STATUS_COLORS_LOCAL[r.status] }]}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </Text>
                  </View>
                </View>
                {r.requests ? <Text style={[styles.resRequests, { color: colors.mutedForeground }]}>Note: {r.requests}</Text> : null}
                {r.status !== "cancelled" && (
                  <Pressable
                    onPress={() => Alert.alert("Cancel?", "Cancel this reservation?", [
                      { text: "No", style: "cancel" },
                      { text: "Yes", style: "destructive", onPress: () => cancelReservation(r.id) },
                    ])}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                  </Pressable>
                )}
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 100 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: hp, marginBottom: 16 }}>
            <View style={[styles.tabToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {(["visual", "picker"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(t); }}
                  style={[styles.tabToggleBtn, activeTab === t && { backgroundColor: colors.emerald }]}
                >
                  <Feather
                    name={t === "visual" ? "grid" : "sliders"}
                    size={14}
                    color={activeTab === t ? colors.emeraldLight : colors.mutedForeground}
                  />
                  <Text style={[styles.tabToggleText, { color: activeTab === t ? colors.emeraldLight : colors.mutedForeground, fontWeight: activeTab === t ? "700" : "500" }]}>
                    {t === "visual" ? "Floor Map" : "Quick Select"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {activeTab === "visual" && (
            <View style={{ paddingHorizontal: hp, marginBottom: 20 }}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Select Your Table</Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Tap an available table to select it</Text>

              <View style={[styles.floorContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.floorLabel, { borderColor: colors.border }]}>
                  <Feather name="home" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.floorLabelText, { color: colors.mutedForeground }]}>Indoor Seating Area</Text>
                </View>
                <View style={[styles.floorMap, { height: layout.mapH }]}>
                  {tables.map((table) => {
                    const color = STATUS_COLORS[table.status];
                    const isRound = table.shape === "round";
                    const size = (table.seats <= 2 ? 44 : table.seats <= 4 ? 54 : 64) * sc;
                    return (
                      <Pressable
                        key={table.id}
                        onPress={() => handleTablePress(table)}
                        style={[
                          styles.tableBase,
                          isRound ? { borderRadius: size / 2 } : { borderRadius: 6 },
                          {
                            position: "absolute",
                            left: table.x * sc,
                            top: table.y * sc,
                            width: isRound ? size : size * 1.6,
                            height: size,
                            backgroundColor: color + "22",
                            borderColor: color + (table.status === "selected" ? "FF" : "88"),
                            borderWidth: table.status === "selected" ? 2 : 1.5,
                            opacity: table.status === "occupied" ? 0.5 : 1,
                          },
                        ]}
                      >
                        <Text style={[styles.tableId, { color }]}>{table.id}</Text>
                        <Text style={[styles.tableSeats, { color: color }]}>{table.seats}p</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.legendRow}>
                  {Object.entries(STATUS_COLORS).filter(([k]) => k !== "selected").map(([status, color]) => (
                    <View key={status} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: color }]} />
                      <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.selected }]} />
                    <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Selected</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.foreground, paddingLeft: hp }]}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: hp, paddingRight: 8, gap: 8, paddingTop: 10 }}>
              {UPCOMING_DAYS.map((day, idx) => {
                const active = idx === selectedDay;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDay(idx); }}
                    style={[styles.dayBtn, { backgroundColor: active ? colors.gold : colors.card, borderColor: active ? colors.gold : colors.border }]}
                  >
                    <Text style={[styles.dayLabel, { color: active ? "#000" : colors.mutedForeground }]}>{day.isToday ? "Today" : day.label}</Text>
                    <Text style={[styles.dayNum, { color: active ? "#000" : colors.foreground }]}>{day.date}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={{ paddingHorizontal: hp, marginBottom: 20 }}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Select Time</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((slot) => {
                const active = slot === selectedTime;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedTime(slot); }}
                    style={[styles.timeSlot, { backgroundColor: active ? colors.gold : colors.card, borderColor: active ? colors.gold : colors.border }]}
                  >
                    <Text style={[styles.timeSlotText, { color: active ? "#000" : colors.mutedForeground, fontWeight: active ? "700" : "500" }]}>
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ paddingHorizontal: hp, marginBottom: 20 }}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Number of Guests</Text>
            <View style={[styles.guestRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pressable
                onPress={() => { if (guests > 1) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGuests(guests - 1); } }}
                style={[styles.guestBtn, { borderColor: colors.border }]}
              >
                <Feather name="minus" size={18} color={guests > 1 ? colors.foreground : colors.border} />
              </Pressable>
              <View style={styles.guestCenter}>
                <Text style={[styles.guestNum, { color: colors.foreground }]}>{guests}</Text>
                <Text style={[styles.guestLabel, { color: colors.mutedForeground }]}>Guests</Text>
              </View>
              <Pressable
                onPress={() => { if (guests < 20) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGuests(guests + 1); } }}
                style={[styles.guestBtn, { borderColor: colors.border }]}
              >
                <Feather name="plus" size={18} color={guests < 20 ? colors.foreground : colors.border} />
              </Pressable>
            </View>
          </View>

          <View style={{ paddingHorizontal: hp, marginBottom: 20 }}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Seating Preference</Text>
            <View style={styles.seatingRow}>
              {(["indoor", "outdoor"] as SeatingType[]).map((s) => {
                const active = seating === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSeating(s); }}
                    style={[styles.seatingBtn, { borderColor: active ? colors.gold : colors.border, backgroundColor: active ? colors.goldDim : colors.card }]}
                  >
                    <Feather name={s === "indoor" ? "home" : "sun"} size={20} color={active ? colors.gold : colors.mutedForeground} />
                    <Text style={[styles.seatingText, { color: active ? colors.gold : colors.mutedForeground }]}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ paddingHorizontal: hp, marginBottom: 20 }}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Special Requests</Text>
            <TextInput
              style={[styles.requestsInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Birthday celebration, dietary needs, high chair..."
              placeholderTextColor={colors.mutedForeground}
              value={requests}
              onChangeText={setRequests}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.emerald, borderColor: colors.emeraldLight + "44", marginHorizontal: hp }]}>
            <Feather name="info" size={15} color={colors.emeraldLight} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              Reservations held for 15 minutes. Please arrive on time. For large groups (10+), call{" "}
              <Text style={{ color: colors.gold }}>090492 60894</Text>
            </Text>
          </View>
        </ScrollView>
      )}

      {!showHistory && (
        <View style={[styles.confirmBar, { paddingBottom: bottomPad + 12, backgroundColor: colors.background, paddingHorizontal: hp }]}>
          {selectedTable && (
            <View style={[styles.tableSelectedPill, { backgroundColor: colors.emerald, borderColor: colors.emeraldLight + "44" }]}>
              <Feather name="check-circle" size={13} color={colors.emeraldLight} />
              <Text style={[styles.tableSelectedText, { color: colors.emeraldLight }]}>
                {selectedTable} selected · {guests} seats
              </Text>
            </View>
          )}
          <Pressable onPress={handleConfirm} style={[styles.confirmBtn, { backgroundColor: colors.gold }]}>
            <Feather name="calendar" size={18} color="#000" />
            <Text style={styles.confirmText}>Confirm Reservation</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingBottom: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  historyBtn: { fontSize: 14, fontWeight: "600" },
  tabToggle: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 3, gap: 3 },
  tabToggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 10 },
  tabToggleText: { fontSize: 13 },
  sectionLabel: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  sectionSub: { fontSize: 12, marginBottom: 12 },
  floorContainer: { borderRadius: 16, borderWidth: 1, padding: 14, overflow: "hidden" },
  floorLabel: { flexDirection: "row", alignItems: "center", gap: 6, borderBottomWidth: 1, paddingBottom: 10, marginBottom: 12 },
  floorLabelText: { fontSize: 12, fontWeight: "600" },
  floorMap: { position: "relative", marginBottom: 12 },
  tableBase: { justifyContent: "center", alignItems: "center" },
  tableId: { fontSize: 10, fontWeight: "800" },
  tableSeats: { fontSize: 9 },
  legendRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11 },
  section: { marginBottom: 20 },
  dayBtn: { width: 60, alignItems: "center", borderRadius: 14, borderWidth: 1, paddingVertical: 12 },
  dayLabel: { fontSize: 11, marginBottom: 4 },
  dayNum: { fontSize: 20, fontWeight: "800" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  timeSlot: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  timeSlotText: { fontSize: 13 },
  guestRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, overflow: "hidden", marginTop: 10 },
  guestBtn: { paddingHorizontal: 24, paddingVertical: 16, borderWidth: 0 },
  guestCenter: { flex: 1, alignItems: "center" },
  guestNum: { fontSize: 32, fontWeight: "800" },
  guestLabel: { fontSize: 12 },
  seatingRow: { flexDirection: "row", gap: 12, marginTop: 10 },
  seatingBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, borderWidth: 1.5, paddingVertical: 16 },
  seatingText: { fontSize: 15, fontWeight: "700" },
  requestsInput: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, minHeight: 90, textAlignVertical: "top", marginTop: 10 },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 20 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  confirmBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingTop: 12, gap: 8 },
  tableSelectedPill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  tableSelectedText: { fontSize: 12, fontWeight: "700" },
  confirmBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, paddingVertical: 16 },
  confirmText: { fontSize: 16, fontWeight: "800", color: "#000" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16 },
  resCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  resHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  resDate: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  resInfo: { fontSize: 12 },
  resBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  resBadgeText: { fontSize: 12, fontWeight: "600" },
  resRequests: { fontSize: 12, fontStyle: "italic" },
  cancelBtn: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(229,57,53,0.1)" },
  cancelBtnText: { fontSize: 12, fontWeight: "600", color: "#E53935" },
});

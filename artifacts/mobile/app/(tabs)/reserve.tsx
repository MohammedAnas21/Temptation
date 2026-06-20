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
import fonts from "@/constants/fonts";
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
type TableStatus = "available" | "occupied" | "reserved" | "selected" | "cleaning";

interface TableDef {
  id: string;
  seats: number;
  x: number;
  y: number;
  status: TableStatus;
  shape: "round" | "rect";
}

const INITIAL_TABLES: TableDef[] = [
  { id: "T1", seats: 2, x: 260, y: 220, status: "available", shape: "round" },
  { id: "T2", seats: 2, x: 340, y: 220, status: "occupied", shape: "round" },
  { id: "T3", seats: 3, x: 260, y: 130, status: "available", shape: "round" },
  { id: "T4", seats: 3, x: 340, y: 130, status: "reserved", shape: "round" },
  { id: "T5", seats: 4, x: 30, y: 30, status: "available", shape: "rect" },
  { id: "T6", seats: 4, x: 130, y: 30, status: "occupied", shape: "rect" },
  { id: "T7", seats: 4, x: 230, y: 30, status: "cleaning", shape: "rect" },
  { id: "T8", seats: 4, x: 30, y: 190, status: "reserved", shape: "rect" },
  { id: "T9", seats: 4, x: 130, y: 190, status: "available", shape: "rect" },
];

const STATUS_COLORS = {
  available: "#2D6A4F",
  occupied: "#C62828",
  reserved: "#C8973A",
  selected: "#2F80ED",
  cleaning: "#6C757D",
};

const isRecommended = (tableId: string, guestCount: number, privatePref: boolean) => {
  if (privatePref) {
    return tableId === "T8" || tableId === "T9";
  }
  if (guestCount <= 2 && (tableId === "T1" || tableId === "T2")) return true;
  if (guestCount === 3 && (tableId === "T3" || tableId === "T4")) return true;
  if (guestCount === 4 && (tableId === "T5" || tableId === "T6" || tableId === "T7" || tableId === "T8" || tableId === "T9")) return true;
  return false;
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
  const [privatePreferred, setPrivatePreferred] = useState(false);

  const tabBarH = Platform.OS === "web" ? 84 : Platform.OS === "ios" ? 49 + insets.bottom : 56 + insets.bottom;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const hp = layout.hp;
  const sc = layout.mapScale;

  const handleTablePress = (table: TableDef) => {
    if (table.status === "occupied" || table.status === "reserved" || table.status === "cleaning") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const isSelecting = selectedTable !== table.id;
    setSelectedTable(isSelecting ? table.id : null);
    
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === table.id) {
          return { ...t, status: isSelecting ? "selected" : "available" };
        }
        if (t.status === "selected") return { ...t, status: "available" };
        return t;
      })
    );
    
    if (isSelecting) {
      setGuests(table.seats);
      if (table.id === "T8" || table.id === "T9") {
        setPrivatePreferred(true);
      } else {
        setPrivatePreferred(false);
      }
    }
  };

  const handleConfirm = () => {
    if (!selectedTime) {
      Alert.alert("Select Time", "Please choose a time slot for your reservation.");
      return;
    }
    const newRes: Reservation = {
      id: Date.now().toString(),
      date: UPCOMING_DAYS[selectedDay].full,
      time: selectedTime,
      guests,
      seating,
      tableId: selectedTable || undefined,
      requests,
      status: "confirmed",
    };
    addReservation(newRes);
    setSelectedTime("");
    setRequests("");
    setGuests(2);
    setSelectedTable(null);
    setPrivatePreferred(false);
    setTables(INITIAL_TABLES.map((t) => ({ ...t })));
    const tableLabel = selectedTable ? `Table ${selectedTable} · ` : "";
    Alert.alert(
      "Table Reserved! 🎉",
      `${tableLabel}${guests} guests on ${UPCOMING_DAYS[selectedDay].full} at ${selectedTime} (${seating === "indoor" ? "Indoor" : "Outdoor"}) has been confirmed!`
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
    <View style={[styles.root, { backgroundColor: colors.background, maxWidth: layout.contentW, width: "100%", alignSelf: "center" }]}>
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

      <View style={styles.scrollArea}>
        {showHistory ? (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: hp, gap: 12, paddingBottom: tabBarH + 24 }} showsVerticalScrollIndicator={false}>
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
                        {r.tableId ? `${r.tableId} · ` : ""}{r.guests} guests · {r.seating === "indoor" ? "Indoor" : "Outdoor"}
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
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: tabBarH + 140 }} showsVerticalScrollIndicator={false}>
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
                      const recommended = isRecommended(table.id, guests, privatePreferred) && !selectedTable;
                      const size = (table.seats <= 2 ? 44 : table.seats <= 4 ? 54 : 64) * sc;
                      return (
                        <Pressable
                          key={table.id}
                          onPress={() => handleTablePress(table)}
                          style={[
                            styles.tableBase,
                            isRound ? { borderRadius: size / 2 } : { borderRadius: 8 },
                            {
                              position: "absolute",
                              left: table.x * sc,
                              top: table.y * sc,
                              width: isRound ? size : size * 1.6,
                              height: size,
                              backgroundColor: color + "22",
                              borderColor: recommended ? colors.gold : color + (table.status === "selected" ? "FF" : "88"),
                              borderWidth: recommended ? 2.5 : table.status === "selected" ? 2.5 : 1.5,
                              opacity: table.status === "occupied" ? 0.5 : 1,
                              shadowColor: recommended ? colors.gold : "transparent",
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: recommended ? 0.6 : 0,
                              shadowRadius: recommended ? 4 : 0,
                            },
                          ]}
                        >
                          <Text style={[styles.tableId, { color: recommended ? colors.gold : color, fontWeight: "800" }]}>{table.id}</Text>
                          <Text style={[styles.tableSeats, { color: recommended ? colors.gold : color }]}>{table.seats}p</Text>
                          {recommended && (
                            <View style={[styles.recommendedBadge, { backgroundColor: colors.gold }]}>
                              <Text style={styles.recommendedBadgeText}>Rec</Text>
                            </View>
                          )}
                          {(table.id === "T8" || table.id === "T9") && (
                            <View style={styles.privateZoneIndicator}>
                              <Feather name="lock" size={8} color={color} />
                            </View>
                          )}
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
              <View style={[styles.privateRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.privateInfo}>
                  <Feather name="lock" size={16} color={colors.gold} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={[styles.privateLabel, { color: colors.foreground }]}>Private Seating Zone</Text>
                    <Text style={[styles.privateSub, { color: colors.mutedForeground }]}>Tucked away behind partitions</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const nextVal = !privatePreferred;
                    setPrivatePreferred(nextVal);
                    if (nextVal) {
                      setGuests(4);
                    }
                  }}
                  style={[
                    styles.checkbox,
                    { borderColor: colors.border },
                    privatePreferred && { backgroundColor: colors.gold, borderColor: colors.gold }
                  ]}
                >
                  {privatePreferred && <Feather name="check" size={12} color="#000" />}
                </Pressable>
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
      </View>

      {!showHistory && (
        <View style={[styles.confirmBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingHorizontal: hp, paddingBottom: 12, bottom: tabBarH }]}>
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
  title: { fontSize: 28, fontFamily: fonts.display[900], letterSpacing: -0.5 },
  historyBtn: { fontSize: 14, fontFamily: fonts.body[600] },
  tabToggle: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 3, gap: 3 },
  tabToggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 10 },
  tabToggleText: { fontSize: 13, fontFamily: fonts.body[500] },
  sectionLabel: { fontSize: 16, fontFamily: fonts.display[700], marginBottom: 6 },
  sectionSub: { fontSize: 12, fontFamily: fonts.body[400], marginBottom: 12 },
  floorContainer: { borderRadius: 16, borderWidth: 1, padding: 14, overflow: "hidden" },
  floorLabel: { flexDirection: "row", alignItems: "center", gap: 6, borderBottomWidth: 1, paddingBottom: 10, marginBottom: 12 },
  floorLabelText: { fontSize: 12, fontFamily: fonts.body[600] },
  floorMap: { position: "relative", marginBottom: 12 },
  tableBase: { justifyContent: "center", alignItems: "center" },
  tableId: { fontSize: 10, fontFamily: fonts.mono[700] },
  tableSeats: { fontSize: 9, fontFamily: fonts.mono[400] },
  legendRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontFamily: fonts.body[400] },
  section: { marginBottom: 20 },
  dayBtn: { width: 60, alignItems: "center", borderRadius: 14, borderWidth: 1, paddingVertical: 12 },
  dayLabel: { fontSize: 11, fontFamily: fonts.body[500], marginBottom: 4 },
  dayNum: { fontSize: 20, fontFamily: fonts.display[800] },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  timeSlot: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  timeSlotText: { fontSize: 13, fontFamily: fonts.body[500] },
  guestRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, overflow: "hidden", marginTop: 10 },
  guestBtn: { paddingHorizontal: 24, paddingVertical: 16, borderWidth: 0 },
  guestCenter: { flex: 1, alignItems: "center" },
  guestNum: { fontSize: 32, fontFamily: fonts.display[800] },
  guestLabel: { fontSize: 12, fontFamily: fonts.body[400] },
  seatingRow: { flexDirection: "row", gap: 12, marginTop: 10, flexWrap: "wrap" },
  seatingBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, borderWidth: 1.5, paddingVertical: 16 },
  seatingText: { fontSize: 15, fontFamily: fonts.body[700] },
  requestsInput: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: fonts.body[400], minHeight: 90, textAlignVertical: "top", marginTop: 10 },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 20 },
  infoText: { flex: 1, fontSize: 12, fontFamily: fonts.body[400], lineHeight: 18, flexShrink: 1 },
  scrollArea: { flex: 1 },
  confirmBar: { position: "absolute", left: 0, right: 0, paddingTop: 12, gap: 8, borderTopWidth: 1, zIndex: 50 },
  tableSelectedPill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  tableSelectedText: { fontSize: 12, fontFamily: fonts.body[700] },
  confirmBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, paddingVertical: 16, minHeight: 52 },
  confirmText: { fontSize: 16, fontFamily: fonts.body[800], color: "#052A16" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: fonts.body[400] },
  resCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  resHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  resDate: { fontSize: 14, fontFamily: fonts.body[700], marginBottom: 3 },
  resInfo: { fontSize: 12, fontFamily: fonts.body[400] },
  resBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  resBadgeText: { fontSize: 12, fontFamily: fonts.body[600] },
  resRequests: { fontSize: 12, fontFamily: fonts.body[400], fontStyle: "italic" },
  cancelBtn: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(229,57,53,0.1)" },
  cancelBtnText: { fontSize: 12, fontFamily: fonts.body[600], color: "#E53935" },
  recommendedBadge: {
    position: "absolute",
    top: -8,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    zIndex: 10,
  },
  recommendedBadgeText: {
    fontSize: 7,
    fontFamily: fonts.mono[700],
    color: "#052A16",
  },
  privateZoneIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
  },
  privateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  privateInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  privateLabel: {
    fontSize: 14,
    fontFamily: fonts.body[700],
  },
  privateSub: {
    fontSize: 10,
    fontFamily: fonts.body[400],
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});

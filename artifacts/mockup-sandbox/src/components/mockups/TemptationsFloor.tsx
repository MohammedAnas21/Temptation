import React, { useState, useMemo } from "react";
import {
  Coffee,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  DollarSign,
  User,
  Shield,
  Percent,
  Compass,
  MapPin,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  Award,
  Lock,
  Eye,
  Settings,
  Bell,
  RefreshCw,
  Search,
  Plus,
  Minus
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from "recharts";

// Luxury Cafe Theme Colors
const COLORS = {
  emerald: "#0D3321",      // Dark Emerald Green (Primary BG)
  emeraldLight: "#133F2A", // Lighter Emerald
  gold: "#C8A028",         // Premium Gold Accent
  goldLight: "#D4AF37",    // Bright Gold
  goldDim: "rgba(200, 160, 40, 0.15)",
  ivory: "#F5F0E8",        // Creamy Ivory White
  white: "#FFFFFF",
  muted: "#7AAD8A",        // Muted Green Sage
};

// Floor Layout Table Definition
interface Table {
  id: string;
  name: string;
  type: string;
  capacity: number;
  chairs: number;
  status: "available" | "reserved" | "occupied" | "selected" | "cleaning";
  section: "entrance" | "middle" | "sofa" | "private-sofa";
  revenue: number;
  lastGuest?: string;
  timeSlot?: string;
  orders?: { name: string; price: number; quantity: number }[];
}

// Initial Mock Tables Setup
const INITIAL_TABLES: Table[] = [
  // Entrance Section
  { id: "1", name: "Table 1", type: "Standard Table", capacity: 2, chairs: 2, status: "available", section: "entrance", revenue: 450, lastGuest: "Anas M.", timeSlot: "04:00 PM", orders: [] },
  { id: "2", name: "Table 2", type: "Standard Table", capacity: 2, chairs: 2, status: "occupied", section: "entrance", revenue: 800, lastGuest: "Sarah K.", timeSlot: "03:00 PM", orders: [{ name: "Classic Zinger Burger", price: 250, quantity: 2 }, { name: "Mint Lime Mojito", price: 150, quantity: 2 }] },
  
  // Middle Section
  { id: "3", name: "Table 3", type: "Standard Dining", capacity: 3, chairs: 3, status: "available", section: "middle", revenue: 1200, lastGuest: "Vikram S.", timeSlot: "05:00 PM", orders: [] },
  { id: "4", name: "Table 4", type: "Standard Dining", capacity: 3, chairs: 3, status: "reserved", section: "middle", revenue: 950, lastGuest: "Neha R.", timeSlot: "06:00 PM", orders: [] },
  
  // Sofa Section
  { id: "5", name: "Table 5", type: "Premium Sofa", capacity: 4, chairs: 2, status: "available", section: "sofa", revenue: 1800, lastGuest: "Arjun P.", timeSlot: "07:00 PM", orders: [] },
  { id: "6", name: "Table 6", type: "Premium Sofa", capacity: 4, chairs: 2, status: "occupied", section: "sofa", revenue: 2400, lastGuest: "Rohan D.", timeSlot: "02:30 PM", orders: [{ name: "Premium Party Platter", price: 600, quantity: 2 }, { name: "Watermelon Mojito", price: 150, quantity: 4 }, { name: "Garlic Breadsticks", price: 150, quantity: 4 }] },
  { id: "7", name: "Table 7", type: "Premium Sofa", capacity: 4, chairs: 2, status: "cleaning", section: "sofa", revenue: 1650, lastGuest: "Ayesha F.", timeSlot: "04:30 PM", orders: [] },
  
  // Private Sofa Section (Privacy Zone)
  { id: "8", name: "Table 8", type: "Private Sofa", capacity: 4, chairs: 2, status: "reserved", section: "private-sofa", revenue: 3100, lastGuest: "Dr. Aditya", timeSlot: "08:00 PM", orders: [] },
  { id: "9", name: "Table 9", type: "Private Sofa", capacity: 4, chairs: 2, status: "available", section: "private-sofa", revenue: 2850, lastGuest: "Zainab A.", timeSlot: "06:30 PM", orders: [] },
];

const STATUS_DETAILS = {
  available: { label: "Available", color: "#2D6A4F", text: "text-[#40916C]", bg: "bg-[#2D6A4F]/20" },
  reserved: { label: "Reserved", color: "#C8973A", text: "text-[#C8973A]", bg: "bg-[#C8973A]/20" },
  occupied: { label: "Occupied", color: "#C62828", text: "text-[#C62828]", bg: "bg-[#C62828]/20" },
  selected: { label: "Selected", color: "#2F80ED", text: "text-[#2F80ED]", bg: "bg-[#2F80ED]/20" },
  cleaning: { label: "Cleaning", color: "#6C757D", text: "text-[#8A8A8A]", bg: "bg-[#6C757D]/20" },
};

// Mock Peak Hours Data
const PEAK_HOURS_DATA = [
  { hour: "10 AM", occupancy: 20 },
  { hour: "12 PM", occupancy: 45 },
  { hour: "2 PM", occupancy: 70 },
  { hour: "4 PM", occupancy: 50 },
  { hour: "6 PM", occupancy: 85 },
  { hour: "8 PM", occupancy: 95 },
  { hour: "10 PM", occupancy: 60 },
];

// Mock Table Revenue Data
const REVENUE_BY_TABLE_DATA = [
  { name: "T1", revenue: 450 },
  { name: "T2", revenue: 800 },
  { name: "T3", revenue: 1200 },
  { name: "T4", revenue: 950 },
  { name: "T5", revenue: 1800 },
  { name: "T6", revenue: 2400 },
  { name: "T7", revenue: 1650 },
  { name: "T8", revenue: 3100 },
  { name: "T9", revenue: 2850 },
];

export default function TemptationsFloor() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  // Customer Booking Form States
  const [guestCount, setGuestCount] = useState<number>(2);
  const [preferredSection, setPreferredSection] = useState<string>("any");
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [bookingTime, setBookingTime] = useState<string>("07:00 PM");
  const [privateSeating, setPrivateSeating] = useState<boolean>(false);
  const [specialNote, setSpecialNote] = useState<string>("");
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(450);
  
  // System bookings list (synced in state)
  const [bookings, setBookings] = useState<any[]>([
    { id: "B1", tableId: "4", guestName: "Neha R.", guests: 3, time: "06:00 PM", status: "confirmed" },
    { id: "B2", tableId: "8", guestName: "Dr. Aditya", guests: 4, time: "08:00 PM", status: "confirmed", note: "VIP Guest - Birthday" },
  ]);

  // Admin states
  const [adminSelectedTableId, setAdminSelectedTableId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"floor" | "analytics" | "crm">("floor");

  // Filter tables by search query (Admin view)
  const filteredTables = useMemo(() => {
    return tables.filter((t) => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.section.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tables, searchQuery]);

  // Reservation recommendation rules
  // 2 guests: T1, T2
  // 3 guests: T3, T4
  // 4 guests: T5, T6, T7, T8, T9
  // > 4 guests: suggest combine tables
  const recommendedTableIds = useMemo(() => {
    let list: string[] = [];
    if (guestCount <= 2) {
      list = ["1", "2"];
    } else if (guestCount === 3) {
      list = ["3", "4"];
    } else if (guestCount === 4) {
      list = ["5", "6", "7", "8", "9"];
      if (privateSeating) {
        list = ["8", "9"]; // Private tables
      }
    } else {
      // Larger parties: suggest combinations
      list = [];
    }
    return list;
  }, [guestCount, privateSeating]);

  // Handle Customer Selection
  const handleTableSelect = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.status === "occupied" || table.status === "reserved" || table.status === "cleaning") return;

    const isSelecting = selectedTableId !== tableId;
    setSelectedTableId(isSelecting ? tableId : null);

    // Update tables array to reflect selection state
    setTables(prevTables =>
      prevTables.map(t => {
        if (t.id === tableId) {
          return { ...t, status: isSelecting ? "selected" : "available" };
        }
        if (t.status === "selected") {
          return { ...t, status: "available" };
        }
        return t;
      })
    );

    // Pre-set guest count to capacity of table
    if (isSelecting) {
      setGuestCount(table.capacity);
      if (table.section === "private-sofa") {
        setPrivateSeating(true);
      } else {
        setPrivateSeating(false);
      }
    }
  };

  // Perform Booking
  const handleBookTable = () => {
    if (!selectedTableId) return;
    const table = tables.find(t => t.id === selectedTableId);
    if (!table) return;

    // Create new booking record
    const newBooking = {
      id: "B" + (bookings.length + 1),
      tableId: table.id,
      guestName: "Mohammed Anas",
      guests: guestCount,
      time: bookingTime,
      status: "confirmed",
      note: specialNote
    };

    setBookings(prev => [newBooking, ...prev]);

    // Change table status to reserved
    setTables(prevTables =>
      prevTables.map(t => {
        if (t.id === table.id) {
          return { ...t, status: "reserved", lastGuest: "Mohammed Anas", timeSlot: bookingTime };
        }
        return t;
      })
    );

    // Reward points for booking
    setLoyaltyPoints(p => p + 50);

    // Reset selection
    setSelectedTableId(null);
    setSpecialNote("");
    
    alert(`Success! Table ${table.name} has been reserved for ${guestCount} guests at ${bookingTime}. You earned 50 loyalty points!`);
  };

  // Admin Change Table Status on Floor Map
  const handleAdminStatusChange = (tableId: string, newStatus: Table["status"]) => {
    setTables(prev =>
      prev.map(t => (t.id === tableId ? { ...t, status: newStatus } : t))
    );
    setAdminSelectedTableId(null);
  };

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter(t => t.status === "available").length;
    const occupied = tables.filter(t => t.status === "occupied").length;
    const reserved = tables.filter(t => t.status === "reserved").length;
    const cleaning = tables.filter(t => t.status === "cleaning").length;
    
    const activeGuests = tables.reduce((acc, t) => {
      if (t.status === "occupied") return acc + t.capacity;
      return acc;
    }, 0);
    
    const todayRevenue = tables.reduce((acc, t) => acc + t.revenue, 0);
    const occupancyRate = Math.round((occupied / total) * 100);

    return {
      total,
      available,
      occupied,
      reserved,
      cleaning,
      activeGuests,
      todayRevenue,
      occupancyRate
    };
  }, [tables]);

  return (
    <div 
      className="min-h-screen font-sans flex flex-col transition-all duration-300"
      style={{ backgroundColor: COLORS.emerald, color: COLORS.ivory }}
    >
      {/* Premium Header */}
      <header className="border-b border-[#C8A028]/30 px-6 py-4 flex flex-wrap justify-between items-center bg-[#072115] gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-full border border-[#C8A028] bg-[#C8A028]/10 shadow-[0_0_10px_rgba(200,160,40,0.2)]">
            <Coffee className="h-6 w-6 text-[#C8A028]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#C8A028] flex items-center">
              TEMPTATIONS CAFE
              <span className="ml-2 px-1.5 py-0.5 text-[10px] tracking-normal font-semibold bg-[#C8A028]/20 border border-[#C8A028]/40 rounded text-[#F5F0E8]">
                FLOOR MANAGER
              </span>
            </h1>
            <p className="text-[11px] text-[#7AAD8A]">Premium Seating & Table Reservations · Kalaburagi</p>
          </div>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center space-x-3 bg-black/30 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setIsAdmin(false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center space-x-1.5 transition-all ${
              !isAdmin 
                ? "bg-[#C8A028] text-[#0D3321] shadow-lg shadow-[#C8A028]/20" 
                : "text-[#7AAD8A] hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Customer View</span>
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center space-x-1.5 transition-all ${
              isAdmin 
                ? "bg-[#C8A028] text-[#0D3321] shadow-lg shadow-[#C8A028]/20" 
                : "text-[#7AAD8A] hover:text-white"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Console</span>
          </button>
        </div>
      </header>

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        
        {/* FLOOR MAP SECTION - Span 7 columns on desktop */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-[#0F3D27] border border-[#C8A028]/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex-1">
            {/* Elegant Background Gold Overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-[#C8A028]/5 to-transparent pointer-events-none rounded-full blur-3xl"></div>

            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold tracking-wide text-[#C8A028] flex items-center">
                  <Compass className="h-5 w-5 mr-2 text-[#C8A028]" />
                  Cafe Floor Layout
                </h2>
                <p className="text-xs text-[#7AAD8A]">
                  {isAdmin 
                    ? "Live monitoring mode. Click a table to change status or manage logs." 
                    : "Select a highlighted green table to request specific seating."}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] text-[#7AAD8A] font-semibold uppercase tracking-wider">Live View</span>
              </div>
            </div>

            {/* Interactive SVG Floor Plan */}
            <div className="relative border border-[#C8A028]/15 rounded-xl bg-black/45 overflow-hidden flex items-center justify-center p-2 aspect-[16/11]">
              <svg 
                viewBox="0 0 800 550" 
                className="w-full h-full select-none"
                style={{ filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.6))" }}
              >
                {/* Floor Grid Lines (Luxury Vibe) */}
                <defs>
                  <pattern id="floor-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(245, 240, 232, 0.02)" strokeWidth="1" />
                  </pattern>
                  <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="black" floodOpacity="0.5"/>
                  </filter>
                </defs>
                <rect width="100%" height="100%" fill="url(#floor-grid)" />

                {/* Section Dividers / Boundaries */}
                {/* Sofa Section Divider */}
                <line x1="20" y1="180" x2="630" y2="180" stroke="rgba(200, 160, 40, 0.15)" strokeWidth="2" strokeDasharray="6,4" />
                <text x="30" y="170" fill="#7AAD8A" fontSize="11" fontWeight="bold" letterSpacing="1">SOFA SECTION (TABLES 5-7)</text>

                {/* Private Seating Partition */}
                <line x1="390" y1="180" x2="390" y2="530" stroke="rgba(200, 160, 40, 0.15)" strokeWidth="2" strokeDasharray="6,4" />
                <text x="30" y="320" fill="#7AAD8A" fontSize="11" fontWeight="bold" letterSpacing="1">PRIVATE ZONE (TABLES 8-9)</text>

                {/* Entrance Section Labels */}
                <text x="410" y="320" fill="#7AAD8A" fontSize="11" fontWeight="bold" letterSpacing="1">MIDDLE SEATING (TABLES 3-4)</text>
                <text x="410" y="525" fill="#7AAD8A" fontSize="11" fontWeight="bold" letterSpacing="1">ENTRANCE SEATING (TABLES 1-2)</text>

                {/* Cash Counter Area */}
                <g transform="translate(480, 360)" filter="url(#shadow)">
                  <rect x="0" y="0" width="130" height="90" rx="8" fill="#133F2A" stroke="#C8A028" strokeWidth="1.5" />
                  {/* Gold Front Panel Accent */}
                  <rect x="10" y="70" width="110" height="12" rx="2" fill="#C8A028" opacity="0.8" />
                  <text x="65" y="45" fill="#F5F0E8" fontSize="12" fontWeight="bold" textAnchor="middle" letterSpacing="1">CASH COUNTER</text>
                  <Coffee x="53" y="10" width="24" height="24" className="text-[#C8A028]" />
                </g>

                {/* Kitchen Area */}
                <g transform="translate(620, 20)" filter="url(#shadow)">
                  <rect x="0" y="0" width="160" height="200" rx="8" fill="#133F2A" stroke="#C8A028" strokeWidth="1.5" />
                  {/* Walls & Door */}
                  <line x1="0" y1="120" x2="40" y2="120" stroke="#C8A028" strokeWidth="3" />
                  <line x1="80" y1="120" x2="160" y2="120" stroke="#C8A028" strokeWidth="3" />
                  {/* Swinging Door Arc */}
                  <path d="M 40 120 A 40 40 0 0 1 80 80" fill="none" stroke="rgba(200, 160, 40, 0.4)" strokeWidth="1.5" strokeDasharray="4,2" />
                  <text x="80" y="65" fill="#F5F0E8" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">KITCHEN</text>
                  <text x="80" y="170" fill="#7AAD8A" fontSize="9" textAnchor="middle">STAFF ONLY</text>
                </g>

                {/* Service Pathway Labels */}
                <g opacity="0.3">
                  <path d="M 330 200 L 330 300 L 460 300" fill="none" stroke="#F5F0E8" strokeWidth="2" strokeDasharray="4,4" />
                  <text x="340" y="230" fill="#F5F0E8" fontSize="9" letterSpacing="1">SERVICE PATHWAY</text>
                </g>

                {/* Main Entrance Area */}
                <g transform="translate(710, 450)">
                  {/* Double Doors */}
                  <line x1="20" y1="0" x2="20" y2="80" stroke="#C8A028" strokeWidth="4" />
                  <line x1="20" y1="0" x2="-20" y2="-30" stroke="#C8A028" strokeWidth="3" />
                  <line x1="20" y1="80" x2="-20" y2="110" stroke="#C8A028" strokeWidth="3" />
                  <path d="M 20 0 A 40 40 0 0 0 -20 -30" fill="none" stroke="rgba(200, 160, 40, 0.3)" strokeWidth="1.5" strokeDasharray="3,3" />
                  <path d="M 20 80 A 40 40 0 0 1 -20 110" fill="none" stroke="rgba(200, 160, 40, 0.3)" strokeWidth="1.5" strokeDasharray="3,3" />
                  
                  <text x="-40" y="45" fill="#C8A028" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">ENTRANCE</text>
                  <path d="M -90 45 L -70 45" stroke="#C8A028" strokeWidth="2" markerEnd="url(#arrow)" />
                </g>

                {/* RENDER TABLES */}
                {tables.map((table) => {
                  const status = table.status;
                  const isSelected = selectedTableId === table.id;
                  const isRecommended = !isAdmin && recommendedTableIds.includes(table.id) && !selectedTableId;
                  const color = isSelected ? STATUS_DETAILS.selected.color : STATUS_DETAILS[status].color;

                  // Define table center coordinates on SVG
                  let tx = 0;
                  let ty = 0;
                  
                  if (table.id === "1") { tx = 470; ty = 480; }
                  else if (table.id === "2") { tx = 600; ty = 480; }
                  else if (table.id === "3") { tx = 470; ty = 250; }
                  else if (table.id === "4") { tx = 590; ty = 250; }
                  else if (table.id === "5") { tx = 100; ty = 100; }
                  else if (table.id === "6") { tx = 270; ty = 100; }
                  else if (table.id === "7") { tx = 440; ty = 100; }
                  else if (table.id === "8") { tx = 110; ty = 430; }
                  else if (table.id === "9") { tx = 280; ty = 430; }

                  return (
                    <g 
                      key={table.id}
                      onClick={() => {
                        if (isAdmin) {
                          setAdminSelectedTableId(table.id);
                        } else {
                          handleTableSelect(table.id);
                        }
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Privacy Zone Ring for Tables 8 and 9 */}
                      {table.section === "private-sofa" && (
                        <circle 
                          cx={tx} 
                          cy={ty} 
                          r="68" 
                          fill="rgba(200, 160, 40, 0.02)" 
                          stroke="rgba(200, 160, 40, 0.2)" 
                          strokeWidth="1.5" 
                          strokeDasharray="4,4" 
                        />
                      )}

                      {/* Highlight Ring for Recommended Tables */}
                      {isRecommended && (
                        <circle 
                          cx={tx} 
                          cy={ty} 
                          r="64" 
                          fill="none" 
                          stroke="#C8A028" 
                          strokeWidth="2.5" 
                          className="animate-pulse" 
                          filter="url(#glow-gold)"
                        />
                      )}

                      {/* Highlight Ring for Selected Table */}
                      {isSelected && (
                        <circle 
                          cx={tx} 
                          cy={ty} 
                          r="64" 
                          fill="none" 
                          stroke="#2F80ED" 
                          strokeWidth="3" 
                          className="animate-pulse"
                          filter="url(#glow-gold)"
                        />
                      )}

                      {/* Draw Chairs around Table */}
                      {/* Table 1 & 2: 2 Guests, Round (Left and Right Chairs) */}
                      {(table.id === "1" || table.id === "2") && (
                        <>
                          <circle cx={tx - 38} cy={ty} r="10" fill="#133F2A" stroke={color} strokeWidth="1.5" />
                          <circle cx={tx + 38} cy={ty} r="10" fill="#133F2A" stroke={color} strokeWidth="1.5" />
                        </>
                      )}

                      {/* Table 3 & 4: 3 Guests, Dining Round (Three Chairs Triangle-style) */}
                      {(table.id === "3" || table.id === "4") && (
                        <>
                          <circle cx={tx} cy={ty - 38} r="10" fill="#133F2A" stroke={color} strokeWidth="1.5" />
                          <circle cx={tx - 32} cy={ty + 22} r="10" fill="#133F2A" stroke={color} strokeWidth="1.5" />
                          <circle cx={tx + 32} cy={ty + 22} r="10" fill="#133F2A" stroke={color} strokeWidth="1.5" />
                        </>
                      )}

                      {/* Tables 5-9: Sofa Tables (Sofa bench on top, 2 chairs on bottom) */}
                      {table.capacity === 4 && (
                        <>
                          {/* Sofa Bench (Horizontal Pill Shape on Top) */}
                          <rect x={tx - 45} y={ty - 42} width="90" height="14" rx="5" fill="#133F2A" stroke={color} strokeWidth="1.5" />
                          {/* Bottom chairs */}
                          <circle cx={tx - 25} cy={ty + 38} r="10" fill="#133F2A" stroke={color} strokeWidth="1.5" />
                          <circle cx={tx + 25} cy={ty + 38} r="10" fill="#133F2A" stroke={color} strokeWidth="1.5" />
                        </>
                      )}

                      {/* Main Table Body */}
                      {/* Round Tables */}
                      {(table.id === "1" || table.id === "2" || table.id === "3" || table.id === "4") ? (
                        <circle 
                          cx={tx} 
                          cy={ty} 
                          r="25" 
                          fill={status === "selected" ? "#C8A028" : "#0D3321"} 
                          stroke={color} 
                          strokeWidth="2.5" 
                          filter="url(#shadow)"
                          className="transition-all duration-300 group-hover:stroke-white"
                        />
                      ) : (
                        // Square/Rectangular Tables for Sofas
                        <rect 
                          x={tx - 32} 
                          y={ty - 22} 
                          width="64" 
                          height="44" 
                          rx="4"
                          fill={status === "selected" ? "#C8A028" : "#0D3321"} 
                          stroke={color} 
                          strokeWidth="2.5" 
                          filter="url(#shadow)"
                          className="transition-all duration-300 group-hover:stroke-white"
                        />
                      )}

                      {/* Table Number & Capacity Labels */}
                      <text 
                        x={tx} 
                        y={ty - 2} 
                        fill={status === "selected" ? "#0D3321" : "#F5F0E8"} 
                        fontSize="12" 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {table.id}
                      </text>
                      <text 
                        x={tx} 
                        y={ty + 10} 
                        fill={status === "selected" ? "rgba(13,51,33,0.7)" : "#7AAD8A"} 
                        fontSize="9" 
                        textAnchor="middle"
                      >
                        {table.capacity}p
                      </text>

                      {/* Privacy Indicator Badge for Private Seating */}
                      {table.section === "private-sofa" && (
                        <g transform={`translate(${tx - 5}, ${ty - 28})`} opacity="0.8">
                          <rect x="-4" y="-3" width="8" height="8" rx="1" fill="#C8A028" />
                        </g>
                      )}

                      {/* Recommendation Tooltip overlay */}
                      {isRecommended && (
                        <g transform={`translate(${tx}, ${ty - 55})`}>
                          <rect x="-35" y="-12" width="70" height="18" rx="4" fill="#C8A028" />
                          <text x="0" y="0" fill="#0D3321" fontSize="9" fontWeight="black" textAnchor="middle">SUGGESTED</text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Live Floor Map Legend overlay (Responsive absolute) */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 border border-white/10 backdrop-blur-sm rounded-lg p-2 flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] sm:text-xs">
                <div className="flex items-center space-x-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_DETAILS.available.color }}></span>
                  <span className="text-white">Available</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_DETAILS.reserved.color }}></span>
                  <span className="text-white">Reserved</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_DETAILS.occupied.color }}></span>
                  <span className="text-white">Occupied</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_DETAILS.selected.color }}></span>
                  <span className="text-white">Selected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_DETAILS.cleaning.color }}></span>
                  <span className="text-white">Cleaning</span>
                </div>
              </div>

              {/* ADMIN Live Status Click-Handler Modal Popup */}
              {isAdmin && adminSelectedTableId && (() => {
                const adminTable = tables.find(t => t.id === adminSelectedTableId);
                if (!adminTable) return null;
                const activeOrders = adminTable.orders || [];
                const addMockItem = (itemName: string, itemPrice: number) => {
                  setTables(prev => prev.map(t => {
                    if (t.id === adminSelectedTableId) {
                      const newOrders = [...(t.orders || [])];
                      const existing = newOrders.find(o => o.name === itemName);
                      if (existing) {
                        existing.quantity += 1;
                      } else {
                        newOrders.push({ name: itemName, price: itemPrice, quantity: 1 });
                      }
                      return { ...t, orders: newOrders, revenue: t.revenue + itemPrice };
                    }
                    return t;
                  }));
                };
                const removeMockItem = (itemName: string, itemPrice: number) => {
                  setTables(prev => prev.map(t => {
                    if (t.id === adminSelectedTableId) {
                      const newOrders = [...(t.orders || [])];
                      const existingIndex = newOrders.findIndex(o => o.name === itemName);
                      if (existingIndex > -1) {
                        const item = newOrders[existingIndex];
                        if (item.quantity > 1) {
                          item.quantity -= 1;
                        } else {
                          newOrders.splice(existingIndex, 1);
                        }
                        return { ...t, orders: newOrders, revenue: Math.max(0, t.revenue - itemPrice) };
                      }
                    }
                    return t;
                  }));
                };
                return (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-20">
                    <div className="bg-[#133F2A] border border-[#C8A028]/40 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 flex flex-col md:flex-row md:space-x-6 md:space-y-0">
                      {/* Left: Status Controller */}
                      <div className="flex-1 space-y-4 text-left">
                        <div>
                          <h3 className="font-bold text-[#C8A028] text-base tracking-wider">
                            Manage {adminTable.name}
                          </h3>
                          <p className="text-[11px] text-[#7AAD8A] capitalize">
                            Type: {adminTable.type} · Section: {adminTable.section.replace("-", " ")}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-[10px] text-[#7AAD8A] font-semibold uppercase tracking-wider">Table Status</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(STATUS_DETAILS).filter(([key]) => key !== "selected").map(([key, val]) => (
                              <button
                                key={key}
                                onClick={() => handleAdminStatusChange(adminSelectedTableId, key as Table["status"])}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all text-left flex items-center space-x-2 ${
                                  adminTable.status === key
                                    ? "bg-[#C8A028] text-[#0D3321] border-[#C8A028]"
                                    : "bg-black/35 hover:bg-black/55 text-white border-white/5"
                                }`}
                              >
                                <span 
                                  className="h-2 w-2 rounded-full inline-block" 
                                  style={{ backgroundColor: adminTable.status === key ? "#0D3321" : val.color }}
                                ></span>
                                <span>{val.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Guest Details */}
                        <div className="space-y-1">
                          <p className="text-[10px] text-[#7AAD8A] font-semibold uppercase tracking-wider">Active Guest Information</p>
                          <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 text-[11px] space-y-1">
                            <p><span className="text-[#7AAD8A]">Guest Name:</span> <strong className="text-white">{adminTable.lastGuest || "Walk-in Guest"}</strong></p>
                            <p><span className="text-[#7AAD8A]">Time Slot:</span> <strong className="text-white">{adminTable.timeSlot || "N/A"}</strong></p>
                            <p><span className="text-[#7AAD8A]">Seating Size:</span> <strong className="text-white">{adminTable.capacity} Persons</strong></p>
                          </div>
                        </div>

                        <button
                          onClick={() => setAdminSelectedTableId(null)}
                          className="w-full py-2 bg-black/20 hover:bg-black/45 border border-white/10 text-xs text-white font-bold rounded-lg transition-all"
                        >
                          Close Control Window
                        </button>
                      </div>

                      {/* Right: Bill & Active Order Simulator */}
                      <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between space-y-4 text-left">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] text-[#7AAD8A] font-semibold uppercase tracking-wider">Active Table Bill</p>
                            <span className="text-xs font-bold text-[#C8A028]">₹{adminTable.revenue}</span>
                          </div>
                          
                          {adminTable.status !== "occupied" ? (
                            <div className="bg-black/10 p-6 rounded-lg text-center border border-dashed border-white/5 h-44 flex items-center justify-center">
                              <p className="text-xs text-[#7AAD8A] leading-relaxed">Orders can only be managed when table status is set to "Occupied".</p>
                            </div>
                          ) : (
                            <>
                              {/* Order items queue */}
                              <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                                {activeOrders.length === 0 ? (
                                  <p className="text-[11px] text-[#7AAD8A] italic text-center py-4">No active dishes ordered yet.</p>
                                ) : (
                                  activeOrders.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center text-[11px] bg-black/15 p-2 rounded border border-white/5">
                                      <div>
                                        <span className="font-bold text-white">{item.name}</span>
                                        <span className="text-[#7AAD8A] ml-1">× {item.quantity}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-white font-semibold">₹{item.price * item.quantity}</span>
                                        <button 
                                          onClick={() => removeMockItem(item.name, item.price)}
                                          className="text-red-400 hover:text-red-300 font-bold px-1"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Menu items shortcuts */}
                              <div className="space-y-1.5 pt-1">
                                <p className="text-[9px] text-[#7AAD8A] font-bold uppercase tracking-widest">Add Menu Shortcut</p>
                                <div className="grid grid-cols-1 gap-1.5">
                                  <button
                                    onClick={() => addMockItem("Classic Zinger Burger", 250)}
                                    className="px-2.5 py-1 bg-[#1A4D35] hover:bg-[#205D41] border border-[#C8A028]/25 text-[10px] text-[#C8A028] font-bold rounded flex justify-between transition-all"
                                  >
                                    <span>🍔 Add Zinger Burger</span>
                                    <span>+ ₹250</span>
                                  </button>
                                  <button
                                    onClick={() => addMockItem("Mint Lime Mojito", 150)}
                                    className="px-2.5 py-1 bg-[#1A4D35] hover:bg-[#205D41] border border-[#C8A028]/25 text-[10px] text-[#C8A028] font-bold rounded flex justify-between transition-all"
                                  >
                                    <span>🍹 Add Mint Mojito</span>
                                    <span>+ ₹150</span>
                                  </button>
                                  <button
                                    onClick={() => addMockItem("Temptations Special Pizza", 420)}
                                    className="px-2.5 py-1 bg-[#1A4D35] hover:bg-[#205D41] border border-[#C8A028]/25 text-[10px] text-[#C8A028] font-bold rounded flex justify-between transition-all"
                                  >
                                    <span>🍕 Add Special Pizza</span>
                                    <span>+ ₹420</span>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Smart Hints / Interactive Prompts */}
            {!isAdmin && (
              <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center space-x-3">
                <Info className="h-5 w-5 text-[#C8A028] shrink-0" />
                <div className="text-xs text-[#7AAD8A]">
                  {selectedTableId ? (
                    <span>
                      You have selected <strong className="text-[#C8A028]">Table {selectedTableId}</strong> ({tables.find(t=>t.id===selectedTableId)?.type}). Complete the reservation on the right.
                    </span>
                  ) : (
                    <span>
                      Adjust guests count to <strong className="text-[#C8A028]">auto-recommend</strong> tables. Standard tables support 2-3 guests; sofas host 4 guests.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Statistics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#0F3D27] border border-white/5 rounded-xl p-3.5 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-[#7AAD8A] tracking-wider font-semibold">Occupancy Rate</p>
                <p className="text-lg font-bold text-white">{stats.occupancyRate}%</p>
              </div>
            </div>
            <div className="bg-[#0F3D27] border border-white/5 rounded-xl p-3.5 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-[#C8A028]/10 text-[#C8A028]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-[#7AAD8A] tracking-wider font-semibold">Active Guests</p>
                <p className="text-lg font-bold text-white">{stats.activeGuests} / 30</p>
              </div>
            </div>
            <div className="bg-[#0F3D27] border border-white/5 rounded-xl p-3.5 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-[#7AAD8A] tracking-wider font-semibold">Bookings Today</p>
                <p className="text-lg font-bold text-white">{bookings.length}</p>
              </div>
            </div>
            <div className="bg-[#0F3D27] border border-white/5 rounded-xl p-3.5 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-[#7AAD8A] tracking-wider font-semibold">Table Revenue</p>
                <p className="text-lg font-bold text-white">₹{stats.todayRevenue}</p>
              </div>
            </div>
          </div>
        </div>


        {/* INTERACTIVE CONTROLS SECTION - Span 5 columns on desktop */}
        <div className="lg:col-span-5 flex flex-col space-y-6">

          {/* CUSTOMER BOOKING PANEL */}
          {!isAdmin && (
            <div className="bg-[#0F3D27] border border-[#C8A028]/20 rounded-2xl p-5 shadow-2xl space-y-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-[#C8A028]/10 pb-3 mb-4">
                  <h2 className="text-base font-bold text-[#C8A028] tracking-wide flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-[#C8A028]" />
                    Reserve Premium Seating
                  </h2>
                  <div className="flex items-center space-x-1 text-xs text-[#7AAD8A]">
                    <Award className="h-4 w-4 text-[#C8A028]" />
                    <span>Bronze Club</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Guest Count Selection */}
                  <div className="space-y-2">
                    <label className="text-xs text-[#7AAD8A] font-semibold uppercase tracking-wider block">Number of Guests</label>
                    <div className="flex items-center space-x-4 bg-black/25 p-2 rounded-xl border border-white/5">
                      <button 
                        type="button"
                        onClick={() => setGuestCount(c => Math.max(1, c - 1))}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="flex-1 text-center font-bold text-lg text-white">
                        {guestCount} {guestCount === 1 ? "Guest" : "Guests"}
                      </div>
                      <button 
                        type="button"
                        onClick={() => setGuestCount(c => Math.min(8, c + 1))}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {guestCount > 4 && (
                      <p className="text-[10px] text-[#C8A028] italic">
                        * More than 4 guests: System suggests combining tables (e.g. Sofa Table 5 & 6)
                      </p>
                    )}
                  </div>

                  {/* Booking Date & Time slots */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#7AAD8A] font-semibold uppercase tracking-wider block">Date</label>
                      <input 
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-black/25 text-white rounded-lg p-2 text-xs border border-white/5 outline-none focus:border-[#C8A028]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#7AAD8A] font-semibold uppercase tracking-wider block">Time Slot</label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-black/25 text-white rounded-lg p-2 text-xs border border-white/5 outline-none focus:border-[#C8A028]"
                      >
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="07:00 PM">07:00 PM</option>
                        <option value="08:00 PM">08:00 PM</option>
                        <option value="09:00 PM">09:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Private Seating checkbox */}
                  <div className="flex items-center justify-between p-3 bg-black/25 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-2.5">
                      <Lock className="h-4 w-4 text-[#C8A028]" />
                      <div>
                        <span className="text-xs font-semibold block text-white">Private Seating Zone</span>
                        <span className="text-[10px] text-[#7AAD8A]">Tucked away behind partitions</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privateSeating}
                      onChange={(e) => {
                        setPrivateSeating(e.target.checked);
                        if (e.target.checked) setGuestCount(4); // Private zones support 4 guests
                      }}
                      className="h-4 w-4 accent-[#C8A028] bg-black/25 border-white/10 rounded cursor-pointer"
                    />
                  </div>

                  {/* Special Requests */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#7AAD8A] font-semibold uppercase tracking-wider block">Special Requests</label>
                    <textarea
                      value={specialNote}
                      onChange={(e) => setSpecialNote(e.target.value)}
                      placeholder="E.g., Birthday, candlelight dinner, wheelchair access..."
                      className="w-full bg-black/25 text-white text-xs rounded-lg p-2.5 border border-white/5 h-16 outline-none focus:border-[#C8A028] resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Confirm Booking CTA */}
              <div className="space-y-3.5 pt-4 border-t border-[#C8A028]/10 mt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#7AAD8A]">Loyalty Rewards Balance:</span>
                  <span className="text-[#C8A028] font-bold">{loyaltyPoints} Points</span>
                </div>

                <button
                  type="button"
                  disabled={!selectedTableId}
                  onClick={handleBookTable}
                  className={`w-full py-3 rounded-xl font-bold tracking-widest text-xs flex items-center justify-center space-x-2 transition-all ${
                    selectedTableId 
                      ? "bg-[#C8A028] text-[#0D3321] shadow-lg shadow-[#C8A028]/25 hover:brightness-110 active:scale-95" 
                      : "bg-[#133F2A] text-[#7AAD8A] border border-white/5 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>BOOK SEAT NOW</span>
                </button>
                {!selectedTableId && (
                  <p className="text-[10px] text-center text-[#7AAD8A]">
                    * Please select an available table on the floor layout to book
                  </p>
                )}
              </div>
            </div>
          )}


          {/* ADMIN CONSOLE PANEL */}
          {isAdmin && (
            <div className="bg-[#0F3D27] border border-[#C8A028]/20 rounded-2xl p-5 shadow-2xl flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-center border-b border-[#C8A028]/10 pb-3 mb-4">
                  <h2 className="text-base font-bold text-[#C8A028] tracking-wide flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-[#C8A028]" />
                    Hostess Operations
                  </h2>
                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => setSelectedTab("floor")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
                        selectedTab === "floor" ? "bg-[#C8A028] text-[#0D3321]" : "bg-black/25 text-[#7AAD8A]"
                      }`}
                    >
                      CRM
                    </button>
                    <button
                      onClick={() => setSelectedTab("analytics")}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
                        selectedTab === "analytics" ? "bg-[#C8A028] text-[#0D3321]" : "bg-black/25 text-[#7AAD8A]"
                      }`}
                    >
                      Metrics
                    </button>
                  </div>
                </div>

                {/* Sub Tab: CRM/Bookings view */}
                {selectedTab === "floor" && (
                  <div className="space-y-4">
                    {/* Search filter */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#7AAD8A]" />
                      <input
                        type="text"
                        placeholder="Search guest name, table, section..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/25 text-white pl-9 pr-4 py-2 text-xs rounded-lg border border-white/5 outline-none focus:border-[#C8A028]"
                      />
                    </div>

                    {/* Bookings Queue */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[11px] font-bold text-[#7AAD8A] uppercase tracking-wider">Upcoming Bookings Queue</h4>
                        <span className="px-2 py-0.5 text-[9px] bg-black/20 text-[#C8A028] rounded border border-[#C8A028]/20">{bookings.length} reservations</span>
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {bookings.map((b) => (
                          <div key={b.id} className="bg-black/20 border border-white/5 p-3 rounded-lg flex justify-between items-start text-xs">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-white">{b.guestName}</span>
                                <span className="text-[10px] bg-[#C8A028]/10 text-[#C8A028] px-1 py-0.2 rounded border border-[#C8A028]/25 font-bold">
                                  Table {b.tableId}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#7AAD8A] mt-0.5">{b.guests} Guests · Slot: {b.time}</p>
                              {b.note && <p className="text-[9px] text-[#C8973A] mt-1 font-medium">💡 Note: {b.note}</p>}
                            </div>
                            <button
                              onClick={() => {
                                // Simulate seating guest
                                setTables(prev => prev.map(t => t.id === b.tableId ? { ...t, status: "occupied" } : t));
                                // Remove from queue
                                setBookings(prev => prev.filter(item => item.id !== b.id));
                              }}
                              className="px-2 py-1 rounded bg-[#C8A028]/25 hover:bg-[#C8A028]/45 text-[#C8A028] text-[10px] font-bold border border-[#C8A028]/30"
                            >
                              Seat Guest
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Table Status List Grid */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-[#7AAD8A] uppercase tracking-wider">Live Tables Status CRM</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                        {filteredTables.map((t) => {
                          const statusDetail = STATUS_DETAILS[t.status];
                          return (
                            <div key={t.id} className="bg-black/15 p-2 rounded border border-white/5 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-white">{t.name}</span>
                                <span className="text-[10px] text-[#7AAD8A] ml-2 font-medium">({t.capacity}p)</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusDetail.text} ${statusDetail.bg}`}>
                                {statusDetail.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Tab: Occupancy Analytics / Metrics */}
                {selectedTab === "analytics" && (
                  <div className="space-y-4">
                    {/* Hourly Peak occupancy chart */}
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2">
                      <h4 className="text-[10px] font-bold text-[#7AAD8A] uppercase tracking-wider flex items-center">
                        <TrendingUp className="h-4.5 w-4.5 mr-1.5 text-[#C8A028]" />
                        Peak Hours guest report (Today)
                      </h4>
                      <div className="h-28 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={PEAK_HOURS_DATA}>
                            <XAxis dataKey="hour" stroke="#7AAD8A" fontSize={9} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#0F3D27", border: "1px solid #C8A028" }} />
                            <Bar dataKey="occupancy" fill="#C8A028" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Revenue by Table visual chart */}
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2">
                      <h4 className="text-[10px] font-bold text-[#7AAD8A] uppercase tracking-wider flex items-center">
                        <DollarSign className="h-4.5 w-4.5 mr-1.5 text-[#C8A028]" />
                        Revenue Contribution by Table
                      </h4>
                      <div className="h-28 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={REVENUE_BY_TABLE_DATA}>
                            <XAxis dataKey="name" stroke="#7AAD8A" fontSize={9} />
                            <Tooltip contentStyle={{ background: "#0F3D27", border: "1px solid #C8A028" }} />
                            <Area type="monotone" dataKey="revenue" stroke="#C8A028" fill="rgba(200,160,40,0.15)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reset live floor status */}
              <button
                onClick={() => {
                  setTables(INITIAL_TABLES);
                  setBookings([
                    { id: "B1", tableId: "4", guestName: "Neha R.", guests: 3, time: "06:00 PM", status: "confirmed" },
                    { id: "B2", tableId: "8", guestName: "Dr. Aditya", guests: 4, time: "08:00 PM", status: "confirmed", note: "VIP Guest - Birthday" },
                  ]);
                }}
                className="w-full py-2 border border-[#C8A028]/20 bg-black/25 text-[#C8A028] hover:bg-[#C8A028]/10 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Simulation States</span>
              </button>
            </div>
          )}

          {/* LOYALTY AND REWARDS MOCKUP CARD */}
          {!isAdmin && (
            <div className="bg-[#0F3D27]/80 border border-white/5 backdrop-blur-md rounded-2xl p-4 shadow-xl">
              <h3 className="text-xs font-bold text-[#C8A028] tracking-wider uppercase mb-2 flex items-center">
                <Award className="h-4 w-4 mr-1.5 text-[#C8A028]" />
                Temptations Loyalty Club
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                  <span className="text-[10px] text-[#7AAD8A] block">Referral Reward</span>
                  <span className="font-bold text-[#C8A028] mt-1 block">₹50 Off</span>
                </div>
                <div className="bg-black/20 p-2 rounded-lg border border-white/5 col-span-2 flex flex-col justify-between">
                  <span className="text-[10px] text-[#7AAD8A]">Invite Friends & Earn Points</span>
                  <div className="flex justify-between items-center mt-1 text-[10px]">
                    <code className="bg-black/30 px-1 py-0.5 rounded text-white font-mono select-all">TEMPT50</code>
                    <span className="text-white hover:text-[#C8A028] cursor-pointer font-bold">Copy Link</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Luxury Footer */}
      <footer className="border-t border-[#C8A028]/10 py-4 px-6 text-center text-xs text-[#7AAD8A] bg-[#072115]">
        <p>© 2026 Temptations Cafe. Built with premium materials & responsive grid mechanics. opp. bibi raza girls college, Kalaburagi.</p>
      </footer>
    </div>
  );
}

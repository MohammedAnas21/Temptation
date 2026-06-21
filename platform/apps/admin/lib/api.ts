const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...rest.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API error");
  }
  return res.json() as Promise<T>;
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export const getRevenue = (period = "week", token?: string) =>
  apiFetch<RevenueData>(`/analytics/revenue?period=${period}`, { token });

export const getTopCustomers = (token?: string) =>
  apiFetch<TopCustomer[]>(`/analytics/top-customers?limit=10`, { token });

export const getPopularItems = (token?: string) =>
  apiFetch<PopularItem[]>(`/analytics/popular-items?limit=10`, { token });

export const getPeakHours = (token?: string) =>
  apiFetch<PeakHour[]>(`/analytics/peak-hours`, { token });

export const getReservationAnalytics = (period = "week", token?: string) =>
  apiFetch<any>(`/analytics/reservations?period=${period}`, { token });

// ── Reservations ──────────────────────────────────────────────────────────────
export const getReservations = (params: Record<string, string> = {}, token?: string) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<Reservation[]>(`/reservations?${qs}`, { token });
};

export const updateReservationStatus = (id: string, status: string, token?: string) =>
  apiFetch(`/reservations/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }), token });

// ── Tables ────────────────────────────────────────────────────────────────────
export const getTables = (branchId: string, token?: string) =>
  apiFetch<Table[]>(`/tables?branch_id=${branchId}`, { token });

export const updateTableStatus = (id: string, status: string, token?: string) =>
  apiFetch(`/tables/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }), token });

// ── Orders ────────────────────────────────────────────────────────────────────
export const getOrders = (params: Record<string, string> = {}, token?: string) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<Order[]>(`/orders?${qs}`, { token });
};

export const updateOrderStatus = (id: string, status: string, token?: string) =>
  apiFetch(`/orders/${id}/status?status=${status}`, { method: "PATCH", token });

// ── CRM ───────────────────────────────────────────────────────────────────────
export const getCustomers = (params: Record<string, string> = {}, token?: string) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<Customer[]>(`/crm/customers?${qs}`, { token });
};

export const getCustomerDetail = (id: string, token?: string) =>
  apiFetch<CustomerDetail>(`/crm/customers/${id}`, { token });

export const getSegments = (token?: string) =>
  apiFetch<Segments>(`/crm/segments`, { token });

// ── Menu ─────────────────────────────────────────────────────────────────────
export const getMenuItems = (branchId: string, token?: string) =>
  apiFetch<MenuItem[]>(`/menu/items?branch_id=${branchId}`, { token });

export const toggleItemAvailability = (id: string, available: boolean, token?: string) =>
  apiFetch(`/menu/items/${id}/availability?available=${available}`, { method: "PATCH", token });

// ── Campaigns ─────────────────────────────────────────────────────────────────
export const getCampaigns = (token?: string) =>
  apiFetch<Campaign[]>(`/campaigns`, { token });

export const sendCampaign = (id: string, token?: string) =>
  apiFetch<any>(`/campaigns/${id}/send`, { method: "POST", token });

export const createCampaign = (payload: object, token?: string) =>
  apiFetch<any>(`/campaigns`, { method: "POST", body: JSON.stringify(payload), token });

export const getCampaignStats = (id: string, token?: string) =>
  apiFetch<any>(`/campaigns/${id}/stats`, { token });

// ── Customer Detail ──────────────────────────────────────────────────────────
export const getCustomerTimeline = (id: string, token?: string) =>
  apiFetch<TimelineEvent[]>(`/crm/customers/${id}/timeline`, { token });

export const getCustomerCLV = (id: string, token?: string) =>
  apiFetch<CLVData>(`/crm/customers/${id}/clv`, { token });

export const getCustomerFavorites = (id: string, token?: string) =>
  apiFetch<any[]>(`/crm/customers/${id}/favorites`, { token });

// ── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = (params: Record<string, string> = {}, token?: string) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<AuditLog[]>(`/audit-logs?${qs}`, { token });
};

// ── Exports ──────────────────────────────────────────────────────────────────
export const exportCustomersCSV = (segment: string = "all", token?: string) =>
  apiFetch(`/exports/customers?segment=${segment}`, { token });

export const exportOrdersCSV = (params: Record<string, string> = {}, token?: string) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/exports/orders?${qs}`, { token });
};

// ── KPIs ─────────────────────────────────────────────────────────────────────
export const getDashboardKPIs = (token?: string) =>
  apiFetch<DashboardKPIs>(`/analytics/revenue?period=day`, { token });

// ── Offers ────────────────────────────────────────────────────────────────────
export const getOffers = (token?: string) => apiFetch<Offer[]>(`/offers`, { token });
export const getCoupons = (token?: string) => apiFetch<Coupon[]>(`/offers/coupons`, { token });

export const getPayments = (params: Record<string, string> = {}, token?: string) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<PaymentRecord[]>(`/payments?${qs}`, { token });
};

export const getStaff = (token?: string) =>
  apiFetch<StaffMember[]>(`/staff`, { token });

export const inviteStaff = (payload: object, token?: string) =>
  apiFetch(`/staff`, { method: "POST", body: JSON.stringify(payload), token });

export const getBranches = (token?: string) =>
  apiFetch<Branch[]>(`/branches`, { token });

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PaymentRecord {
  id: string; amount: number; status: string; created_at: string;
}
export interface StaffMember {
  id: string; name: string; phone: string; role: string; is_active: boolean;
}
export interface Branch {
  id: string; name: string; address?: string; city?: string; phone?: string;
}
export interface RevenueData {
  period: string; total_revenue: number; total_orders: number;
  daily: { date: string; revenue: number; orders: number }[];
}
export interface TopCustomer { id: string; name: string; phone: string; orders: number; total_spend: number; }
export interface PopularItem { id: string; name: string; total_ordered: number; revenue: number; }
export interface PeakHour { day: number; hour: number; count: number; }
export interface Reservation {
  id: string; customer_id: string; table_id: string; reservation_date: string;
  reservation_time: string; guest_count: number; seating_type: string;
  status: string; deposit_amount: number; deposit_paid: boolean; created_at: string;
}
export interface Table { id: string; table_number: number; table_type: string; capacity: number; status: string; }
export interface Order { id: string; customer_id: string; order_type: string; status: string; total_amount: number; payment_status: string; created_at: string; }
export interface Customer { id: string; name: string; phone: string; email: string; created_at: string; }
export interface CustomerDetail { profile: Customer; total_spend: number; loyalty: any; recent_orders: any[]; recent_reservations: any[]; }
export interface Segments { vip: number; inactive: number; frequent: number; new_customers: number; birthday_this_month: number; }
export interface MenuItem { id: string; name: string; price: number; category_id: string; is_available: boolean; is_veg: boolean; image_url?: string; }
export interface Campaign { id: string; name: string; type: string; status: string; }
export interface Offer { id: string; title: string; description?: string; valid_until?: string; }
export interface Coupon { id: string; code: string; type: string; value: number; used_count: number; is_active: boolean; }
export interface TimelineEvent { id: string; event_type: string; event_date: string; description: string; amount?: number; }
export interface CLVData { total_revenue: number; order_count: number; avg_order_value: number; visit_count: number; }
export interface AuditLog { id: string; user_id: string; action: string; resource_type: string; resource_id: string; details: any; created_at: string; }
export interface DashboardKPIs { total_revenue: number; total_orders: number; daily: { date: string; revenue: number; orders: number }[]; }

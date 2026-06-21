const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "API error");
  }

  return res.json() as Promise<T>;
}

// ── Branches ──────────────────────────────────────────────────────────────────
export const getBranches = () => apiFetch<Branch[]>("/branches");

export interface Branch {
  id: string; name: string; address?: string; city?: string; phone?: string;
}

// ── Menu ─────────────────────────────────────────────────────────────────────
export const getCategories = (branchId: string) =>
  apiFetch<MenuCategory[]>(`/menu/categories?branch_id=${branchId}`);

export const getMenuItems = (branchId: string, params?: Record<string, string>) => {
  const qs = new URLSearchParams({ branch_id: branchId, ...params }).toString();
  return apiFetch<MenuItem[]>(`/menu/items?${qs}`);
};

export const getMenuItem = (id: string) =>
  apiFetch<MenuItem>(`/menu/items/${id}`);

// ── Offers ────────────────────────────────────────────────────────────────────
export const getOffers = () => apiFetch<Offer[]>("/offers");

// ── Blog ─────────────────────────────────────────────────────────────────────
export const getBlogPosts = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<BlogPost[]>(`/blog/posts${qs}`);
};

export const getBlogPost = (slug: string) =>
  apiFetch<BlogPost>(`/blog/posts/${slug}`);

// ── Search ──────────────────────────────────────────────────────────────────
export const searchMenuItems = (query: string) =>
  apiFetch<MenuItem[]>(`/menu/items/search?q=${encodeURIComponent(query)}`);

// ── Contact ─────────────────────────────────────────────────────────────────
export const submitContactForm = (data: { name: string; email: string; message: string }) =>
  apiFetch<{ ok: boolean }>("/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ── Tables ────────────────────────────────────────────────────────────────────
export const getTableAvailability = (branchId: string, date: string, time: string, guests: number) =>
  apiFetch<Table[]>(`/tables/availability?branch_id=${branchId}&reservation_date=${date}&reservation_time=${time}&guests=${guests}`);

// ── Types ─────────────────────────────────────────────────────────────────────
export interface MenuCategory {
  id: string; name: string; slug: string; image_url?: string; display_order: number;
}

export interface MenuItem {
  id: string; category_id: string; name: string; description?: string;
  price: number; image_url?: string; is_veg: boolean; ingredients: string[];
  preparation_time: number; is_available: boolean;
  is_best_seller: boolean; is_recommended: boolean; is_chef_special: boolean;
}

export interface Offer {
  id: string; title: string; description?: string; image_url?: string; valid_until?: string;
}

export interface BlogPost {
  id: string; title: string; slug: string; excerpt?: string;
  featured_image_url?: string; tags: string[]; published_at?: string; content?: string;
}

export interface Table {
  id: string; table_number: number; table_type: string; capacity: number; status: string;
}

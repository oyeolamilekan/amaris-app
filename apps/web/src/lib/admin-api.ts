/**
 * Admin API Client
 * Handles administrative tasks like package management
 */

const API_BASE_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  polarProductId: string;
  currency: string;
}

export interface CreatePackageRequest {
  id: string;
  name: string;
  credits: number;
  price: number;
  polarProductId: string;
}

export interface UpdatePackageRequest {
  name?: string;
  credits?: number;
  price?: number;
  polarProductId?: string;
}

/**
 * List all credit packages
 */
export async function listPackages(): Promise<CreditPackage[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/packages`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch packages");
  return res.json();
}

/**
 * Create a new credit package
 */
export async function createPackage(data: CreatePackageRequest): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/packages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create package");
  return res.json();
}

/**
 * Update an existing credit package
 */
export async function updatePackage(
  id: string,
  data: UpdatePackageRequest,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/packages/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update package");
  return res.json();
}

/**
 * Delete a credit package
 */
export async function deletePackage(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/packages/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete package");
  return res.json();
}

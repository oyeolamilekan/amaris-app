/**
 * Admin API Client
 * Handles administrative tasks like package management
 */

import { API_BASE_URL } from "../constants";

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

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  createdAt: string;
  credits: number | null;
}

/**
 * List all credit packages
 */
export async function listPackages(): Promise<CreditPackage[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/packages`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch packages");
  const json = await res.json();
  return json.data;
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
  await res.json();
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
  await res.json();
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
  await res.json();
}

/**
 * List all users
 */
export async function listUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  const json = await res.json();
  return json.data;
}

/**
 * Update user credits
 */
export async function updateUserCredits(
  userId: string,
  credits: number,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/credits`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credits }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update user credits");
  await res.json();
}

/**
 * Authentication utilities for database operations
 */

import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

export interface AuthResult {
  user: User | null;
  error: string | null;
}

/**
 * Get the currently authenticated user
 * Returns user object or null with error message
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  const supabase = createBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error: error.message };
  }

  if (!user) {
    return { user: null, error: "Vous devez etre connecte." };
  }

  return { user, error: null };
}

/**
 * Require authentication - throws if not authenticated
 * Use in functions that require a logged-in user
 */
export async function requireAuth(): Promise<User> {
  const { user, error } = await getAuthenticatedUser();
  if (!user) {
    throw new Error(error ?? "Non authentifie");
  }
  return user;
}

/**
 * Check if current user owns a resource
 * Returns error message if not owner, null if owner
 */
export async function verifyOwnership(
  resourceUserId: string,
  errorMessage: string = "Vous ne pouvez modifier que vos propres ressources."
): Promise<string | null> {
  const { user, error } = await getAuthenticatedUser();

  if (!user) return error;
  if (user.id !== resourceUserId) return errorMessage;

  return null;
}

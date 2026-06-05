import type { User } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { db } from './index';
import { userProfiles, type NewUserProfile } from './schema';

function getDefaultFullName(user: User) {
  const metadataName = user.user_metadata?.full_name;
  if (typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName.trim();
  }
  return user.email?.split('@')[0] || 'New patient';
}

export async function getUserProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);

  return profile ?? null;
}

export async function ensureUserProfile(user: User) {
  const existing = await getUserProfile(user.id);
  if (existing) return existing;

  const newProfile: NewUserProfile = {
    id: user.id,
    role: 'patient',
    fullName: getDefaultFullName(user),
    preferredLanguage: 'en',
  };

  const [created] = await db
    .insert(userProfiles)
    .values(newProfile)
    .onConflictDoNothing()
    .returning();

  return created ?? (await getUserProfile(user.id));
}

export async function updateUserProfile(
  userId: string,
  values: {
    fullName: string;
    country?: string | null;
    preferredLanguage: string;
  },
) {
  const [updated] = await db
    .update(userProfiles)
    .set({
      fullName: values.fullName,
      country: values.country || null,
      preferredLanguage: values.preferredLanguage,
    })
    .where(eq(userProfiles.id, userId))
    .returning();

  return updated;
}

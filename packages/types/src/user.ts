export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  preferred_supermarket_id: string | null;
  created_at: string;
  updated_at: string;
}

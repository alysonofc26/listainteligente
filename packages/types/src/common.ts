export type Timestamp = string;

export interface BaseEntity {
  id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

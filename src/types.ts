export type TravelEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  trip: string;
  miles: number;
  purpose: string;
  created_at: string;
};

export type TravelEntryInput = {
  entryDate: string;
  trip: string;
  miles: number;
  purpose: string;
};

export type MonthRange = {
  start: string;
  end: string;
};

export type Profile = {
  fullName: string;
};

export type ActionResult = { success: true } | { success: false; message: string };

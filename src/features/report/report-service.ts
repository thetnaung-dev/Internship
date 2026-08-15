import { supabase } from "@/shared/lib/supabase";

export type ReportReason =
  | "unrelated_to_real_estate"
  | "spam"
  | "scam"
  | "inappropriate"
  | "duplicate"
  | "other";

export interface InsertReportParams {
  propertyId?: string;
  wantedListingId?: string;
  reason: ReportReason;
  description?: string;
}

export async function insertReport({
  propertyId,
  wantedListingId,
  reason,
  description,
}: InsertReportParams) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    property_id: propertyId || null,
    wanted_listing_id: wantedListingId || null,
    reason,
    description: description?.trim() || null,
  });

  if (error) throw error;
}

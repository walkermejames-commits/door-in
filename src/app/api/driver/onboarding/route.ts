import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const applicationSchema = z.object({
  legalName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  vehicleSummary: z.string().trim().min(3).max(240),
  serviceTypes: z.array(z.enum(["collection_delivery", "shop_and_deliver"])).min(1),
  insuranceExpiresOn: z.string().date().optional(),
});

export async function POST(request: Request) {
  try {
    const input = applicationSchema.parse(await request.json());
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (typeof userId !== "string") return NextResponse.json({ error: "Sign in before applying." }, { status: 401 });
    const admin = createAdminClient();
    const { data: existingUser } = await admin.from("users").select("id").eq("id", userId).maybeSingle();
    if (!existingUser) {
      const email = claims?.claims?.email;
      if (typeof email !== "string") return NextResponse.json({ error: "Your signed-in account needs an email address." }, { status: 400 });
      const { error: userError } = await admin.from("users").insert({ id: userId, full_name: input.legalName, phone: input.phone, email, role: "buyer" });
      if (userError) throw userError;
    }
    const serviceBrands = input.serviceTypes.map((type) => type === "shop_and_deliver" ? "doorin5" : "door_in_four");
    const { data, error } = await admin.from("driver_profiles").upsert({
      user_id: userId,
      status: "pending",
      onboarding_status: "pending_review",
      legal_name: input.legalName,
      onboarding_notes: `Phone: ${input.phone}\nVehicle: ${input.vehicleSummary}${input.insuranceExpiresOn ? `\nInsurance expiry: ${input.insuranceExpiresOn}` : ""}`,
      service_brands: serviceBrands,
    }, { onConflict: "user_id" }).select("user_id, status, service_brands").single();
    if (error) throw error;
    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not submit application." }, { status: 400 });
  }
}

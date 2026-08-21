"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function submit(formData: FormData) {
    setPending(true); setError(null);
    try {
      const supabase = createClient();
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      const action = String(formData.get("action") ?? "sign-in");
      const result = action === "sign-up" ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      router.replace("/"); router.refresh();
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : "Could not sign in."); } finally { setPending(false); }
  }
  return <form action={submit} className="request-form"><label>Email<input type="email" name="email" required /></label><label>Password<input type="password" name="password" minLength={8} required /></label><div className="actions"><button name="action" value="sign-in" disabled={pending}>Sign in</button><button className="button secondary" name="action" value="sign-up" disabled={pending}>Create account</button></div>{error ? <p className="error">{error}</p> : null}<p className="fine-print">New customer accounts are created with the customer role. Driver access is granted only after an operations approval.</p></form>;
}

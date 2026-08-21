import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() { return <section className="auth-page"><div className="auth-welcome"><span className="auth-duck" aria-hidden="true">🦆</span><p className="eyebrow">Welcome back</p><h1>Your deliveries are waiting.</h1><p>Sign in to request a quote, check progress and keep everything in one place.</p></div><div className="auth-card"><h2>Sign in</h2><p>New here? You can create your account below.</p><LoginForm /></div></section>; }

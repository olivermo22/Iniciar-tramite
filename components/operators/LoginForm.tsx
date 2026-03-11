"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="card max-w-md mx-auto mt-12 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await signIn("credentials", { username, password, redirect: false, callbackUrl: "/operators/dashboard" });
        if (res?.ok) window.location.href = "/operators/dashboard";
        else setError("Credenciales inválidas");
      }}
    >
      <h1 className="text-xl font-bold">Acceso operadores</h1>
      <p className="text-xs text-slate-600">Usuario provisional: ADMIN / Contraseña provisional: 1793</p>
    <form className="card max-w-md mx-auto mt-12 space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      const res = await signIn("credentials", { username, password, redirect: false, callbackUrl: "/operators/dashboard" });
      if (res?.ok) window.location.href = "/operators/dashboard";
      else setError("Credenciales inválidas");
    }}>
      <h1 className="text-xl font-bold">Acceso operadores</h1>
      <input className="input" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="input" placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <button className="px-4 py-2 rounded-lg bg-slate-900 text-white">Ingresar</button>
    </form>
  );
}

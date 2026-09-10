"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useRole,
  setStoredUser,
  UserProfile,
  ROLE_LABELS,
  Role,
  getDefaultUsersForState,
  PREDEFINED_USERS_BY_STATE,
  GLOBAL_SUPERADMIN_USER,
} from "@/hooks/useRole";
import {
  getStateConfig,
  getAllSupportedStates,
  getStateConfigByKey,
  StateConfig,
} from "@/lib/stateConfig";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useRole();
  const [stateCfg, setStateCfg] = useState<StateConfig>(getStateConfig());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [simulatedState, setSimulatedState] = useState<string>("");

  useEffect(() => {
    const cfg = getStateConfig();
    setStateCfg(cfg);

    // Si ya tiene sesión activa y coincide con el estado, enviar a /situacion
    const stored = user;
    if (stored && stored.state_key === cfg.key) {
      router.push("/situacion");
    }
  }, [user, router]);

  const stateUsers = getDefaultUsersForState(stateCfg.key);
  const allStates = getAllSupportedStates();

  const handleLoginWithProfile = (profile: UserProfile) => {
    setErrorMessage(null);

    // Si es Superadministrador Global (admin@sentineliq.com.mx), tiene acceso directo a cualquier estado
    const isGlobal =
      profile.email?.toLowerCase() === "admin@sentineliq.com.mx" ||
      profile.state_key === "global";

    if (!isGlobal && profile.state_key.toLowerCase() !== stateCfg.key.toLowerCase()) {
      const foreignState = getStateConfigByKey(profile.state_key)?.name || profile.state_key.toUpperCase();
      setErrorMessage(
        `Acceso Denegado por Jurisdicción Estatal: El usuario "${profile.name}" está dado de alta en ${foreignState}. No puede ingresar a la plataforma de ${stateCfg.name}.`
      );
      return;
    }

    // Iniciar sesión exitosamente
    setStoredUser(profile);
    router.push("/situacion");
  };

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage("Por favor ingrese su correo institucional.");
      return;
    }

    // 1. Caso especial: Superadministrador Global
    if (email.toLowerCase().trim() === "admin@sentineliq.com.mx") {
      handleLoginWithProfile(GLOBAL_SUPERADMIN_USER);
      return;
    }

    // 2. Buscar si coincide con algún usuario de este estado
    const found = stateUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (found) {
      handleLoginWithProfile(found);
    } else {
      // Buscar si el usuario existe en OTRO estado para activar la barrera de seguridad
      const otherUser = Object.values(PREDEFINED_USERS_BY_STATE)
        .flat()
        .find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (otherUser) {
        const foreignState = getStateConfigByKey(otherUser.state_key)?.name || otherUser.state_key.toUpperCase();
        setErrorMessage(
          `Acceso Denegado por Jurisdicción Estatal: Las credenciales ingresadas pertenecen al ${foreignState}. No tiene autorización para ingresar a la plataforma de ${stateCfg.name}.`
        );
      } else {
        // Asignar por defecto como analista de este estado si ingresa cualquier otro correo corporativo
        const newUser: UserProfile = {
          id: `u_${stateCfg.key}_${Date.now()}`,
          name: email.split("@")[0].replace(".", " ").toUpperCase(),
          email: email,
          cargo: "Funcionario Autorizado",
          role: "analista",
          state_key: stateCfg.key,
          active: true,
        };
        handleLoginWithProfile(newUser);
      }
    }
  };

  // Simulación de prueba de seguridad con credenciales de otro estado
  const handleSimulateCrossStateLogin = (foreignStateKey: string) => {
    const foreignUsers = getDefaultUsersForState(foreignStateKey);
    if (foreignUsers.length > 0) {
      handleLoginWithProfile(foreignUsers[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 px-4 py-8 relative overflow-hidden">
      {/* Fondo decorativo táctico */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]"></div>
      <div className="absolute w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-3xl -top-48 -left-48 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -bottom-48 -right-48 pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Cabecera Institucional */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-4 py-1.5 rounded-full text-xs font-bold text-sky-400 mb-3 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SENTINELIQ · SISTEMA DE INTELIGENCIA ESTRATÉGICA
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
            {stateCfg.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md mx-auto">
            Plataforma Segura de Inteligencia Territorial, Monitoreo de Fuentes y Despacho de Gabinete
          </p>
        </div>

        {/* Tarjeta de Autenticación */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Alerta de Error / Jurisdicción */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-3 animate-fadeIn">
              <i className="ri-shield-cross-fill text-red-400 text-lg shrink-0 mt-0.5"></i>
              <div className="grow">
                <span className="font-bold block text-white text-xs mb-0.5">
                  Alerta de Seguridad Territorial
                </span>
                {errorMessage}
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-white"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          )}

          {/* Opción 1: Acceso Rápido por Perfil Autorizado (Recomendado) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Seleccione su Perfil de Mando ({stateCfg.shortName})
              </span>
              <span className="text-[11px] text-sky-400 font-semibold bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/40">
                4 Roles Oficiales
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stateUsers.map((u) => {
                const roleInfo = ROLE_LABELS[u.role] || ROLE_LABELS.analista;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleLoginWithProfile(u)}
                    type="button"
                    className="group text-left p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/60 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-700 text-white font-black text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
                        {u.name.charAt(0)}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleInfo.bgClass}`}
                      >
                        {roleInfo.title}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1 mb-0.5">
                        {u.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mb-1">
                        {u.cargo}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {u.email}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-6 text-center">
            <hr className="border-slate-800" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              O ingrese con credenciales
            </span>
          </div>

          {/* Formulario Tradicional */}
          <form onSubmit={handleCredentialLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Institucional
              </label>
              <div className="relative">
                <i className="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`usuario@${stateCfg.key === "gto" ? "guanajuato" : "queretaro"}.gob.mx`}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <i className="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-sky-500/25 flex items-center justify-center gap-2"
            >
              <i className="ri-login-circle-line text-base"></i>
              <span>Autenticar e Ingresar al Sistema</span>
            </button>
          </form>

          {/* Bloque de Verificación de Seguridad Territorial (Demo) */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400 mb-2 font-medium">
              Prueba de Aislamiento de Seguridad entre Estados:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {allStates
                .filter((s) => s.key !== stateCfg.key)
                .map((foreignState) => (
                  <button
                    key={foreignState.key}
                    type="button"
                    onClick={() => handleSimulateCrossStateLogin(foreignState.key)}
                    className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-300 text-[10px] font-bold transition-all flex items-center gap-1.5"
                  >
                    <i className="ri-forbid-line"></i>
                    <span>Simular intento con credencial de {foreignState.shortName}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Footer Institucional */}
        <div className="mt-6 text-center text-slate-500 text-[11px] space-y-1">
          <p className="font-medium">
            Acceso estrictamente reservado a mandos y analistas acreditados.
          </p>
          <p className="text-[10px] text-slate-600">
            SentinelIQ v3.6.0 · Jurisdicción Oficial {stateCfg.name}
          </p>
        </div>
      </div>
    </div>
  );
}

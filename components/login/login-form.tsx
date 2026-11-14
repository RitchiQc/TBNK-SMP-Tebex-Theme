"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/lib/basket/actions";
import type { LoginState } from "@/lib/basket/action-types";
import { PlayerAvatar } from "@/components/ui/player-avatar";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    null
  );
  const [username, setUsername] = useState("");

  return (
    <form className="login-form" action={formAction}>
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="username">Pseudo Minecraft</label>
        <input
          id="username"
          name="username"
          className="input"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Ex. Alex_13241"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={16}
          required
        />
        <p className="form-note">
          Utilise exactement le pseudo de ton compte Minecraft Java. Aucun mot
          de passe n’est demandé : Tebex associe le pseudo à ton panier.
        </p>
      </div>

      {username.trim().length >= 3 ? (
        <div className="login-avatar">
          <PlayerAvatar username={username.trim()} size={48} />
          <div>
            <b>{username.trim()}</b>
            <span>Aperçu de l’avatar Minecraft</span>
          </div>
        </div>
      ) : null}

      {state?.error ? (
        <p className="field-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary btn-lg btn-wide"
        disabled={isPending}
      >
        {isPending ? <span className="spinner" /> : "Continuer"}
      </button>

      <p className="form-note">
        Ton pseudo est utilisé pour identifier la livraison. Si tu changes de
        pseudo, ton panier actuel sera réinitialisé.
      </p>
    </form>
  );
}

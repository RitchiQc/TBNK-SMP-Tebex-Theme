"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { Icon } from "./icons";

type ToastVariant = "success" | "error" | "info";

type ToastAction = {
  label: string;
  href: string;
};

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
};

type ToastContextValue = {
  toast: (
    message: string,
    options?: { variant?: ToastVariant; action?: ToastAction }
  ) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    (message, options) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setItems((current) => [
        ...current,
        {
          id,
          message,
          variant: options?.variant ?? "info",
          action: options?.action
        }
      ]);
      window.setTimeout(() => dismiss(id), 5200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {items.map((item) => (
          <div key={item.id} className={`toast toast--${item.variant}`}>
            <span className="toast__icon">
              <Icon
                name={
                  item.variant === "success"
                    ? "check-circle"
                    : item.variant === "error"
                      ? "alert-circle"
                      : "info"
                }
                size={16}
              />
            </span>
            <div className="toast__message">
              {item.message}
              {item.action ? (
                <>
                  {" "}
                  <a href={item.action.href}>{item.action.label}</a>
                </>
              ) : null}
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => dismiss(item.id)}
              aria-label="Fermer la notification"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé dans un ToastProvider");
  }
  return context;
}

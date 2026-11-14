export type BasketActionResult =
  | { success: true; message?: string }
  | {
      success: false;
      error: string;
      needsLogin?: boolean;
      needsAuth?: boolean;
    };

export type LoginState = { error: string } | null;

export type PendingAdd = {
  packageId: number | string;
  quantity: number;
  variableData?: Record<string, string>;
  returnPath: string;
};

export type AddToBasketInput = {
  packageId: number | string;
  quantity: number;
  variableData?: Record<string, string>;
  returnPath: string;
};

export type CheckoutResult =
  | { mode: "demo" }
  | { mode: "checkout"; ident: string; url: string | null }
  | { mode: "auth"; url: string }
  | { mode: "error"; error: string };

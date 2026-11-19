export {};

type TebexCheckoutEventName =
  | "open"
  | "close"
  | "payment:complete"
  | "payment:error";

type TebexCheckoutEventHandler = (event: unknown) => void;

declare global {
  interface Window {
    Tebex?: {
      checkout?: {
        init: (options: {
          ident: string;
          theme?: "dark" | "light" | "auto" | "default";
          colors?: Array<{ name: string; color: string }>;
          closeOnPaymentComplete?: boolean;
        }) => void;
        launch: () => void;
        on?: (
          event: TebexCheckoutEventName,
          handler: TebexCheckoutEventHandler
        ) => void;
        off?: (
          event: TebexCheckoutEventName,
          handler: TebexCheckoutEventHandler
        ) => void;
      };
    };
  }
}

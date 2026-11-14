export {};

declare global {
  interface Window {
    Tebex?: {
      checkout?: {
        init: (options: {
          ident: string;
          theme?: "dark" | "light";
          colors?: Array<{ name: string; color: string }>;
        }) => void;
        launch: () => void;
      };
    };
  }
}

"use client";

import Script from "next/script";

type WeglotInstance = {
  initialize: (options: {
    api_key: string;
    switchers?: Array<{
      style?: {
        full_name?: boolean;
        with_name?: boolean;
        is_dropdown?: boolean;
        with_flags?: boolean;
        flag_type?: string;
      };
      location?: {
        target: string;
        sibling?: string | null;
      };
    }>;
  }) => void;
};

export default function Weglot() {
  const apiKey =
    process.env.NEXT_PUBLIC_WEGLOT_API_KEY;

  if (!apiKey) {
    console.error(
      "Weglot: NEXT_PUBLIC_WEGLOT_API_KEY is missing."
    );

    return null;
  }

  return (
    <Script
      src="https://cdn.weglot.com/weglot.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        const Weglot = (
          window as typeof window & {
            Weglot?: WeglotInstance;
          }
        ).Weglot;

        if (!Weglot) {
          console.error(
            "Weglot: library loaded but Weglot is unavailable."
          );
          return;
        }

        Weglot.initialize({
          api_key: apiKey,
          switchers: [
            {
              style: {
                full_name: true,
                with_name: true,
                is_dropdown: true,
                with_flags: true,
                flag_type: "circle",
              },
              location: {
                target: "#weglot-header",
                sibling: null,
              },
            },
          ],
        });
      }}
      onError={() => {
        console.error(
          "Weglot: failed to load library."
        );
      }}
    />
  );
}
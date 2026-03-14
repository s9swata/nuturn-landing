"use client";

import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export function CalEmbed() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({
        namespace: "client-call",
      });
      cal("floatingButton", {
        calLink: "saswata-biswas-dfnuvi/client-call",
        config: {
          layout: "month_view",
          useSlotsViewOnSmallScreen: "true",
        },
      });
      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
        theme: "dark",
        styles: {
          branding: {
            brandColor: "#f59e0b",
          },
        },
      });
    })();
  }, []);

  return null;
}

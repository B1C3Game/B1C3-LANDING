(function () {
  const config = window.B1C3AnalyticsConfig || {};
  const endpoint = typeof config.endpoint === "string" ? config.endpoint.replace(/\/$/, "") : "";

  if (!config.enabled || !endpoint || endpoint.indexOf("your-worker-subdomain") !== -1) {
    return;
  }

  function normalizePath(pathname) {
    if (!pathname) {
      return "/";
    }

    let normalized = pathname.replace(/\/index\.html$/, "/");
    normalized = normalized.replace(/\/+/g, "/");

    if (normalized.length > 1 && normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }

    return normalized || "/";
  }

  function ensureCounterElement() {
    const postDate = document.querySelector(".article-hero .post-date");
    if (!postDate) {
      return null;
    }

    let counter = document.querySelector(".analytics-counter");
    if (counter) {
      return counter;
    }

    counter = document.createElement("p");
    counter.className = "analytics-counter";
    counter.textContent = "Reads: ...";
    postDate.insertAdjacentElement("afterend", counter);
    return counter;
  }

  function updateCounter(data) {
    const counter = ensureCounterElement();
    if (!counter || !data || typeof data.totalViews !== "number") {
      return;
    }

    counter.textContent = "Reads: " + data.totalViews.toLocaleString();
    if (typeof data.uniqueVisitors === "number") {
      counter.title = "Approx. unique visitors: " + data.uniqueVisitors.toLocaleString();
    }
  }

  async function trackPageView() {
    const path = normalizePath(window.location.pathname);
    const payload = {
      path: path,
      title: document.title
    };

    try {
      const response = await fetch(endpoint + "/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        mode: "cors",
        keepalive: true,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      updateCounter(data);
    } catch (error) {
      console.warn("Analytics tracking failed", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackPageView, { once: true });
  } else {
    trackPageView();
  }
})();

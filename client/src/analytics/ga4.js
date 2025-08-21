export function gaReady() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

export function pageView(path, locationHref) {
  if (!gaReady()) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: locationHref
  });
}

export function trackCtaClick(cta_id) {
  if (!gaReady()) return;
  window.gtag('event', 'cta_click', { cta_id });
}

export function trackNeedsListCreated({ list_id, items_count, time_to_complete_sec }) {
  if (!gaReady()) return;
  window.gtag('event', 'needs_list_created', {
    list_id,
    items_count,
    time_to_complete_sec,
    cta_id: 'create_needs_list'
  });
}

export function trackOutboundPurchaseClick({ retailer, list_id }) {
  if (!gaReady()) return;
  window.gtag('event', 'outbound_purchase_click', {
    retailer,
    list_id
  });
}

export function trackPurchaseSelfReported({ retailer, list_id, items_count }) {
  if (!gaReady()) return;
  window.gtag('event', 'purchase_self_reported', {
    retailer,
    list_id,
    items_count
  });
}
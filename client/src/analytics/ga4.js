export function gaReady() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

export function pageView(path, locationHref) {
  if (!gaReady()) {
    console.warn('GA4 not ready for page_view event');
    return;
  }
  console.log('📄 GA4 Page View:', path);
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: locationHref
  });
}

export function trackCtaClick(cta_id) {
  if (!gaReady()) {
    console.warn('GA4 not ready for cta_click event');
    return;
  }
  console.log('🎯 GA4 CTA Click:', cta_id);
  window.gtag('event', 'cta_click', { cta_id });
}

export function trackNeedsListCreated({ list_id, items_count, time_to_complete_sec }) {
  if (!gaReady()) {
    console.warn('GA4 not ready for needs_list_created event');
    return;
  }
  console.log('📝 GA4 Needs List Created:', { list_id, items_count, time_to_complete_sec });
  window.gtag('event', 'needs_list_created', {
    list_id,
    items_count,
    time_to_complete_sec,
    cta_id: 'create_needs_list'
  });
}

export function trackOutboundPurchaseClick({ retailer, list_id }) {
  if (!gaReady()) {
    console.warn('GA4 not ready for outbound_purchase_click event');
    return;
  }
  console.log('🛒 GA4 Outbound Purchase Click:', { retailer, list_id });
  window.gtag('event', 'outbound_purchase_click', {
    retailer,
    list_id
  });
}

export function trackPurchaseSelfReported({ retailer, list_id, items_count }) {
  if (!gaReady()) {
    console.warn('GA4 not ready for purchase_self_reported event');
    return;
  }
  console.log('✅ GA4 Purchase Self-Reported:', { retailer, list_id, items_count });
  window.gtag('event', 'purchase_self_reported', {
    retailer,
    list_id,
    items_count
  });
}
// Debug helper for GA4 tracking verification
export function enableGA4Debug() {
  if (typeof window !== 'undefined') {
    // Enable GA4 debug mode
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });
    
    // Add debug logging to track events
    const originalGtag = window.gtag;
    if (originalGtag) {
      window.gtag = function(...args) {
        console.log('🔍 GA4 Event Sent:', args);
        return originalGtag.apply(this, args);
      };
    }
    
    // Log dataLayer pushes
    const originalPush = window.dataLayer.push;
    window.dataLayer.push = function(...args) {
      console.log('📊 DataLayer Push:', args);
      return originalPush.apply(this, args);
    };
  }
}

// Manual test function for GA4 events
export function testGA4Events() {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('🧪 Testing GA4 Events...');
    
    // Test page view
    window.gtag('event', 'page_view', {
      page_path: '/test',
      page_location: window.location.href
    });
    
    // Test CTA click
    window.gtag('event', 'cta_click', { cta_id: 'test_button' });
    
    // Test needs list created
    window.gtag('event', 'needs_list_created', {
      list_id: 'test_123',
      items_count: 5,
      time_to_complete_sec: 120,
      cta_id: 'create_needs_list'
    });
    
    console.log('✅ GA4 test events sent!');
  } else {
    console.error('❌ GA4 (gtag) not available');
  }
}
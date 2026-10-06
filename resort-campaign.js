// Rendering and expiry only; this never replaces public URLs or starts a booking.
function resortCampaignState(now, campaign) {
  campaign = campaign || FD_CAMPAIGN;
  var parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  function part(type) { return parts.find(function (p) { return p.type === type; }).value; }
  var day = part('year') + '-' + part('month') + '-' + part('day');
  var statuses = campaign.offers.map(function (offer) {
    return offer.end && day > offer.end ? 'expired' : offer.start && day < offer.start ? 'upcoming' : 'active';
  });
  return { statuses: statuses, allExpired: statuses.length > 0 && statuses.every(function (status) { return status === 'expired'; }) };
}

(function () {
  var expiryTimer;
  function renderCampaign() {
    var campaigns = Object.assign({resort: FD_CAMPAIGN}, typeof FD_VENUE_CAMPAIGNS === 'undefined' ? {} : FD_VENUE_CAMPAIGNS);
    document.querySelectorAll('[data-campaign-banner]').forEach(function (banner) {
      var campaign = campaigns[banner.dataset.campaignBanner];
      if (!campaign) return;
      banner.querySelector('.lh-offer-title').textContent = campaign.name;
      banner.querySelector('.lh-offer-sub').textContent = campaign.bannerDescription;
      banner.setAttribute('aria-label', campaign.bannerLabel);
      banner.hidden = resortCampaignState(new Date(), campaign).allExpired;
    });
    var campaign = campaigns[document.body.dataset.campaignVenue || 'resort'] || FD_CAMPAIGN;
    var state = resortCampaignState(new Date(), campaign);
    if (document.body.dataset.campaignPage === 'offer') {
      document.title = campaign.metadata.title;
      document.querySelector('meta[name="description"]').content = campaign.metadata.description;
      document.querySelector('meta[property="og:title"]').content = campaign.metadata.socialTitle;
      document.querySelector('meta[property="og:description"]').content = campaign.metadata.socialDescription;
      document.querySelector('.page-heading h1').textContent = campaign.name;
      document.querySelector('.occasion').textContent = campaign.occasion;
      document.querySelector('.slogan').textContent = campaign.slogan;
      document.querySelector('.slogan').hidden = !campaign.slogan;
      var offers = document.querySelector('.offers');
      offers.setAttribute('aria-label', campaign.offersLabel);
      offers.innerHTML = campaign.offers.map(function (offer, index) {
        var expired = state.statuses[index] === 'expired';
        return '<article class="offer-card" aria-labelledby="' + offer.titleId + '" data-start="' + (offer.start || '') + '" data-end="' + (offer.end || '') + '">'
          + '<div class="offer-head"><span class="offer-label">' + offer.label + '</span>' + (offer.datesHTML ? '<p class="offer-dates">' + offer.datesHTML + '</p>' : '') + '</div>'
          + '<h2 class="offer-title" id="' + offer.titleId + '"><span class="offer-intro">' + offer.intro + '</span><span class="offer-value"><bdi class="amount" dir="ltr">' + offer.amount + '</bdi>' + (offer.currency ? '<span class="currency">' + offer.currency + '</span>' : '') + '</span></h2>'
          + '<p class="offer-note">' + offer.noteHTML + '</p>'
          + (expired ? '<p class="offer-ended-label">انتهى العرض</p>' : '') + '</article>';
      }).join('');
      document.querySelector('.offer-terms').textContent = campaign.terms;
      var booking = document.querySelector('.offer-booking-link');
      booking.textContent = campaign.bookingLabel;
      booking.href = 'https://wa.me/' + campaign.whatsappNumber + '?text=' + encodeURIComponent(campaign.whatsappMessage);
      ['.hero', '.offers', '.offer-terms', '.booking-bar'].forEach(function (selector) {
        document.querySelector(selector).hidden = state.allExpired;
      });
      document.querySelector('.offer-terms').hidden = state.allExpired || !campaign.terms;
      document.getElementById('offer-expired').hidden = !state.allExpired;
    }
    clearTimeout(expiryTimer);
    var nextBoundary = Object.keys(campaigns).flatMap(function (key) { return campaigns[key].offers; }).filter(function (offer) { return !!offer.end; }).map(function (offer) {
      return Date.parse(offer.end + 'T23:59:59.999+03:00') + 1;
    }).filter(function (time) { return time > Date.now(); }).sort(function (a, b) { return a - b; })[0];
    if (nextBoundary) expiryTimer = setTimeout(renderCampaign, Math.min(nextBoundary - Date.now() + 20, 2147483647));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderCampaign);
  else renderCampaign();
  document.addEventListener('visibilitychange', function () { if (!document.hidden) renderCampaign(); });
  window.addEventListener('pageshow', function (event) { if (event.persisted) renderCampaign(); });
})();

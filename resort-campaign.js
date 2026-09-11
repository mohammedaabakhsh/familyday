// Rendering and expiry only; this never replaces public URLs or starts a booking.
function resortCampaignState(now) {
  var parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  function part(type) { return parts.find(function (p) { return p.type === type; }).value; }
  var day = part('year') + '-' + part('month') + '-' + part('day');
  var statuses = FD_CAMPAIGN.offers.map(function (offer) {
    return day > offer.end ? 'expired' : day < offer.start ? 'upcoming' : 'active';
  });
  return { statuses: statuses, allExpired: statuses.length > 0 && statuses.every(function (status) { return status === 'expired'; }) };
}

(function () {
  var expiryTimer;
  function renderCampaign() {
    var state = resortCampaignState(new Date());
    var banner = document.querySelector('#landing .lh-offer-strip');
    if (banner) {
      banner.querySelector('.lh-offer-title').textContent = FD_CAMPAIGN.name;
      banner.querySelector('.lh-offer-sub').textContent = FD_CAMPAIGN.bannerDescription;
      banner.setAttribute('aria-label', FD_CAMPAIGN.bannerLabel);
      banner.hidden = state.allExpired;
    }
    if (document.body.dataset.campaignPage === 'offer') {
      document.title = FD_CAMPAIGN.metadata.title;
      document.querySelector('meta[name="description"]').content = FD_CAMPAIGN.metadata.description;
      document.querySelector('meta[property="og:title"]').content = FD_CAMPAIGN.metadata.socialTitle;
      document.querySelector('meta[property="og:description"]').content = FD_CAMPAIGN.metadata.socialDescription;
      document.querySelector('.page-heading h1').textContent = FD_CAMPAIGN.name;
      document.querySelector('.occasion').textContent = FD_CAMPAIGN.occasion;
      document.querySelector('.slogan').textContent = FD_CAMPAIGN.slogan;
      var offers = document.querySelector('.offers');
      offers.setAttribute('aria-label', FD_CAMPAIGN.offersLabel);
      offers.innerHTML = FD_CAMPAIGN.offers.map(function (offer, index) {
        var expired = state.statuses[index] === 'expired';
        return '<article class="offer-card" aria-labelledby="' + offer.titleId + '" data-start="' + offer.start + '" data-end="' + offer.end + '">'
          + '<div class="offer-head"><span class="offer-label">' + offer.label + '</span><p class="offer-dates">' + offer.datesHTML + '</p></div>'
          + '<h2 class="offer-title" id="' + offer.titleId + '"><span class="offer-intro">' + offer.intro + '</span><span class="offer-value"><bdi class="amount">' + offer.amount + '</bdi><span class="currency">' + offer.currency + '</span></span></h2>'
          + '<p class="offer-note">' + offer.noteHTML + '</p>'
          + (expired ? '<p class="offer-ended-label">انتهى العرض</p>' : '') + '</article>';
      }).join('');
      document.querySelector('.offer-terms').textContent = FD_CAMPAIGN.terms;
      var booking = document.querySelector('.offer-booking-link');
      booking.textContent = FD_CAMPAIGN.bookingLabel;
      booking.href = 'https://wa.me/' + FD_CAMPAIGN.whatsappNumber + '?text=' + encodeURIComponent(FD_CAMPAIGN.whatsappMessage);
      ['.hero', '.offers', '.offer-terms', '.booking-bar'].forEach(function (selector) {
        document.querySelector(selector).hidden = state.allExpired;
      });
      document.getElementById('offer-expired').hidden = !state.allExpired;
    }
    clearTimeout(expiryTimer);
    var nextBoundary = FD_CAMPAIGN.offers.map(function (offer) {
      return Date.parse(offer.end + 'T23:59:59.999+03:00') + 1;
    }).filter(function (time) { return time > Date.now(); }).sort(function (a, b) { return a - b; })[0];
    if (nextBoundary) expiryTimer = setTimeout(renderCampaign, Math.min(nextBoundary - Date.now() + 20, 2147483647));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderCampaign);
  else renderCampaign();
  document.addEventListener('visibilitychange', function () { if (!document.hidden) renderCampaign(); });
  window.addEventListener('pageshow', function (event) { if (event.persisted) renderCampaign(); });
})();

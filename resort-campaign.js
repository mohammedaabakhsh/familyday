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
  var expiryTimer, selectedOffer = null;
  function updateOfferSelection(campaign, state) {
    var multiple = campaign.offers.length > 1;
    if (selectedOffer !== null && state.statuses[selectedOffer] !== 'active') selectedOffer = null;
    document.querySelectorAll('[data-offer-choice]').forEach(function (button) {
      var chosen = Number(button.dataset.offerChoice) === selectedOffer;
      button.setAttribute('aria-pressed', String(chosen));
      button.textContent = chosen ? 'تم اختيار العرض ✓' : 'اختر هذا العرض';
      button.closest('.offer-card').classList.toggle('is-selected', chosen);
    });
    var booking = document.querySelector('.offer-booking-link');
    var unavailable = multiple && selectedOffer === null;
    booking.setAttribute('aria-disabled', String(unavailable));
    booking.textContent = unavailable ? 'اختر العرض لإكمال الحجز' : campaign.bookingLabel;
    if (unavailable) { booking.removeAttribute('href'); return; }
    var message = campaign.whatsappMessage;
    if (multiple) {
      var offer = campaign.offers[selectedOffer];
      var venue = document.body.dataset.campaignVenue === 'stay' ? 'استراحة يوم العائلة' : 'منتجع يوم العائلة';
      message = 'السلام عليكم، أرغب في الاستفسار عن عرض ' + [offer.intro.replace(/^عرض\s+/, ''), offer.amount, offer.currency].filter(Boolean).join(' ') + ' لدى ' + venue + ' ضمن ' + campaign.name + '.';
    }
    booking.href = 'https://wa.me/' + campaign.whatsappNumber + '?text=' + encodeURIComponent(message);
  }
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
          + (expired ? '<p class="offer-ended-label">انتهى العرض</p>' : '')
          + (campaign.offers.length > 1 ? '<button type="button" class="offer-select" data-offer-choice="' + index + '" aria-pressed="false" aria-label="اختيار ' + offer.intro + ' ' + offer.amount + ' ' + (offer.currency || '') + '"' + (state.statuses[index] !== 'active' ? ' disabled' : '') + '>اختر هذا العرض</button>' : '') + '</article>';
      }).join('');
      document.querySelector('.offer-terms').textContent = campaign.terms;
      offers.querySelectorAll('[data-offer-choice]').forEach(function (button) {
        button.addEventListener('click', function () {
          selectedOffer = Number(button.dataset.offerChoice);
          updateOfferSelection(campaign, resortCampaignState(new Date(), campaign));
        });
      });
      updateOfferSelection(campaign, state);
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

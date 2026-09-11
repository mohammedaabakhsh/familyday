// Edit the active campaign here; both the resort banner and offer page use it.
// Dates are inclusive, in Saudi Arabia time. Existing public links stay fixed.
const FD_CAMPAIGN = {
  name: 'عرض اليوم الوطني',
  occasion: 'اليوم الوطني السعودي 96',
  slogan: 'عزّنا بطبعنا',
  bannerDescription: 'اكتشف العرضين واحجز مباشرة',
  bannerLabel: 'عرض اليوم الوطني - شاهد التفاصيل',
  offersLabel: 'عروض اليوم الوطني',
  terms: 'تطبق الشروط والأحكام',
  bookingLabel: 'احجز العرض عبر واتساب',
  whatsappNumber: '966556156693',
  whatsappMessage: 'السلام عليكم، أرغب في الاستفسار عن عرض اليوم الوطني',
  metadata: {
    title: 'عرض اليوم الوطني | منتجع يوم العائلة',
    description: 'اكتشف عروض اليوم الوطني من منتجع يوم العائلة، تعرّف على التفاصيل وأكمل حجزك مباشرة.',
    socialTitle: 'عروض اليوم الوطني | يوم العائلة',
    socialDescription: 'عرضان مميزان للاحتفال باليوم الوطني. شاهد التفاصيل واحجز مباشرة.'
  },
  offers: [
    {
      titleId: 'offer-first-title', label: 'عرضنا الأول',
      start: '2026-09-22', end: '2026-09-25',
      datesHTML: '<bdi dir="ltr">22–25</bdi> سبتمبر 2026',
      intro: 'خصم على الحجز', amount: 196, currency: 'ريال',
      noteHTML: 'مع <strong>ضيافة اليوم الوطني</strong>'
    },
    {
      titleId: 'offer-second-title', label: 'عرضنا الثاني',
      start: '2026-09-26', end: '2026-09-29',
      datesHTML: '<bdi dir="ltr">26–29</bdi> سبتمبر 2026',
      intro: 'احجز يومًا والثاني بـ', amount: 96, currency: 'ريال',
      noteHTML: 'اليوم الثاني يكون بعد يوم الحجز مباشرة'
    }
  ]
};

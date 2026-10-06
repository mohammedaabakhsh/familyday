// October campaign. Dates are inclusive in Saudi Arabia time.
const FD_CAMPAIGN = {
  "name": "عروض أكتوبر الحصرية",
  "occasion": "أكتوبر 2026",
  "slogan": "",
  "bannerDescription": "اكتشف العروض الثلاثة واحجز مباشرة",
  "bannerLabel": "عروض أكتوبر الحصرية - شاهد التفاصيل",
  "offersLabel": "عروض أكتوبر الحصرية",
  "terms": "تُطبق الشروط والأحكام",
  "bookingLabel": "احجز العرض عبر واتساب",
  "whatsappNumber": "966556156693",
  "whatsappMessage": "السلام عليكم، أرغب في الاستفسار عن عروض أكتوبر الحصرية",
  "metadata": {
    "title": "عروض أكتوبر الحصرية | منتجع يوم العائلة",
    "description": "اكتشف عروض أكتوبر الحصرية من منتجع يوم العائلة: إقامة 10 ساعات بخصم 45%، وخصم 25% منتصف الأسبوع، و10% يوم الخميس أو الجمعة.",
    "socialTitle": "عروض أكتوبر الحصرية | يوم العائلة",
    "socialDescription": "ثلاثة عروض خلال أكتوبر بخصومات 45% و25% و10%. تعرّف على أيام كل عرض واحجز عبر واتساب."
  },
  "offers": [
    {
      "titleId": "offer-first-title",
      "label": "عرضنا الأول",
      "intro": "إقامة 10 ساعات بخصم",
      "amount": "45%",
      "currency": "",
      "noteHTML": "من الأحد إلى الأربعاء.",
      "start": "2026-10-01",
      "end": "2026-10-31",
      "datesHTML": ""
    },
    {
      "titleId": "offer-second-title",
      "label": "عرضنا الثاني",
      "intro": "عرض منتصف الأسبوع بخصم",
      "amount": "25%",
      "currency": "",
      "noteHTML": "من السبت إلى الأربعاء.",
      "start": "2026-10-01",
      "end": "2026-10-31",
      "datesHTML": ""
    },
    {
      "titleId": "offer-third-title",
      "label": "عرضنا الثالث",
      "intro": "عرض نهاية الأسبوع بخصم",
      "amount": "10%",
      "currency": "",
      "noteHTML": "احجز الخميس أو الجمعة.",
      "start": "2026-10-01",
      "end": "2026-10-31",
      "datesHTML": ""
    }
  ]
};

// Venue-specific campaigns; the chalet offer is booking-limited, not date-limited.
const FD_VENUE_CAMPAIGNS = {
  "stay": {
    "name": "عروض أكتوبر الحصرية",
    "occasion": "استراحة يوم العائلة · أكتوبر 2026",
    "slogan": "",
    "bannerDescription": "اكتشف العرضين واحجز مباشرة",
    "bannerLabel": "عروض أكتوبر الحصرية للاستراحة - شاهد التفاصيل",
    "offersLabel": "عروض الاستراحة",
    "terms": "تُطبق الشروط والأحكام",
    "bookingLabel": "احجز العرض عبر واتساب",
    "whatsappNumber": "966556156693",
    "whatsappMessage": "السلام عليكم، أرغب في الاستفسار عن عروض أكتوبر لاستراحة يوم العائلة",
    "metadata": {
      "title": "عروض أكتوبر الحصرية | استراحة يوم العائلة",
      "description": "القسم الأول أو الثاني بـ398 ريال لكل قسم، أو القسم الثاني مع الزحليقة الهوائية الكبيرة بـ598 ريال، من السبت إلى الأربعاء خلال أكتوبر.",
      "socialTitle": "عروض أكتوبر | استراحة يوم العائلة",
      "socialDescription": "القسم الأول أو الثاني بـ398 ريال لكل قسم، والقسم الثاني مع الزحليقة الهوائية الكبيرة بـ598 ريال. من السبت إلى الأربعاء."
    },
    "offers": [
      {
        "titleId": "offer-first-title",
        "label": "عرضنا الأول",
        "intro": "القسم الأول أو الثاني بـ",
        "amount": 398,
        "currency": "ريال لكل قسم",
        "noteHTML": "من السبت إلى الأربعاء.",
        "start": "2026-10-01",
        "end": "2026-10-31",
        "datesHTML": ""
      },
      {
        "titleId": "offer-second-title",
        "label": "عرضنا الثاني",
        "intro": "القسم الثاني مع الزحليقة الهوائية الكبيرة بـ",
        "amount": 598,
        "currency": "ريال",
        "noteHTML": "من السبت إلى الأربعاء.",
        "start": "2026-10-01",
        "end": "2026-10-31",
        "datesHTML": ""
      }
    ]
  },
  "chalet": {
    "name": "تمديد عرض الافتتاح",
    "occasion": "شاليه يوم العائلة",
    "slogan": "",
    "bannerDescription": "خصم 50% لـ20 حجزًا إضافيًا فقط",
    "bannerLabel": "تمديد عرض افتتاح الشاليه - شاهد التفاصيل",
    "offersLabel": "عرض الشاليه",
    "terms": "",
    "bookingLabel": "احجز العرض عبر واتساب",
    "whatsappNumber": "966556156693",
    "whatsappMessage": "السلام عليكم، أرغب في الاستفسار عن تمديد عرض افتتاح شاليه يوم العائلة بخصم 50%",
    "metadata": {
      "title": "تمديد عرض الافتتاح | شاليه يوم العائلة",
      "description": "مددنا عرض افتتاح شاليه يوم العائلة بخصم 50% لـ20 حجزًا إضافيًا فقط. احجز العرض عبر واتساب.",
      "socialTitle": "تمديد عرض الافتتاح | شاليه يوم العائلة",
      "socialDescription": "خصم 50% لـ20 حجزًا إضافيًا فقط."
    },
    "offers": [
      {
        "titleId": "offer-first-title",
        "label": "عرض الافتتاح",
        "intro": "خصم",
        "amount": "50%",
        "currency": "",
        "noteHTML": "لـ20 حجزًا إضافيًا فقط.",
        "start": null,
        "end": null,
        "datesHTML": ""
      }
    ]
  }
};

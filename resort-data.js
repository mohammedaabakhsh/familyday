// Approved resort content. Cards, cabin details and map read these same fields.
// Keep public cabin IDs and booking URLs unchanged. The rest house has its own data.
const data = {
  "resort": {
    "items": [
      {
        "id": 1,
        "livingRoom": "integrated",
        "img": 12,
        "name": "بيت الدوم 1",
        "type": "تجربة فريدة على شكل قبة مع بانيو داخلي وجاكوزي داخل المسبح",
        "suitable": "مثالي للأزواج",
        "rooms": 1,
        "guests": 2,
        "bathroom": 1,
        "badge": "تجربة فريدة",
        "bookUrl": "https://familyday-sa.com/ar/listings/69cea3e03a421f1c8de8cb42",
        "features": {
          "indoor": [
            "غرفة النوم الرئيسية بسرير مزدوج",
            "صالة داخلية مدمجة مع غرفة النوم",
            "بانيو داخلي بغرفة النوم",
            "ركن المطبخ"
          ],
          "outdoor": [
            "جلسات خارجية",
            "شواية"
          ],
          "kitchen": [
            "موقد كهربائي",
            "ميكروويف",
            "ثلاجة",
            "غلاية",
            "ماكينة قهوة",
            "أدوات مطبخ أساسية",
            "ميني بار"
          ],
          "stay": [
            "واي فاي مجاني",
            "تلفزيون ذكي",
            "سماعات داخلية (ساوند بار)"
          ]
        },
        "pool": {
          "label": "مسبح خاص للكبار مع جاكوزي، بمقاس 7 × 4 m",
          "depthCm": 140,
          "depthInLabel": true,
          "facilities": [
            "سرير تشميس داخل المسبح",
            "كراسي تشميس",
            "دش خارجي"
          ],
          "depthUnit": "cm"
        },
        "minibar": true,
        "bath": {
          "summary": "بانيو داخلي",
          "outdoorPrivacy": false
        }
      },
      {
        "id": 2,
        "img": 2,
        "name": "الكوخ الهرمي",
        "type": "تصميم هرمي بطابع خشبي مع بانيو خارجي بخصوصية كاملة",
        "suitable": "مثالي للأزواج",
        "rooms": 1,
        "guests": 2,
        "bathroom": 1,
        "hall": true,
        "badge": null,
        "bookUrl": "https://familyday-sa.com/ar/listings/69cea44391aebf200fef69ea",
        "features": {
          "indoor": [
            "غرفة النوم الرئيسية بسرير مزدوج",
            "صالة داخلية",
            "ركن المطبخ",
            "طاولة طعام"
          ],
          "outdoor": [
            "بانيو خارجي بخصوصية كاملة",
            "جلسات خارجية",
            "شواية"
          ],
          "kitchen": [
            "موقد كهربائي",
            "ميكروويف",
            "ثلاجة",
            "غلاية",
            "ماكينة قهوة",
            "أدوات مطبخ أساسية",
            "ميني بار"
          ],
          "stay": [
            "واي فاي مجاني",
            "تلفزيون ذكي",
            "سماعات داخلية (ساوند بار)"
          ]
        },
        "pool": {
          "label": "مسبح خاص للكبار، بمقاس 4 × 4 m",
          "depthCm": 140,
          "facilities": [
            "كراسي تشميس",
            "دش خارجي"
          ],
          "depthInLabel": true,
          "depthUnit": "cm"
        },
        "minibar": true,
        "bath": {
          "summary": "بانيو خارجي",
          "outdoorPrivacy": true,
          "privacyInLabel": true
        }
      },
      {
        "id": 3,
        "img": 1,
        "name": "الكوخ الكلاسيكي",
        "type": "يتميز بأسلوبه الحديث والكلاسيكي",
        "suitable": "مناسب للعائلات",
        "rooms": 1,
        "guests": 15,
        "bathroom": 1,
        "hall": true,
        "badge": null,
        "bookUrl": "https://familyday-sa.com/ar/listings/69cea4d091aebf200fef69eb",
        "features": {
          "indoor": [
            "غرفة النوم الرئيسية بسرير مزدوج",
            "صالة داخلية",
            "ركن مطبخ",
            "طاولة طعام"
          ],
          "outdoor": [
            "جلسات خارجية",
            "شواية"
          ],
          "kitchen": [
            "موقد كهربائي",
            "ميكروويف",
            "ثلاجة",
            "غلاية",
            "ماكينة قهوة",
            "أدوات مطبخ أساسية",
            "ميني بار"
          ],
          "stay": [
            "واي فاي مجاني",
            "تلفزيون ذكي",
            "سماعات داخلية (ساوند بار)"
          ]
        },
        "pool": {
          "label": "مسبح خاص للكبار، بمقاس 7 × 4 م",
          "depthCm": 140,
          "facilities": [
            "كراسي تشميس",
            "دش خارجي"
          ],
          "depthInLabel": true
        },
        "minibar": true,
        "bath": {
          "summary": "",
          "outdoorPrivacy": false
        }
      },
      {
        "id": 4,
        "img": 5,
        "name": "البيت اليوناني 1",
        "type": "مزيج بين التراث القديم والبساطة الحديثة",
        "suitable": "مناسب للعائلات",
        "rooms": 2,
        "guests": 10,
        "bathroom": 2,
        "hall": true,
        "bathroomDetails": ["2 حمام: حمام خاص داخل غرفة النوم الرئيسية – حمام مشترك"],
        "badge": null,
        "bookUrl": "https://familyday-sa.com/ar/listings/69cea0ecc17a7072098dbd38",
        "features": {
          "indoor": [
            "غرفة النوم الرئيسية بسرير مزدوج",
            "غرفة النوم الثانية بسريرين مفردين",
            "صالة داخلية",
            "ركن المطبخ",
            "طاولة طعام"
          ],
          "outdoor": [
            "جلسات خارجية",
            "شواية"
          ],
          "kitchen": [
            "موقد كهربائي",
            "ميكروويف",
            "ثلاجة",
            "غلاية",
            "ماكينة قهوة",
            "أدوات مطبخ أساسية",
            "ميني بار"
          ],
          "stay": [
            "واي فاي مجاني",
            "تلفزيون ذكي",
            "سماعات داخلية (ساوند بار)"
          ]
        },
        "pool": {
          "label": "مسبح خاص للكبار، بمقاس 7 × 4 m",
          "depthCm": 140,
          "facilities": [
            "كراسي تشميس",
            "دش خارجي"
          ],
          "depthInLabel": true,
          "depthUnit": "cm"
        },
        "minibar": true,
        "bath": {
          "summary": "",
          "outdoorPrivacy": false
        }
      },
      {
        "id": 5,
        "img": 4,
        "name": "كوخ بالم بيتش",
        "type": "طابع أفريقي يجمع بين الخشب والبامبو والقش",
        "suitable": "مناسب للعائلات",
        "rooms": 2,
        "guests": 10,
        "bathroom": 2,
        "hall": true,
        "bathroomDetails": ["2 حمام: حمام خاص داخل غرفة النوم الرئيسية – حمام مشترك"],
        "badge": null,
        "bookUrl": "https://familyday-sa.com/ar/listings/69cea2c891aebf200fef69e6",
        "features": {
          "indoor": [
            "غرفة النوم الرئيسية بسرير مزدوج",
            "غرفة النوم الثانية بسريرين مفردين",
            "صالة داخلية",
            "ركن مطبخ",
            "طاولة طعام"
          ],
          "outdoor": [
            "جلسات خارجية",
            "شواية"
          ],
          "kitchen": [
            "موقد كهربائي",
            "ميكروويف",
            "ثلاجة",
            "غلاية",
            "ماكينة قهوة",
            "أدوات مطبخ أساسية",
            "ميني بار"
          ],
          "stay": [
            "واي فاي مجاني",
            "تلفزيون ذكي",
            "سماعات داخلية (ساوند بار)"
          ]
        },
        "pool": {
          "label": "مسبح خاص للكبار، بمقاس 7 × 4 م",
          "depthCm": 140,
          "facilities": [
            "كراسي تشميس",
            "دش خارجي"
          ],
          "depthInLabel": true
        },
        "minibar": true,
        "bath": {
          "summary": "",
          "outdoorPrivacy": false
        }
      },
      {
        "id": 6,
        "img": 0,
        "name": "الكوخ البوهيمي",
        "type": "طابع بوهيمي بسيط مستوحى من الطبيعة",
        "suitable": "مناسب للعائلات",
        "rooms": 2,
        "guests": 10,
        "bathroom": 2,
        "hall": true,
        "bathroomDetails": ["2 حمام: حمام خاص داخل غرفة النوم الرئيسية – حمام مشترك"],
        "badge": null,
        "bookUrl": "https://familyday-sa.com/ar/listings/69cea392c17a7072098dbd3b",
        "features": {
          "indoor": [
            "غرفة النوم الرئيسية بسرير مزدوج",
            "غرفة النوم الثانية بسريرين مفردين",
            "صالة داخلية",
            "ركن مطبخ",
            "طاولة طعام"
          ],
          "outdoor": [
            "جلسات خارجية",
            "شواية"
          ],
          "kitchen": [
            "موقد كهربائي",
            "ميكروويف",
            "ثلاجة",
            "غلاية",
            "ماكينة قهوة",
            "أدوات مطبخ أساسية",
            "ميني بار"
          ],
          "stay": [
            "واي فاي مجاني",
            "تلفزيون ذكي",
            "سماعات داخلية (ساوند بار)"
          ]
        },
        "pool": {
          "label": "مسبح خاص للكبار، بمقاس 7 × 4 م",
          "depthCm": 140,
          "facilities": [
            "كراسي تشميس",
            "دش خارجي"
          ],
          "depthInLabel": true
        },
        "minibar": true,
        "bath": {
          "summary": "",
          "outdoorPrivacy": false
        }
      },
      {
        "id": 7,
        "img": 1,
        "name": "الكوخ الفرنسي",
        "type": "كوخ خشبي بطراز فرنسي يتميز بالأناقة والفخامة",
        "suitable": "مناسب للعائلات",
        "rooms": 2,
        "guests": 10,
        "bathroom": 2,
        "hall": true,
        "bathroomDetails": ["2 حمام: حمام خاص داخل غرفة النوم الرئيسية – حمام مشترك"],
        "badge": null,
        "bookUrl": "https://familyday-sa.com/ar/listings/69cea2f391aebf200fef69e7",
        "features": {
          "indoor": [
            "غرفة النوم الرئيسية بسرير مزدوج",
            "غرفة النوم الثانية بسريرين مفردين",
            "صالة داخلية",
            "ركن مطبخ",
            "طاولة طعام"
          ],
          "outdoor": [
            "جلسات خارجية",
            "شواية"
          ],
          "kitchen": [
            "موقد كهربائي",
            "ميكروويف",
            "ثلاجة",
            "غلاية",
            "ماكينة قهوة",
            "أدوات مطبخ أساسية",
            "ميني بار"
          ],
          "stay": [
            "واي فاي مجاني",
            "تلفزيون ذكي",
            "سماعات داخلية (ساوند بار)"
          ]
        },
        "pool": {
          "label": "مسبح خاص للكبار، بمقاس 7 × 4 م",
          "depthCm": 140,
          "facilities": [
            "كراسي تشميس",
            "دش خارجي"
          ],
          "depthInLabel": true
        },
        "minibar": true,
        "bath": {
          "summary": "",
          "outdoorPrivacy": false
        }
      },
      {
        "id": 8,
        "img": 2,
        "name": "الكوخ الريفي",
        "type": "صُمم على الطراز الريفي الأوروبي",
        "suitable": "مناسب للعائلات",
        "rooms": 2,
        "guests": 10,
        "bathroom": 2,
        "hall": true,
        "bathroomDetails": ["2 حمام: حمام خاص داخل غرفة النوم الرئيسية – حمام مشترك"],
        "badge": null,
        "bookUrl": "https://familyday-sa.com/ar/listings/69cea32191aebf200fef69e8",
        "features": {
          "indoor": [
            "غرفة النوم الرئيسية بسرير مزدوج",
            "غرفة النوم الثانية بسريرين مفردين",
            "صالة داخلية",
            "ركن مطبخ",
            "طاولة طعام"
          ],
          "outdoor": [
            "جلسات خارجية",
            "شواية"
          ],
          "kitchen": [
            "موقد كهربائي",
            "ميكروويف",
            "ثلاجة",
            "غلاية",
            "ماكينة قهوة",
            "أدوات مطبخ أساسية",
            "ميني بار"
          ],
          "stay": [
            "واي فاي مجاني",
            "تلفزيون ذكي",
            "سماعات داخلية (ساوند بار)"
          ]
        },
        "pool": {
          "label": "مسبح خاص للكبار، بمقاس 7 × 4 م",
          "depthCm": 140,
          "facilities": [
            "كراسي تشميس",
            "دش خارجي"
          ],
          "depthInLabel": true
        },
        "minibar": true,
        "bath": {
          "summary": "",
          "outdoorPrivacy": false
        }
      },
      {
        "id": 9,
        "img": 3,
        "name": "كوخ رويال",
        "type": "أجواء ريفية ومساحات واسعة لجمعات العائلة",
        "suitable": "مناسب للعائلات",
        "rooms": 2,
        "guests": 20,
        "bathroom": 2,
        "hall": true,
        "bathroomDetails": ["2 حمام: حمام خاص داخل غرفة النوم الرئيسية – حمام مشترك"],
        "badge": null,
        "bookUrl": "https://familyday-sa.com/ar/listings/69cea50991aebf200fef69ec",
        "features": {
          "indoor": [
            "غرفة النوم الرئيسية بسرير مزدوج",
            "غرفة النوم الثانية بسريرين مفردين",
            "صالة داخلية",
            "ركن مطبخ",
            "طاولة طعام"
          ],
          "outdoor": [
            "جلسات خارجية",
            "شواية"
          ],
          "kitchen": [
            "موقد كهربائي",
            "ميكروويف",
            "ثلاجة",
            "غلاية",
            "ماكينة قهوة",
            "أدوات مطبخ أساسية",
            "ميني بار"
          ],
          "stay": [
            "واي فاي مجاني",
            "تلفزيون ذكي",
            "سماعات داخلية (ساوند بار)"
          ]
        },
        "pool": {
          "label": "مسبح خاص للكبار، بمقاس 7 × 4 م",
          "depthCm": 140,
          "facilities": [
            "كراسي تشميس",
            "دش خارجي"
          ],
          "depthInLabel": true
        },
        "minibar": true,
        "bath": {
          "summary": "",
          "outdoorPrivacy": false
        }
      },
      {
        "id": 10,
        "img": 4,
        "name": "البيت البانورامي",
        "type": "واجهات زجاجية بانورامية تطل على حديقتك الخاصة والمسبح",
        "suitable": "مناسب للعائلات",
        "rooms": 2,
        "guests": 15,
        "bathroom": 2,
        "hall": true,
        "bathroomDetails": ["2 حمام: حمام خاص داخل غرفة النوم الرئيسية – حمام مشترك"],
        "badge": null,
        "bookUrl": "https://familyday-sa.com/ar/listings/69cea36a5123111b7e72de33",
        "features": {
          "indoor": [
            "غرفة النوم الرئيسية بسرير مزدوج",
            "غرفة النوم الثانية بسريرين مفردين",
            "بانيو مع جاكوزي بغرفة النوم",
            "صالة داخلية",
            "ركن مطبخ",
            "طاولة طعام"
          ],
          "outdoor": [
            "جلسات خارجية",
            "شواية"
          ],
          "kitchen": [
            "موقد كهربائي",
            "ميكروويف",
            "ثلاجة",
            "غلاية",
            "ماكينة قهوة",
            "أدوات مطبخ أساسية",
            "ميني بار"
          ],
          "stay": [
            "واي فاي مجاني",
            "تلفزيون ذكي",
            "سماعات داخلية (ساوند بار)"
          ]
        },
        "pool": {
          "label": "مسبح خاص للكبار، بمقاس 7 × 4 م",
          "depthCm": 140,
          "facilities": [
            "كراسي تشميس",
            "دش خارجي"
          ],
          "depthInLabel": true
        },
        "minibar": true,
        "bath": {
          "summary": "جاكوزي داخلي",
          "outdoorPrivacy": false
        }
      },
      {
        "id": 11,
        "img": 4,
        "name": "الحديقة المشتركة",
        "type": "منطقة مشتركة مجهزة للعائلات",
        "suitable": "مناسب للجميع",
        "rooms": 0,
        "guests": 0,
        "bathroom": 0,
        "hall": false,
        "badge": "مشترك",
        "tags": [
          "ألعاب أطفال متنوعة",
          "|",
          "شاشة عرض مشتركة للأطفال",
          "|",
          "جلسات خارجية"
        ]
      }
    ]
  }
};

// Separate physical units retain the owner-confirmed shared specifications.
(function () {
  [
    {sourceId: 1, id: 12, name: 'بيت الدوم 2', bookUrl: 'https://familyday-sa.com/ar/listings/69cea40091aebf200fef69e9'},
    {sourceId: 4, id: 13, name: 'البيت اليوناني 2', bookUrl: 'https://familyday-sa.com/ar/listings/69cea28b4b817e1124e35e57'}
  ].forEach(function (unit) {
    var index = data.resort.items.findIndex(function (item) { return item.id === unit.sourceId; });
    var copy = Object.assign({}, data.resort.items[index], {id: unit.id, name: unit.name, bookUrl: unit.bookUrl});
    data.resort.items.splice(index + 1, 0, copy);
  });
})();

function resortGuestText(count) {
  return count === 2 ? 'حتى ضيفين' : 'حتى ' + count + (count <= 10 ? ' ضيوف' : ' ضيفًا');
}
function resortRoomText(count) {
  return count === 1 ? 'غرفة واحدة' : count === 2 ? 'غرفتان' : count + ' غرف';
}
function resortBathroomText(count) {
  return count === 1 ? 'حمام واحد' : count === 2 ? 'حمامان' : count + ' حمامات';
}

// Keep measurement pairs in their approved order inside Arabic descriptions.
function localizeSpecificationUnits(text) {
  return text.replace(/\bcm\b/g, 'سم').replace(/\bm\b/g, 'م');
}
function formatSpecificationText(text) {
  text = localizeSpecificationUnits(text);
  if (!/\d+\s*×\s*\d+|\d+\s*سم/.test(text)) return text;
  return '<span>' + text.replace(/(\d+\s*×\s*\d+(?:\s*م)?|\d+\s*سم)/g, '<bdi dir="ltr">$1</bdi>') + '</span>';
}

// Shared, owner-approved map geometry and imagery. Both the resort map and guide read this file.
window.FD_RESORT_MAP_DATA = {
  image: "imgs/resort-map-v6-garden.png",
  locations: [
    // Owner-confirmed plot directly above the two domes on the left.
    { key: 'pyramid', cabinId: 2, x: 25.359, y: 35.008, labelSide: 'left', labelRightX: 16,
      footprint: [[19.856, 25.518], [41.308, 25.518], [41.308, 39.394], [19.856, 39.394]] },
    { key: 'dome-upper', cabinId: 12, x: 25.598, y: 44.896, labelSide: 'left', labelRightX: 16,
      footprint: [[19.856, 40.112], [41.308, 40.112], [41.308, 50.159], [19.537, 50.159]] },
    { key: 'dome-lower', cabinId: 1, x: 25.598, y: 56.140, labelSide: 'left', labelRightX: 16,
      footprint: [[19.537, 50.957], [41.308, 50.957], [41.308, 61.643], [19.139, 61.643]] },
    // Owner's corrected aerial reference: smaller Classic above, larger Royal below.
    { key: 'classic', cabinId: 3, x: 59.091, y: 21.292, labelSide: 'right', labelLeftX: 70,
      footprint: [[42.982, 24.801], [58.293, 9.968], [67.145, 24.003], [59.490, 30.144], [60.128, 32.775], [55.582, 35.965], [47.368, 24.482]] },
    { key: 'royal', cabinId: 9, x: 67.624, y: 35.327, labelSide: 'right', labelLeftX: 76,
      footprint: [[56.300, 36.683], [60.925, 33.333], [60.207, 30.542], [67.863, 25.040], [81.260, 44.338], [68.581, 53.828]] },
    // Owner's plan confirms this bottom row from left to right.
    { key: 'bohemian', cabinId: 6, x: 24.083, y: 68.581, labelSide: 'left', labelRightX: 15,
      footprint: [[19.139, 62.520], [29.984, 62.520], [29.984, 87.719], [18.900, 87.719]] },
    { key: 'panoramic', cabinId: 10, x: 35.885, y: 68.820, labelSide: 'bottom', labelX: 35, labelY: 95,
      footprint: [[30.781, 62.600], [41.467, 62.600], [41.467, 87.719], [30.781, 87.719]] },
    { key: 'rural', cabinId: 8, x: 47.209, y: 69.059, labelSide: 'bottom', labelX: 49, labelY: 95,
      footprint: [[42.584, 64.992], [47.049, 63.876], [51.754, 64.912], [51.754, 87.719], [42.584, 87.719]] },
    { key: 'french', cabinId: 7, x: 57.257, y: 70.255, labelSide: 'bottom', labelX: 61, labelY: 95,
      footprint: [[52.632, 66.108], [57.097, 64.992], [61.962, 67.703], [61.962, 87.719], [52.632, 87.719]] },
    // Owner-confirmed right-hand row: Greek 1, Greek 2, then Palm Beach.
    { key: 'greek-one', cabinId: 4,
      x: 82.775, y: 57.576, labelSide: 'offset', labelX: 94, labelY: 76, leaderBend: [95, 70],
      footprint: [[74.801, 51.435], [82.536, 46.491], [95.774, 66.986], [88.596, 72.010]] },
    { key: 'greek-two', cabinId: 13,
      x: 75.917, y: 62.440, labelSide: 'offset', labelX: 88, labelY: 83, leaderBend: [89, 77],
      footprint: [[67.863, 57.177], [74.083, 52.233], [87.879, 72.727], [80.861, 76.954]] },
    { key: 'palm-beach', cabinId: 5, x: 68.501, y: 68.581,
      labelSide: 'offset', labelX: 80, labelY: 89, leaderBend: [82, 84],
      footprint: [[59.250, 63.238], [67.145, 57.656], [80.144, 77.592], [73.365, 82.217]] },
    // The central shared garden uses the same details as its existing site card.
    { key: 'shared-garden', cabinId: 11, kind: 'shared', x: 50.638, y: 46.013,
      labelSide: 'offset', labelX: 35, labelY: 8, leaderBend: [43, 24],
      footprint: [[43.062, 27.751], [46.890, 26.555], [66.826, 55.821], [57.097, 64.274], [43.062, 63.158]] }
  ],
  cardPhotos: {
    1: 'imgs/dome_2.webp',
    12: 'imgs/dome_2.webp',
    2: 'imgs/harami_2.webp',
    3: 'imgs/classic_2.webp',
    4: 'imgs/greek_3.webp',
    13: 'imgs/greek_3.webp',
    5: 'imgs/palm_2.webp',
    6: 'imgs/boho_2.webp',
    7: 'imgs/french_3.webp',
    8: 'imgs/rural_3.webp',
    9: 'imgs/royal_2.webp',
    10: 'imgs/panorama_2.webp'
  }
};

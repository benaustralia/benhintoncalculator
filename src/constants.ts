export const DATA = {
  "context": {
    "location": "Victoria, Australia",
    "year": 2026,
    "source": "Victorian Government Schools Calendar"
  },
  "term_dates": {
    "term_1": {
      "start": "2026-01-28",
      "end": "2026-04-02",
      "weeks": 10,
      "note": "Starts Wed"
    },
    "term_2": {
      "start": "2026-04-20",
      "end": "2026-06-26",
      "weeks": 10,
      "note": "Anzac Day + Kings Bday"
    },
    "term_3": {
      "start": "2026-07-13",
      "end": "2026-09-18",
      "weeks": 10
    },
    "term_4": {
      "start": "2026-10-05",
      "end": "2026-12-18",
      "weeks": 11,
      "note": "Melb Cup"
    }
  },
  "public_holidays_excluded": [
    { "name": "Labor Day", "date": "2026-03-09", "day": "Monday", "term": 1 },
    { "name": "Anzac Day", "date": "2026-04-25", "day": "Saturday", "term": 2 },
    { "name": "King's Birthday", "date": "2026-06-08", "day": "Monday", "term": 2 },
    { "name": "Melbourne Cup", "date": "2026-11-03", "day": "Tuesday", "term": 4 }
  ],
  "levels": {
    "primary": {
      "label": "Primary (Prep–6)",
      "rates": { "new": 85, "loyalty": 75 }
    },
    "junior_secondary": {
      "label": "Junior Secondary (7–10)",
      "rates": { "new": 98, "loyalty": 82 }
    },
    "senior_secondary": {
      "label": "Senior Secondary (11–12)",
      "rates": { "new": 120, "loyalty": 95 }
    }
  },
  "terms": {
    "1": { "sessions": 10, "discount": 0 },
    "2": { "sessions": 20, "discount": 100 },
    "4": { "sessions": 40, "discount": 300 }
  },
  "durations": {
    "45_min": 0.75,
    "1_hour": 1.0,
    "1.5_hours": 1.5,
    "2_hours": 2.0
  },
  // Legacy pricing_tiers for backward compatibility (can be removed after migration)
  "pricing_tiers": {
    "primary": {
      "label": "Primary (Prep–6)",
      "hourly_rate_new": 85,
      "hourly_rate_loyalty": 75,
      "packages_new": { "1_term": 850, "2_terms": 1600, "4_terms": 3100 },
      "packages_loyalty": { "1_term": 750, "2_terms": 1400, "4_terms": 2700 }
    },
    "junior_secondary": {
      "label": "Junior Sec (7–10)",
      "hourly_rate_new": 98,
      "hourly_rate_loyalty": 82,
      "packages_new": { "1_term": 980, "2_terms": 1860, "4_terms": 3620 },
      "packages_loyalty": { "1_term": 820, "2_terms": 1540, "4_terms": 2980 }
    },
    "senior_secondary": {
      "label": "Senior Sec (11–12)",
      "hourly_rate_new": 120,
      "hourly_rate_loyalty": 95,
      "packages_new": { "1_term": 1200, "2_terms": 2300, "4_terms": 4500 },
      "packages_loyalty": { "1_term": 950, "2_terms": 1800, "4_terms": 3500 }
    }
  },
  "multipliers": {
    "45_min": 0.75,
    "1_hour": 1.0,
    "1.5_hours": 1.5,
    "2_hours": 2.0
  }
} as const;

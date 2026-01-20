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
      "note": "Starts on a Wednesday"
    },
    "term_2": {
      "start": "2026-04-20",
      "end": "2026-06-26",
      "weeks": 10,
      "note": "Includes Anzac Day (Sat) and King's Birthday (Mon)"
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
      "note": "Includes Melbourne Cup (Tue)"
    }
  },
  "public_holidays_excluded": [
    { "name": "Labor Day", "date": "2026-03-09", "day": "Monday", "term": 1 },
    { "name": "Anzac Day", "date": "2026-04-25", "day": "Saturday", "term": 2 },
    { "name": "King's Birthday", "date": "2026-06-08", "day": "Monday", "term": 2 },
    { "name": "Melbourne Cup", "date": "2026-11-03", "day": "Tuesday", "term": 4 }
  ],
  "pricing": {
    "loyalty": {
      "1_term_10_weeks": 820,
      "2_terms_20_weeks": 1560,
      "4_terms_40_weeks": 3000
    },
    "new_client": {
      "1_term_10_weeks": 1050,
      "2_terms_20_weeks": 1900,
      "4_terms_40_weeks": 3600
    },
    "multipliers": {
      "45_mins": 0.75,
      "1_hour": 1.0,
      "1.5_hours": 1.5,
      "2_hours": 2.0
    }
  }
} as const;

/**
 * KiezVet – practice data (single source of truth).
 * Edit this file to change phone numbers, opening hours and the cat consultation.
 * Everything marked [PLATZHALTER] must be replaced before going live.
 */
window.KIEZVET = {
  timeZone: "Europe/Berlin",

  phone: {
    display: "030 · [XXX XX XX]",      // [PLATZHALTER] shown on the page
    tel: "+4930000000"                // [PLATZHALTER] used for tel: links, digits only
  },
  urbanvet: {
    display: "[UrbanVet-Nummer]",     // [PLATZHALTER]
    tel: "+4930000001",               // [PLATZHALTER]
    url: "https://urbanvet.de"
  },
  email: "praxis@kiezvet.de",         // [PLATZHALTER] check mailbox exists
  address: "[Bergmannstraße XX], 10961 Berlin",

  /**
   * Opening hours per weekday (0 = Sunday … 6 = Saturday).
   * null = closed. Times are 24h "HH:MM" in Berlin time.  [PLATZHALTER]
   */
  hours: {
    1: ["08:00", "19:00"],
    2: ["08:00", "19:00"],
    3: ["08:00", "19:00"],
    4: ["08:00", "19:00"],
    5: ["08:00", "17:00"],
    6: ["10:00", "13:00"],
    0: null
  },

  /** Katzen-Sprechstunde: only cats in the practice during these times. [PLATZHALTER] */
  catHours: {
    2: ["14:00", "16:00"],
    4: ["14:00", "16:00"]
  },

  /** Length of one online booking slot in minutes. */
  slotMinutes: 30
};

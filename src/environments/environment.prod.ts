export const environment = {
  production: true,
  SITE_URL: 'http://itjob.falicrea.com'
};

export const dateTimePickerFr = {
  days: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
  daysShort: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
  daysMin: ["d", "l", "ma", "me", "j", "v", "s"],
  months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  monthsShort: ["janv.", "févr.", "mars", "avril", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
  today: "Aujourd'hui",
  monthsTitle: "Mois",
  meridiem: '',
  clear: "Effacer",
  weekStart: 1,
  format: "dd/mm/yyyy"
};

export const config = {
  jwtAuthUrl: 'http://itjob.falicrea.com/wp-json/jwt-auth/v1/token',
  wpApi: 'http://itjob.falicrea.com/wp-json/wp/v2',
  itApi: 'http://itjob.falicrea.com/wp-json/it-api'
};

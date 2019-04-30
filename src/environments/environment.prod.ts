export const environment = {
  production: true,
  SITE_URL: 'https://www.itjobmada.com'
};

export const tinyMceSettings = {
  skin_url: '/assets/tinymce/skins/lightgray',
  inline: false,
  statusbar: false,
  browser_spellcheck: true,
  height: 320,
  plugins: '',
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
  jwtAuthUrl: 'https://www.itjobmada.com/wp-json/jwt-auth/v1/token',
  apiEndpoint: 'https://www.itjobmada.com/wp-json',
  wpApi: 'https://www.itjobmada.com/wp-json/wp/v2',
  itApi: 'https://www.itjobmada.com/wp-json/it-api',
  api: 'https://www.itjobmada.com/wp-json/api'
};

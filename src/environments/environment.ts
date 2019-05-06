// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  SITE_URL: 'itjob.local.mg'
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

export const tinyMceSettings = {
  skin_url: '/assets/tinymce/skins/lightgray',
  inline: false,
  statusbar: false,
  browser_spellcheck: true,
  height: 320,
  plugins: '',
};

export const config = {
  jwtAuthUrl: 'http://itjob.local.mg/wp-json/jwt-auth/v1/token',
  apiEndpoint: 'http://itjob.local.mg/wp-json',
  wpApi: 'http://itjob.local.mg/wp-json/wp/v2',
  itApi: 'http://itjob.local.mg/wp-json/it-api',
  api: 'http://itjob.local.mg/wp-json/api'
};

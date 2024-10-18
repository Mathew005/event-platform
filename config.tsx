const config = {
  api: {
    host: 'http://localhost/cfc/',
    routes: {
      auth: 'auth.php',
      event_create: 'event_create.php',
      participant: 'participant.php',
      organizer: 'organizer.php',
      save_fetch: 'save_fetch.php',
    },
  event_img: 'files/imgs/',
  },
  db: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cfc',
  },
  
};

export default config;

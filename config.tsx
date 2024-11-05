const config = {
  api: {
    // host: `http://${process.env.REACT_APP_API_IP}/cfc/`,
    host: `http://localhost/cfc/`,
    routes: {
      auth: 'auth.php',
      save_fetch: 'save_fetch.php',
      set: 'set.php',
      upload: 'upload.php',
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

const config = {
    api: {
      host: 'http://localhost/cfc/',
      routes: {
        auth: 'auth.php',
        event_create: 'event_create.php'
      },
    },
    db: {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cfc',
    },
  };
  
  export default config;
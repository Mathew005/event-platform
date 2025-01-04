const config = {
  api: {
    // host: `http://${process.env.REACT_APP_API_IP}/cfc/`,
    //host: `http://192.168.0.170/cfc/`,
    host: `http://localhost/cfc/`,
    routes: {
      auth: 'auth.php',
      save_fetch: 'save_fetch.php',
      set: 'set.php',
      get: 'get.php',
      upload: 'upload.php',
      landing: 'landing_page.php',
      bookmark: 'bookmark.php',
      event_program_view: 'event_program_view.php',
      event_overview: 'event_overview.php',
      delete: 'delete.php',
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

const fetchData = async (table: string, id: string, columnIdentifier: string, columnTargets: string[]) => {
  try {
    const response = await axios.get(`${config.api.host}${config.api.routes.save_fetch}`, {
      params: { table, id, columnIdentifier, columnTargets: columnTargets.join(',') }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}
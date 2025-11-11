import Config from '#config/config.js';


const {SERVER_URL} = new Config().getConfig()

fetch(`${SERVER_URL}/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tx: 2620,
    params: {
      profile: 'participante'
    }
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => {
    console.error('Error:', error);
  });

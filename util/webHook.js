'use strict';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.config_url = async () => {
  try {
    const PORT = 3000;
    const { stdout } = await exec('curl -s http://localhost:4040/api/tunnels');
    const result_obj = JSON.parse(stdout);
    const urls = result_obj.tunnels.filter((element) => {
      const array = Object.values(element).filter(
        (key_element) => key_element === 'https'
      );
      if (array.length) return true;
    });
    return {
      PORT,
      url: urls[0].public_url,
    };
  } catch (err) {
    console.log('config_url', err);
  }
};

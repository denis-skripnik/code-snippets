const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
(async function() {
  async function launchChrome() {
    return await chromeLauncher.launch({
      chromeFlags: [
        '--disable-gpu',
        '--headless'
      ]
    });
  }
  const chrome = await launchChrome();
  const protocol = await CDP({
    port: chrome.port
  });
  // ЗДЕСЬ ВСЕ ПОСЛЕДУЮЩИЕ ПРИМЕРЫ КОДА
})();
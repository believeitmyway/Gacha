const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const itemsHtml = fs.readFileSync('items.js', 'utf8');
const appHtml = fs.readFileSync('app.js', 'utf8');

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="app"></div><div id="modal-container"></div></body></html>`, {
  url: "http://localhost/",
  runScripts: "dangerously",
});

dom.window.lucide = { createIcons: () => {} };
dom.window.eval('window.requestAnimationFrame = (cb) => setTimeout(cb, 0);');
dom.window.eval('window.AudioContext = function() { return { createGain: () => ({ connect: () => {}, gain: { value: 1, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }), destination: {}, createOscillator: () => ({ type: "sine", connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }) }; };');

const script1 = dom.window.document.createElement("script");
script1.textContent = itemsHtml;
dom.window.document.body.appendChild(script1);

const script2 = dom.window.document.createElement("script");
script2.textContent = appHtml;
dom.window.document.body.appendChild(script2);

setTimeout(() => {
    dom.window.eval('register("TestUser", "password")');
    dom.window.eval('login("TestUser", "password")');
    setTimeout(() => {
        dom.window.eval('state.currentUser.gold = 100000;');
        dom.window.eval('state.view = "gacha"; render();');

        const gachaScene = dom.window.document.querySelector('#app').innerHTML;
        if(gachaScene.includes('10回引く') && gachaScene.includes('100回引く')) {
            console.log('Buttons are rendered successfully.');
        } else {
            console.log('Buttons missing');
        }

        // Find a valid gacha pool
        const firstGachaType = dom.window.eval('state.masterGachas[0].id');
        console.log("Using Gacha Type: " + firstGachaType);

        dom.window.eval(`startGacha('${firstGachaType}', 10)`);
        setTimeout(() => {
            const modal = dom.window.document.querySelector('#modal-container').innerHTML;
            if (modal.includes('召喚結果') && modal.includes('閉じる')) {
                console.log('Multi-pull result rendered successfully.');
            } else {
                console.log('Multi-pull result missing.');
            }
            process.exit(0);
        }, 3000);
    }, 2000);
}, 100);

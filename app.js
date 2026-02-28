// app.js - Main Logic

// --- State Management ---

const INITIAL_GOLD = 500;
const GACHA_COST = 100;
const STORAGE_KEY = 'gacha_rpg_vanilla';
const STORAGE_KEY_MASTER = 'gacha_rpg_master_items';
const STORAGE_KEY_GACHAS = 'gacha_rpg_master_gachas';

// Simple State
let state = {
    users: [],
    currentUser: null,
    view: 'login', // 'login', 'dashboard', 'gacha'
    modal: null, // 'parentMode', 'transfer', 'gachaResult'
    masterItems: { weapon: [], material: [], gold: [] },
    masterGachas: [],
    soundSettings: {
        login: '',
        transfer: '',
        gachaPull: '',
        resultLow: '',
        resultMid: '',
        resultHigh: ''
    }
};

const STORAGE_KEY_SOUNDS = 'gacha_rpg_sounds';

// --- Audio Utilities ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
}

function playTone(freq, type, duration, vol = 0.5) {
    if (!audioCtx) initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSound(type) {
    initAudio();

    // Check if custom URL exists
    const url = state.soundSettings[type];
    if (url && url.trim() !== '') {
        const audio = new Audio(url);
        audio.play().catch(e => console.error("Error playing custom audio:", e));
        return;
    }

    // Default synthesizers
    switch(type) {
        case 'login':
            // Deep boom (Door opening)
            playTone(100, 'square', 0.5, 0.8);
            setTimeout(() => playTone(80, 'square', 1.0, 0.8), 200);
            setTimeout(() => playTone(50, 'sine', 2.0, 1.0), 400);
            break;
        case 'transfer':
            // Clink clink (Coins)
            playTone(1200, 'sine', 0.1, 0.3);
            setTimeout(() => playTone(1500, 'sine', 0.1, 0.3), 100);
            setTimeout(() => playTone(2000, 'sine', 0.3, 0.4), 200);
            break;
        case 'gachaPull':
            // Intense Charging up
            if(audioCtx) {
                // Main rise
                const osc1 = audioCtx.createOscillator();
                const gain1 = audioCtx.createGain();
                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(50, audioCtx.currentTime);
                osc1.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 2.0);
                gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gain1.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 2.0);
                osc1.connect(gain1);
                gain1.connect(audioCtx.destination);
                osc1.start();
                osc1.stop(audioCtx.currentTime + 2.0);

                // Sub rumble
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(40, audioCtx.currentTime);
                osc2.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 2.0);
                gain2.gain.setValueAtTime(0.4, audioCtx.currentTime);
                gain2.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 2.0);
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                osc2.start();
                osc2.stop(audioCtx.currentTime + 2.0);
            }
            break;
        case 'resultLow':
            // Brighter pop
            playTone(400, 'sine', 0.1, 0.6);
            setTimeout(() => playTone(600, 'sine', 0.2, 0.6), 100);
            break;
        case 'resultMid':
            // Happy arpeggio
            playTone(440, 'triangle', 0.1, 0.6);
            setTimeout(() => playTone(554, 'triangle', 0.1, 0.6), 100);
            setTimeout(() => playTone(659, 'triangle', 0.1, 0.6), 200);
            setTimeout(() => playTone(880, 'triangle', 0.4, 0.6), 300);
            break;
        case 'resultHigh':
            // Huge Boom followed by Epic Fanfare
            playTone(50, 'sawtooth', 1.0, 1.0); // Big drop impact
            playTone(100, 'square', 0.5, 0.8);

            setTimeout(() => {
                playTone(523.25, 'square', 0.2, 0.5); // C5
                setTimeout(() => playTone(523.25, 'square', 0.2, 0.5), 150);
                setTimeout(() => playTone(523.25, 'square', 0.2, 0.5), 300);
                setTimeout(() => playTone(659.25, 'square', 0.6, 0.6), 450); // E5
                setTimeout(() => playTone(587.33, 'square', 0.4, 0.5), 900); // D5
                setTimeout(() => playTone(783.99, 'square', 1.5, 0.7), 1200); // G5
            }, 300); // Delay fanfare slightly after the boom
            break;
    }
}

// --- Utilities ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatGold = (g) => g.toLocaleString() + ' G';

// --- Persistence ---
function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.users = parsed.users || [];
        } catch (e) {
            console.error("Failed to load data", e);
        }
    }

    const savedSounds = localStorage.getItem(STORAGE_KEY_SOUNDS);
    if (savedSounds) {
        try {
            state.soundSettings = JSON.parse(savedSounds);
        } catch (e) {
            console.error("Failed to load sound settings", e);
        }
    }

    initializeMasterData();
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: state.users }));
    render();
}

function saveSoundSettings() {
    localStorage.setItem(STORAGE_KEY_SOUNDS, JSON.stringify(state.soundSettings));
}

function initializeMasterData() {
    const saved = localStorage.getItem(STORAGE_KEY_MASTER);
    if (saved) {
        try {
            state.masterItems = JSON.parse(saved);
            return;
        } catch (e) {
            console.error("Failed to load master data", e);
        }
    }

    // Default initialization from items.js globals
    // Assign default weights if missing
    const assignWeight = (items) => items.map(i => ({
        ...i,
        weight: (i.weight !== undefined) ? i.weight : getDefaultWeight(i.rarity)
    }));

    state.masterItems = {
        weapon: assignWeight(typeof WEAPON_POOL !== 'undefined' ? WEAPON_POOL : []),
        material: assignWeight(typeof MATERIAL_POOL !== 'undefined' ? MATERIAL_POOL : []),
        gold: assignWeight(typeof GOLD_POOL !== 'undefined' ? GOLD_POOL : [])
    };

    const savedGachas = localStorage.getItem(STORAGE_KEY_GACHAS);
    if (savedGachas) {
        try {
            state.masterGachas = JSON.parse(savedGachas);
        } catch (e) {
            console.error("Failed to load master gachas", e);
        }
    } else {
        state.masterGachas = [
            { id: 'weapon', name: '武器ガチャ', icon: 'sword', color: 'red-500', image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=2669&auto=format&fit=crop' },
            { id: 'material', name: '素材ガチャ', icon: 'hammer', color: 'blue-500', image: 'https://images.unsplash.com/photo-1621360841012-3f82b7c6c44f?q=80&w=2670&auto=format&fit=crop' },
            { id: 'gold', name: 'ゴールドガチャ', icon: 'coins', color: 'yellow-500', image: 'https://images.unsplash.com/photo-1629814493203-9d41334c2225?q=80&w=2670&auto=format&fit=crop' }
        ];
        saveMasterGachas();
    }

    state.masterGachas.forEach(g => {
        if (!state.masterItems[g.id]) {
            state.masterItems[g.id] = [];
        }
    });

    saveMasterState();
}

function getDefaultWeight(rarity) {
    // Higher rarity = Lower weight
    switch(rarity) {
        case 5: return 5;
        case 4: return 20;
        case 3: return 50;
        case 2: return 80;
        case 1: return 100;
        default: return 50;
    }
}

function saveMasterState() {
    localStorage.setItem(STORAGE_KEY_MASTER, JSON.stringify(state.masterItems));
}

function saveMasterGachas() {
    localStorage.setItem(STORAGE_KEY_GACHAS, JSON.stringify(state.masterGachas));
}

// --- Logic ---

function performLoginAnimation(callback) {
    playSound('login');

    // Create door animation elements
    const doorContainer = document.createElement('div');
    doorContainer.className = "fixed inset-0 z-[100] flex pointer-events-none";

    const leftDoor = document.createElement('div');
    leftDoor.className = "w-1/2 h-full bg-stone-900 border-r-4 border-gold/50 transition-transform duration-[1500ms] ease-in-out flex items-center justify-end overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]";
    leftDoor.innerHTML = '<div class="w-16 h-16 rounded-full border-4 border-gold/50 -mr-8 bg-stone-800"></div>';

    const rightDoor = document.createElement('div');
    rightDoor.className = "w-1/2 h-full bg-stone-900 border-l-4 border-gold/50 transition-transform duration-[1500ms] ease-in-out flex items-center justify-start overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]";
    rightDoor.innerHTML = '<div class="w-16 h-16 rounded-full border-4 border-gold/50 -ml-8 bg-stone-800"></div>';

    // Light flash behind doors
    const light = document.createElement('div');
    light.className = "absolute inset-0 bg-white opacity-0 transition-opacity duration-500 z-[-1]";

    doorContainer.appendChild(light);
    doorContainer.appendChild(leftDoor);
    doorContainer.appendChild(rightDoor);
    document.body.appendChild(doorContainer);

    // Trigger animation
    requestAnimationFrame(() => {
        setTimeout(() => {
            light.classList.remove('opacity-0');
            light.classList.add('opacity-100');
            leftDoor.style.transform = "translateX(-100%)";
            rightDoor.style.transform = "translateX(100%)";
        }, 100);

        setTimeout(() => {
            light.classList.remove('opacity-100');
            light.classList.add('opacity-0');
        }, 800);

        setTimeout(() => {
            document.body.removeChild(doorContainer);
            callback();
        }, 1600);
    });
}

function login(username, password) {
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) {
        // Only set user, let animation handle the view switch
        performLoginAnimation(() => {
            state.currentUser = user;
            state.view = 'dashboard';
            render();
        });
        return true;
    }
    return false;
}

function register(username, password) {
    if (state.users.some(u => u.username === username)) return false;

    const newUser = {
        id: generateId(),
        username,
        password,
        gold: INITIAL_GOLD,
        inventory: [],
        history: []
    };
    state.users.push(newUser);
    saveState();

    performLoginAnimation(() => {
        state.currentUser = newUser;
        state.view = 'dashboard';
        render();
    });
    return true;
}

function logout() {
    state.currentUser = null;
    state.view = 'login';
    render();
}

function pullGacha(type) {
    if (!state.currentUser || state.currentUser.gold < GACHA_COST) return null;

    // Select Pool
    let pool = state.masterItems[type] || [];

    if (!pool || pool.length === 0) {
        console.error("No items in pool for type:", type);
        return null;
    }

    // Weighted Random
    const totalWeight = pool.reduce((sum, item) => sum + (item.weight || 0), 0);
    let rand = Math.random() * totalWeight;

    let item = null;
    for (const candidate of pool) {
        rand -= (candidate.weight || 0);
        if (rand < 0) {
            item = candidate;
            break;
        }
    }

    // Fallback if something goes wrong (e.g. weights are 0)
    if (!item) item = pool[0];

    // Update User
    state.currentUser.gold -= GACHA_COST;

    // Add item or value
    if (type === 'gold' && item.value) {
        state.currentUser.gold += item.value;
    } else {
        state.currentUser.inventory.push({ ...item, acquiredAt: Date.now() });
    }

    // Add History
    state.currentUser.history.unshift({
        id: generateId(),
        itemId: item.id,
        itemName: item.name,
        rarity: item.rarity,
        type: type,
        timestamp: Date.now()
    });

    saveState();
    return item;
}

function addGold(userId, amount) {
    const user = state.users.find(u => u.id === userId);
    if (user) {
        user.gold += amount;
        saveState();
    }
}

function transferGold(targetId, amount) {
    if (!state.currentUser) return false;
    if (state.currentUser.gold < amount) return false;

    const target = state.users.find(u => u.id === targetId);
    if (!target) return false;

    state.currentUser.gold -= amount;
    target.gold += amount;
    saveState();
    return true;
}

// --- Render Engine ---

const app = document.getElementById('app');
const modalContainer = document.getElementById('modal-container');

function render() {
    // Re-initialize Lucide icons after DOM updates
    setTimeout(() => lucide.createIcons(), 0);

    app.innerHTML = '';
    modalContainer.innerHTML = ''; // Clear modals unless we explicitly render one

    if (!state.currentUser) {
        renderLogin();
    } else {
        renderHeader();

        // Navigation Tabs
        const nav = document.createElement('div');
        nav.className = "flex justify-center mb-6 bg-rpg-dark/50 p-2 rounded-full border border-white/10 w-fit mx-auto backdrop-blur-sm";
        nav.innerHTML = `
            <button onclick="setView('dashboard')" class="px-6 py-2 rounded-full transition-all text-sm font-bold uppercase tracking-wide ${state.view === 'dashboard' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white'}">ステータス</button>
            <button onclick="setView('gacha')" class="px-6 py-2 rounded-full transition-all text-sm font-bold uppercase tracking-wide ${state.view === 'gacha' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white'}">ガチャ召喚</button>
        `;
        app.appendChild(nav);

        if (state.view === 'dashboard') renderDashboard();
        if (state.view === 'gacha') renderGachaScene();

        renderParentModeButton();
    }
}

function setView(viewName) {
    state.view = viewName;
    render();
}

// --- Components ---

function renderHeader() {
    const header = document.createElement('div');
    header.className = "flex justify-between items-center mb-8 border-b border-gold/20 pb-4";
    header.innerHTML = `
        <h1 class="text-3xl font-fantasy text-gradient-gold tracking-wider drop-shadow-md">ガチャRPG</h1>
        <div class="flex items-center gap-4">
            <span class="text-gold font-bold">${formatGold(state.currentUser.gold)}</span>
            <button onclick="logout()" class="text-xs text-red-400 hover:text-red-300 uppercase">ログアウト</button>
        </div>
    `;
    app.appendChild(header);
}

function renderLogin() {
    const container = document.createElement('div');
    container.className = "flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto";

    // Using a simple toggle for Login/Register view inside the component
    const isRegistering = window.isRegisteringState || false;

    container.innerHTML = `
        <div class="w-full bg-glass p-8 rounded-2xl shadow-2xl shadow-gold/10 animate-fade-in-up">
            <div class="text-center mb-8">
                <div class="inline-block p-4 rounded-full bg-gradient-to-br from-gold-dark to-rpg-black border border-gold mb-4 shadow-lg shadow-gold/20">
                    <i data-lucide="sword" class="w-10 h-10 text-gold"></i>
                </div>
                <h2 class="text-3xl font-fantasy text-gradient-gold mb-2">${isRegistering ? '冒険者登録' : '冒険を再開'}</h2>
            </div>
            <form id="auth-form" class="space-y-6">
                <input id="auth-username" type="text" placeholder="勇者の名前 (ID)" class="block w-full px-4 py-3 border border-gray-700 rounded-lg bg-rpg-black/50 text-white focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none transition-all">
                <input id="auth-password" type="password" placeholder="合言葉 (パスワード)" class="block w-full px-4 py-3 border border-gray-700 rounded-lg bg-rpg-black/50 text-white focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none transition-all">
                <p id="auth-error" class="text-red-400 text-sm text-center hidden"></p>
                <button type="submit" class="w-full btn-primary py-3 flex justify-center items-center gap-2">
                    ${isRegistering ? '冒険の書を作る' : '世界へ入る'}
                </button>
            </form>
            <div class="mt-8 pt-6 border-t border-gray-800 text-center">
                <button id="toggle-auth" class="text-gold hover:text-white transition-colors text-sm font-bold uppercase tracking-wide">
                    ${isRegistering ? 'すでに登録済みの方はこちら' : '新しく始める方はこちら'}
                </button>
            </div>
        </div>
    `;

    app.appendChild(container);

    // Event Listeners
    document.getElementById('auth-form').onsubmit = (e) => {
        e.preventDefault();
        const u = document.getElementById('auth-username').value;
        const p = document.getElementById('auth-password').value;
        const err = document.getElementById('auth-error');

        if(!u || !p) {
            err.textContent = "全ての項目を入力してください";
            err.classList.remove('hidden');
            return;
        }

        const success = isRegistering ? register(u, p) : login(u, p);
        if (!success) {
            err.textContent = isRegistering ? "その名前は使われています" : "IDかパスワードが違います";
            err.classList.remove('hidden');
        }
    };

    document.getElementById('toggle-auth').onclick = () => {
        window.isRegisteringState = !window.isRegisteringState;
        render();
    };
}

function renderDashboard() {
    // Current user data
    const inventory = state.currentUser.inventory;
    const history = state.currentUser.history;

    const dash = document.createElement('div');
    dash.className = "w-full max-w-4xl mx-auto animate-fade-in";

    dash.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-center bg-glass p-6 rounded-2xl mb-8 gap-4">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-black font-fantasy text-2xl border-4 border-rpg-black">
                    ${state.currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 class="text-2xl font-fantasy tracking-wide">${state.currentUser.username}</h2>
                    <div class="flex items-center gap-2 text-gold-dark font-mono font-bold text-lg">
                        <i data-lucide="coins" class="w-5 h-5 text-gold"></i>
                        <span>${formatGold(state.currentUser.gold)}</span>
                    </div>
                </div>
            </div>
            <button onclick="openTransferModal()" class="flex items-center gap-2 px-4 py-2 bg-rpg-accent border border-gold/30 rounded-lg hover:bg-gold/10 hover:border-gold transition-all text-sm">
                <i data-lucide="send" class="w-4 h-4 text-gold"></i> 送金する
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-1 space-y-4">
                <div class="bg-rpg-dark/60 rounded-xl p-4 border border-white/5">
                    <h3 class="font-fantasy text-gold mb-4 text-lg border-b border-white/10 pb-2">冒険の記録</h3>
                    <div class="text-sm text-gray-400">
                        <p class="mb-2 flex justify-between"><span>獲得アイテム数</span> <span class="text-white">${inventory.length}</span></p>
                        <p class="mb-2 flex justify-between"><span>ガチャ履歴数</span> <span class="text-white">${history.length}</span></p>
                    </div>
                </div>
            </div>
            <div class="md:col-span-2">
                <div class="bg-rpg-dark/60 rounded-xl p-6 border border-white/5 min-h-[400px]">
                    <h3 class="font-fantasy text-2xl text-white mb-6 border-b border-white/10 pb-4">持ち物リスト</h3>
                    <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        ${inventory.length === 0 ? '<div class="text-center text-gray-500 py-12">まだ何も持っていません。ガチャを引こう！</div>' : inventory.map(item => `
                            <div class="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-white/5 hover:border-gold/30 transition-colors">
                                <div class="w-12 h-12 rounded flex items-center justify-center text-xl shadow-lg ${getRarityGradient(item.rarity)}">
                                    ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover rounded">` : `<i data-lucide="${(state.masterGachas.find(g => g.id === item.type) || {}).icon || 'star'}" class="w-6 h-6 text-white"></i>`}
                                </div>
                                <div class="flex-1">
                                    <div class="flex justify-between items-start">
                                        <h4 class="font-bold ${item.rarity >= 4 ? 'text-gold' : 'text-gray-200'}">${item.name}</h4>
                                        <span class="text-xs text-gray-500 uppercase tracking-wider">${getItemTypeJA(item.type)}</span>
                                    </div>
                                    <div class="flex gap-1 mt-1 text-yellow-400 text-xs">
                                        ${'★'.repeat(item.rarity)}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    app.appendChild(dash);
}

function getItemTypeJA(type) {
    const gachaDef = state.masterGachas.find(g => g.id === type);
    return gachaDef ? gachaDef.name : type;
}

function getRarityGradient(rarity) {
    if (rarity === 5) return 'bg-gradient-to-br from-yellow-400 to-orange-600 border-2 border-yellow-300';
    if (rarity === 4) return 'bg-gradient-to-br from-purple-400 to-indigo-600 border-2 border-purple-300';
    if (rarity === 3) return 'bg-gradient-to-br from-blue-400 to-cyan-600 border-2 border-blue-300';
    return 'bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-500';
}

function renderGachaScene() {
    const scene = document.createElement('div');
    scene.className = "w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh]";

    scene.innerHTML = `
        <h2 class="text-4xl font-fantasy text-gradient-gold mb-12 text-center drop-shadow-lg animate-pulse">運命を選べ</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4">
            ${state.masterGachas.map(g => renderGachaCard(g.name, g.id, g.icon || 'star', g.color || 'gold', g.image || '')).join('')}
        </div>
    `;
    app.appendChild(scene);
}

function renderGachaCard(title, type, icon, color, imgUrl) {
    // Note: Tailwind arbitrary values used for dynamic colors might need safelisting if purged,
    // but since we use CDN tailwind, it parses DOM at runtime, so it works!
    return `
        <button onclick="startGacha('${type}')" class="relative group bg-gradient-to-b from-gray-800 to-black p-1 rounded-2xl shadow-xl hover:shadow-${color}/20 transition-all border border-gray-700 hover:border-${color} overflow-hidden h-80">
            <div class="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity" style="background-image: url('${imgUrl}')"></div>
            <div class="relative z-10 p-6 flex flex-col items-center h-full">
                <div class="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center mb-6 border-2 border-${color} group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <i data-lucide="${icon}" class="w-10 h-10 text-${color}"></i>
                </div>
                <h3 class="text-2xl font-fantasy text-white mb-2">${title}</h3>
                <div class="mt-auto px-6 py-2 bg-black/60 rounded-full border border-${color}/50 text-${color} font-bold flex items-center gap-2">
                    <i data-lucide="coins" class="w-4 h-4"></i> 100 G
                </div>
            </div>
        </button>
    `;
}

function startGacha(type) {
    if (state.currentUser.gold < 100) {
        alert("ゴールドが足りません！");
        return;
    }

    playSound('gachaPull');

    // Pull the item immediately so we know its rarity and can adjust the animation intensity
    const item = pullGacha(type);
    if (!item) return;

    // Adjust shake intensity and colors based on rarity
    const isHighRarity = item.rarity >= 4;
    const isMaxRarity = item.rarity === 5;

    let ringColor = isMaxRarity ? 'border-t-yellow-300 border-r-yellow-500 shadow-[0_0_100px_rgba(253,224,71,1)]'
                  : isHighRarity ? 'border-t-purple-400 border-r-purple-600 shadow-[0_0_80px_rgba(192,132,252,0.8)]'
                  : 'border-t-gold border-r-gold-dark shadow-[0_0_50px_rgba(255,215,0,0.5)]';

    let shakeAnimation = isHighRarity ? 'animate-shake-intense' : 'animate-shake';
    let spinSpeed = isHighRarity ? 'animate-spin-fast' : 'animate-[spin_0.5s_linear_infinite]';
    let bgColor = isHighRarity ? 'from-purple-900/40 via-black to-black' : 'from-gold/20 via-black to-black';

    // Show Loading with flashy effects
    modalContainer.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl pointer-events-auto overflow-hidden";
    modalContainer.innerHTML = `
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${bgColor} animate-pulse"></div>
        <div class="flex flex-col items-center relative z-10 ${shakeAnimation}">
            <div class="w-40 h-40 rounded-full border-8 ${ringColor} border-b-transparent border-l-transparent mb-8 ${spinSpeed}"></div>
            <h2 class="text-5xl font-fantasy text-gradient-gold tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]">召喚中...</h2>
        </div>
    `;

    // Wait for the charge up sound to almost finish, then show result
    // High rarity gets a slightly longer charge up
    const delay = isMaxRarity ? 2500 : isHighRarity ? 2200 : 1800;

    setTimeout(() => {
        renderGachaResult(item);
    }, delay);
}

function renderGachaResult(item) {
    let delay = 0;
    let shakeClass = '';
    let particles = '';
    let soundType = 'resultLow';
    let extraEffects = '';

    // Check if it's a new item (not in history before this pull, which means inventory count is 1 for this id if non-gold)
    const isNewItem = item.type !== 'gold' && state.currentUser.inventory.filter(i => i.id === item.id).length === 1;

    // Determine effects based on rarity
    if (item.rarity === 5) {
        delay = 2500;
        shakeClass = 'animate-shake-intense';
        soundType = 'resultHigh';

        // Massive golden particles + confetti + expanding ripple
        for(let i=0; i<80; i++) {
            const tx = (Math.random() - 0.5) * 800;
            const ty = (Math.random() - 0.5) * 800;
            const size = Math.random() * 6 + 4;
            particles += `<div class="absolute top-1/2 left-1/2 rounded-full bg-yellow-300 shadow-[0_0_15px_#fde047] opacity-0" style="width: ${size}px; height: ${size}px; --tx: ${tx}px; --ty: ${ty}px; animation: particle-burst 2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; animation-delay: ${delay/1000}s;"></div>`;
        }

        for(let i=0; i<40; i++) {
            const left = Math.random() * 100;
            const animDuration = Math.random() * 2 + 2;
            const animDelay = Math.random() * 1;
            const colors = ['bg-yellow-400', 'bg-yellow-200', 'bg-red-500', 'bg-orange-500'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            extraEffects += `<div class="fixed top-0 w-3 h-8 ${color} opacity-0" style="left: ${left}vw; animation: confetti-fall ${animDuration}s linear forwards; animation-delay: ${(delay/1000) + animDelay}s;"></div>`;
        }

        extraEffects += `<div class="absolute inset-0 border-[20px] border-yellow-400 rounded-full opacity-0 pointer-events-none" style="animation: ripple 1.5s ease-out forwards; animation-delay: ${delay/1000}s;"></div>`;

    } else if (item.rarity === 4) {
        delay = 1800;
        shakeClass = 'animate-shake';
        soundType = 'resultHigh';

        // Intense purple/pink particles
        for(let i=0; i<50; i++) {
            const tx = (Math.random() - 0.5) * 600;
            const ty = (Math.random() - 0.5) * 600;
            const size = Math.random() * 4 + 3;
            particles += `<div class="absolute top-1/2 left-1/2 rounded-full bg-purple-400 shadow-[0_0_10px_#c084fc] opacity-0" style="width: ${size}px; height: ${size}px; --tx: ${tx}px; --ty: ${ty}px; animation: particle-burst 1.5s ease-out forwards; animation-delay: ${delay/1000}s;"></div>`;
        }

        extraEffects += `<div class="absolute inset-0 border-[10px] border-purple-500 rounded-full opacity-0 pointer-events-none" style="animation: ripple 1s ease-out forwards; animation-delay: ${delay/1000}s;"></div>`;

    } else if (item.rarity === 3) {
        delay = 500;
        soundType = 'resultMid';
        // Moderate blue particles
        for(let i=0; i<30; i++) {
            const tx = (Math.random() - 0.5) * 400;
            const ty = (Math.random() - 0.5) * 400;
            particles += `<div class="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_5px_#93c5fd] opacity-0" style="--tx: ${tx}px; --ty: ${ty}px; animation: particle-burst 1s ease-out forwards; animation-delay: ${delay/1000}s;"></div>`;
        }
    } else {
        // Simple pop for 1-2
        for(let i=0; i<15; i++) {
            const tx = (Math.random() - 0.5) * 200;
            const ty = (Math.random() - 0.5) * 200;
            particles += `<div class="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-gray-300 opacity-0" style="--tx: ${tx}px; --ty: ${ty}px; animation: particle-burst 0.6s ease-out forwards; animation-delay: 0s;"></div>`;
        }
    }

    // Pre-result suspense for high rarity
    if (delay > 0) {
        const ringColor = item.rarity === 5 ? 'border-yellow-400 shadow-[0_0_150px_rgba(250,204,21,1)]' : 'border-purple-500 shadow-[0_0_100px_rgba(168,85,247,1)]';

        modalContainer.innerHTML = `
            <div class="fixed inset-0 bg-white/10 animate-pulse flex items-center justify-center ${shakeClass}">
                 <div class="w-1 h-1 rounded-full bg-white shadow-[0_0_100px_rgba(255,255,255,1)] animate-ping" style="animation-duration: 0.3s"></div>
                 <div class="absolute w-32 h-32 rounded-full border-4 ${ringColor} animate-ping" style="animation-duration: 0.8s"></div>
            </div>
            ${item.rarity >= 4 ? `<div class="fixed inset-0 bg-white z-50 pointer-events-none" style="animation: flash 0.5s ease-in-out forwards; animation-delay: ${(delay - 200)/1000}s; opacity: 0;"></div>` : ''}
        `;
    }

    setTimeout(() => {
        playSound(soundType);

        const gradientBg = item.rarity === 5 ? 'from-yellow-600/50 via-red-900/30 to-black' :
                           item.rarity === 4 ? 'from-purple-600/40 via-blue-900/30 to-black' :
                           'from-gold/30 to-black';

        const cardGlow = item.rarity === 5 ? 'shadow-[0_0_200px_rgba(250,204,21,0.8)]' :
                         item.rarity === 4 ? 'shadow-[0_0_150px_rgba(192,132,252,0.8)]' :
                         'shadow-[0_0_50px_rgba(255,215,0,0.4)]';

        const starAnimation = item.rarity >= 4 ? 'animate-pulse scale-125' : 'scale-100';

        modalContainer.className = `fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl pointer-events-auto`;
        modalContainer.innerHTML = `
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${gradientBg} pointer-events-none ${item.rarity >= 4 ? 'animate-pulse' : ''}"></div>
            ${particles}
            ${extraEffects}

            <div class="relative z-10 flex flex-col items-center text-center animate-zoom-in">
                ${isNewItem ? `
                    <div class="absolute -top-12 bg-red-600 text-white font-black px-6 py-2 rounded-full border-4 border-yellow-400 transform -rotate-12 shadow-[0_0_20px_rgba(220,38,38,1)] z-20 animate-bounce" style="letter-spacing: 0.2em;">
                        NEW!
                    </div>
                ` : ''}

                <div class="mb-12 relative group">
                     <div class="w-64 h-64 rounded-2xl flex items-center justify-center text-8xl ${cardGlow} ${getRarityGradient(item.rarity)} border-4 ${item.rarity >= 4 ? 'border-yellow-200' : 'border-gray-500'} relative overflow-hidden">
                        <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        ${item.rarity >= 4 ? `<div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full animate-[shine_2s_infinite]"></div>` : ''}
                        ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover rounded-xl shadow-inner">` : `<i data-lucide="${(state.masterGachas.find(g => g.id === item.type) || {}).icon || 'star'}" class="w-32 h-32 text-white drop-shadow-2xl"></i>`}
                     </div>
                     <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2 ${starAnimation} bg-black/50 px-6 py-2 rounded-full backdrop-blur-md border border-yellow-500/30">
                        ${'<i data-lucide="star" class="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]"></i>'.repeat(item.rarity)}
                     </div>
                </div>

                <div class="bg-black/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl max-w-2xl w-full mx-4 mb-10 transform transition-transform hover:scale-105">
                    <h2 class="text-4xl md:text-6xl font-fantasy mb-4 text-white drop-shadow-[0_5px_5px_rgba(0,0,0,1)] ${item.rarity === 5 ? 'animate-pulse text-gradient-gold' : item.rarity === 4 ? 'text-purple-300' : ''}">${item.name}</h2>
                    <p class="text-gray-300 text-lg md:text-xl font-fantasy tracking-widest bg-black/50 px-6 py-3 rounded-xl border border-white/5 inline-block">
                        <span class="text-gold uppercase">${getItemTypeJA(item.type)}</span>
                        <span class="mx-2 opacity-50">|</span>
                        ${item.description || (item.value ? `価値: <span class="text-yellow-400 font-bold">${item.value}G</span>` : 'レアアイテム')}
                    </p>
                </div>

                <button onclick="closeModal()" class="btn-primary px-16 py-5 text-2xl flex items-center gap-3 animate-bounce hover:scale-110 transition-transform shadow-[0_10px_30px_rgba(255,215,0,0.3)]">
                    <i data-lucide="check-circle" class="w-8 h-8"></i> GET!
                </button>
            </div>
        `;
        lucide.createIcons();
    }, delay);
}

function closeModal() {
    modalContainer.innerHTML = '';
    modalContainer.className = "fixed inset-0 z-50 pointer-events-none flex items-center justify-center";
    render(); // Re-render to update gold/inventory
}

// --- Parent Mode ---

function renderParentModeButton() {
    const btn = document.createElement('div');
    btn.className = "fixed bottom-4 right-4 z-40";
    btn.innerHTML = `
        <button onclick="openParentMode()" class="bg-rpg-dark border-2 border-gold/30 text-gold p-3 rounded-full shadow-lg hover:shadow-gold/20 hover:border-gold transition-all">
            <i data-lucide="shield" class="w-6 h-6"></i>
        </button>
    `;
    app.appendChild(btn);
}

function openParentMode() {
    modalContainer.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto";
    const userOptions = state.users.map(u => `<option value="${u.id}">${u.username} (${u.gold}G)</option>`).join("");

    modalContainer.innerHTML = `
        <div class="bg-rpg-dark border border-gold/40 p-6 rounded-lg shadow-2xl w-80 animate-fade-in-up">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-fantasy text-gold">保護者モード</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-white"><i data-lucide="x"></i></button>
            </div>
            <div id="parent-content">
                <input type="password" id="parent-pin" placeholder="暗証番号 (PIN)" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white mb-2">
                <button onclick="verifyParentPin()" class="w-full bg-gold/20 text-gold border border-gold/50 rounded py-2">認証</button>
            </div>
        </div>
    `;
    // We store options for later use if needed
    window.tempUserOptions = userOptions;
    lucide.createIcons();
}

function verifyParentPin() {
    const pin = document.getElementById('parent-pin').value;
    if (pin === '20211004') {
        const content = document.getElementById('parent-content');
        content.innerHTML = `
            <div class="space-y-4">
                <h4 class="text-sm font-bold text-gray-400 border-b border-gray-700 pb-1">ゴールド管理</h4>
                <select id="parent-user-select" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white">
                    <option value="">対象の冒険者を選択</option>
                    ${window.tempUserOptions}
                </select>
                <div class="flex gap-2">
                    <input type="number" id="parent-amount" value="500" class="flex-1 bg-black/50 border border-gray-600 rounded p-2 text-white">
                    <button onclick="execAddGold()" class="px-4 bg-gold/20 text-gold border border-gold/50 rounded hover:bg-gold/30">追加</button>
                </div>

                <h4 class="text-sm font-bold text-gray-400 border-b border-gray-700 pb-1 pt-4">システム管理</h4>
                <button onclick="renderGachaManager()" class="w-full bg-purple-600/50 hover:bg-purple-600 border border-purple-400/50 rounded py-2 flex items-center justify-center gap-2 text-white transition-colors mb-2">
                    <i data-lucide="layout-grid"></i> ガチャマシン管理
                </button>
                <button onclick="renderItemManager()" class="w-full btn-primary py-2 flex items-center justify-center gap-2 mb-2">
                    <i data-lucide="database"></i> アイテムデータベース編集
                </button>
                <button onclick="renderSoundManager()" class="w-full bg-blue-600/50 hover:bg-blue-600 border border-blue-400/50 rounded py-2 flex items-center justify-center gap-2 text-white transition-colors">
                    <i data-lucide="music"></i> 効果音設定
                </button>
            </div>
        `;
        lucide.createIcons();
    } else {
        alert("暗証番号が違います");
    }
}

function execAddGold() {
    const uid = document.getElementById('parent-user-select').value;
    const amount = parseInt(document.getElementById('parent-amount').value);
    if(uid && amount) {
        addGold(uid, amount);
        alert("ゴールドを追加しました！");
        closeModal();
    }
}

function renderSoundManager() {
    modalContainer.innerHTML = `
        <div class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div class="bg-rpg-dark border border-gold/40 w-full max-w-2xl rounded-xl shadow-2xl animate-fade-in-up">
                <div class="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 class="text-xl font-fantasy text-gold flex items-center gap-2"><i data-lucide="music"></i> 効果音設定 (URL)</h2>
                    <button onclick="openParentMode();" class="text-gray-400 hover:text-white"><i data-lucide="x"></i></button>
                </div>
                <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <p class="text-xs text-gray-400 mb-4">音声ファイルのURL（mp3, wavなど）を入力してください。空欄の場合はデフォルトの電子音が鳴ります。</p>

                    ${createSoundInput('login', 'ログイン時の音（扉が開く音など）')}
                    ${createSoundInput('transfer', '送金時の音（チャリンチャリン）')}
                    ${createSoundInput('gachaPull', 'ガチャを引く時の音（溜め演出）')}
                    ${createSoundInput('resultLow', 'ガチャ結果（低レア: ★1-2）')}
                    ${createSoundInput('resultMid', 'ガチャ結果（中レア: ★3）')}
                    ${createSoundInput('resultHigh', 'ガチャ結果（高レア: ★4-5）')}

                    <div class="flex justify-end pt-4 border-t border-white/10">
                        <button onclick="saveSoundUrls()" class="btn-primary px-8 py-2 rounded shadow-lg flex items-center gap-2">
                            <i data-lucide="save" class="w-4 h-4"></i> 保存する
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function createSoundInput(key, label) {
    const val = state.soundSettings[key] || '';
    return `
        <div>
            <label class="block text-sm text-gray-300 mb-1">${label}</label>
            <div class="flex gap-2">
                <input type="text" id="sound-${key}" value="${val}" placeholder="https://example.com/sound.mp3" class="flex-1 bg-black/50 border border-gray-600 rounded p-2 text-white text-sm focus:border-gold outline-none">
                <button onclick="testCustomSound('sound-${key}')" class="px-3 bg-gray-700 hover:bg-gray-600 rounded text-white" title="再生テスト">
                    <i data-lucide="play" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
}

function testCustomSound(inputId) {
    const url = document.getElementById(inputId).value;
    if (url) {
        const audio = new Audio(url);
        audio.play().catch(e => alert("再生エラー: URLが間違っているか、ブラウザでブロックされました。"));
    }
}

function saveSoundUrls() {
    const keys = ['login', 'transfer', 'gachaPull', 'resultLow', 'resultMid', 'resultHigh'];
    keys.forEach(k => {
        state.soundSettings[k] = document.getElementById(`sound-${k}`).value;
    });
    saveSoundSettings();
    alert("効果音設定を保存しました！");
}

// --- Transfer Modal ---
function openTransferModal() {
    modalContainer.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto";
    const others = state.users.filter(u => u.id !== state.currentUser.id);

    modalContainer.innerHTML = `
        <div class="bg-rpg-dark border border-gold/40 w-full max-w-md p-6 rounded-xl shadow-2xl animate-fade-in-up">
            <div class="flex justify-between items-center mb-6">
                 <h2 class="text-2xl font-fantasy text-gold flex items-center gap-2"><i data-lucide="send"></i> 送金</h2>
                 <button onclick="closeModal()" class="text-gray-400 hover:text-white"><i data-lucide="x"></i></button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-1">送り先</label>
                    <select id="transfer-target" class="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-gold">
                        <option value="">冒険者を選択...</option>
                        ${others.map(u => `<option value="${u.id}">${u.username}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">金額 (G)</label>
                    <input type="number" id="transfer-amount" class="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-gold" placeholder="0">
                </div>
                <button onclick="execTransfer()" class="w-full btn-primary mt-4">決定</button>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function execTransfer() {
    const target = document.getElementById('transfer-target').value;
    const amount = parseInt(document.getElementById('transfer-amount').value);

    if(!target) return alert("送り先を選んでください");
    if(!amount || amount <= 0) return alert("金額が正しくありません");

    const success = transferGold(target, amount);
    if(success) {
        playSound('transfer');
        playCoinShowerAnimation();
        closeModal();
    } else {
        alert("所持金が足りないか、エラーが発生しました");
    }
}

function playCoinShowerAnimation() {
    const container = document.createElement('div');
    container.className = "fixed inset-0 z-[100] pointer-events-none overflow-hidden";
    document.body.appendChild(container);

    const numCoins = 30;
    for (let i = 0; i < numCoins; i++) {
        const coin = document.createElement('div');
        coin.innerHTML = '🪙';
        coin.className = "absolute text-3xl animate-fall";
        coin.style.left = `${Math.random() * 100}vw`;
        coin.style.top = `-50px`;
        coin.style.animationDuration = `${1 + Math.random() * 2}s`;
        coin.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(coin);
    }

    setTimeout(() => {
        document.body.removeChild(container);
    }, 3000);
}

// --- Init ---
loadState();
render();

function renderItemManager(currentTab = 'weapon') {
    modalContainer.innerHTML = `
        <div class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div class="bg-rpg-dark border border-gold/40 w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl flex flex-col animate-fade-in">
                <!-- Header -->
                <div class="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 class="text-2xl font-fantasy text-gold flex items-center gap-2">
                        <i data-lucide="database"></i> アイテムデータベース
                    </h2>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-white p-2">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <!-- Tabs -->
                <div class="flex border-b border-white/10 px-6 pt-4 gap-4 overflow-x-auto custom-scrollbar whitespace-nowrap">
                    ${state.masterGachas.map(g => `
                    <button onclick="renderItemManager('${g.id}')" class="pb-3 px-2 border-b-2 transition-colors ${currentTab === g.id ? 'border-gold text-gold font-bold' : 'border-transparent text-gray-400 hover:text-white'}">${g.name}</button>
                    `).join('')}
                </div>

                <!-- Toolbar -->
                <div class="p-4 bg-black/20 flex justify-between items-center">
                    <div class="text-sm text-gray-400">
                        登録数: <span class="text-white font-bold">${state.masterItems[currentTab].length}</span>
                    </div>
                    <button onclick="openItemEditor(null, '${currentTab}')" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold transition-colors">
                        <i data-lucide="plus"></i> 新規追加
                    </button>
                </div>

                <!-- List -->
                <div class="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-2">
                    ${state.masterItems[currentTab].map(item => `
                        <div class="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-white/5 hover:border-gold/30 transition-colors group">
                             <!-- Image Preview -->
                            <div class="w-12 h-12 rounded bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-600">
                                ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover">` : '<span class="text-xs text-gray-500">No Img</span>'}
                            </div>

                            <!-- Info -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <span class="font-bold text-white truncate">${item.name}</span>
                                    <span class="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">ID: ${item.id}</span>
                                </div>
                                <div class="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                    <span class="text-yellow-500">★${item.rarity}</span>
                                    <span>Weight: <b class="text-white">${item.weight}</b></span>
                                    ${item.value ? `<span>Value: ${item.value}G</span>` : ''}
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="openItemEditor('${item.id}', '${currentTab}')" class="p-2 hover:bg-white/10 rounded text-blue-400" title="編集">
                                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                                </button>
                                <button onclick="deleteItem('${item.id}', '${currentTab}')" class="p-2 hover:bg-white/10 rounded text-red-400" title="削除">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}

                    ${state.masterItems[currentTab].length === 0 ? `
                        <div class="text-center py-12 text-gray-500">
                            アイテムがありません
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function deleteItem(itemId, type) {
    if(!confirm("本当にこのアイテムを削除しますか？\n(すでに持っているユーザーの持ち物は消えません)")) return;

    state.masterItems[type] = state.masterItems[type].filter(i => i.id !== itemId);
    saveMasterState();
    renderItemManager(type);
}

// --- Item Editor ---

function openItemEditor(itemId, type) {
    const item = itemId ? state.masterItems[type].find(i => i.id === itemId) : {
        id: generateId(),
        type: type,
        rarity: 1,
        weight: 50,
        name: '',
        description: '',
        value: 0
    };

    const isNew = !itemId;

    modalContainer.innerHTML = `
        <div class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div class="bg-rpg-dark border border-gold/40 w-full max-w-2xl rounded-xl shadow-2xl animate-fade-in-up">
                <div class="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 class="text-xl font-fantasy text-gold">${isNew ? '新規アイテム作成' : 'アイテム編集'}</h2>
                    <button onclick="renderItemManager('${type}')" class="text-gray-400 hover:text-white"><i data-lucide="x"></i></button>
                </div>

                <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    <!-- Basic Info -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                            <label class="block text-xs text-gray-500 mb-1">名称</label>
                            <input type="text" id="edit-name" value="${item.name}" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white focus:border-gold outline-none">
                        </div>

                        <div>
                            <label class="block text-xs text-gray-500 mb-1">レアリティ (1-5)</label>
                            <select id="edit-rarity" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white">
                                <option value="1" ${item.rarity == 1 ? 'selected' : ''}>★1 (Common)</option>
                                <option value="2" ${item.rarity == 2 ? 'selected' : ''}>★2 (Uncommon)</option>
                                <option value="3" ${item.rarity == 3 ? 'selected' : ''}>★3 (Rare)</option>
                                <option value="4" ${item.rarity == 4 ? 'selected' : ''}>★4 (Epic)</option>
                                <option value="5" ${item.rarity == 5 ? 'selected' : ''}>★5 (Legendary)</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs text-gray-500 mb-1">排出確率の重み (Weight)</label>
                            <input type="number" id="edit-weight" value="${item.weight || 50}" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white" placeholder="例: 50">
                            <p class="text-[10px] text-gray-500 mt-1">数値が高いほど当たりやすくなります</p>
                        </div>

                        ${type === 'gold' ? `
                        <div class="col-span-2">
                            <label class="block text-xs text-gray-500 mb-1">獲得ゴールド量</label>
                            <input type="number" id="edit-value" value="${item.value || 0}" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white">
                        </div>
                        ` : ''}
                    </div>

                    <!-- Description -->
                    <div>
                        <label class="block text-xs text-gray-500 mb-1">説明文</label>
                        <textarea id="edit-desc" rows="3" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white">${item.description || ''}</textarea>
                    </div>

                    <!-- Image Upload -->
                    <div class="border-t border-white/10 pt-4">
                        <label class="block text-xs text-gray-500 mb-2">アイテム画像</label>
                        <div class="flex items-start gap-4">
                            <div id="image-preview" class="w-24 h-24 bg-black/50 border border-gray-700 rounded flex items-center justify-center overflow-hidden">
                                ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover">` : '<i data-lucide="image" class="text-gray-600"></i>'}
                            </div>
                            <div class="flex-1">
                                <input type="file" id="edit-image-file" accept="image/*" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/20 file:text-gold hover:file:bg-gold/30 mb-2">
                                <p class="text-xs text-gray-500">
                                    推奨: 正方形の画像 (JPEG/PNG)<br>
                                    ※ 画像は自動的に圧縮されます
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                        <button onclick="renderItemManager('${type}')" class="px-4 py-2 rounded text-gray-400 hover:text-white transition-colors">キャンセル</button>
                        <button onclick="saveItem('${item.id}', '${type}')" class="btn-primary px-6 py-2 rounded shadow-lg">保存する</button>
                    </div>

                </div>
            </div>
        </div>
    `;
    lucide.createIcons();

    // Image Preview Handler
    document.getElementById('edit-image-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Ideally we should resize this here, but for simplicity we just show preview
                const preview = document.getElementById('image-preview');
                preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
                // Store temporarily
                window.tempImageBase64 = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Store existing image if any
    window.tempImageBase64 = item.image || null;
}

function saveItem(id, type) {
    const name = document.getElementById('edit-name').value;
    const rarity = parseInt(document.getElementById('edit-rarity').value);
    const weight = parseInt(document.getElementById('edit-weight').value);
    const desc = document.getElementById('edit-desc').value;
    const val = document.getElementById('edit-value') ? parseInt(document.getElementById('edit-value').value) : undefined;

    if (!name) return alert("名前を入力してください");

    const newItem = {
        id: id,
        type: type,
        name: name,
        rarity: rarity,
        weight: weight,
        description: desc,
        value: val,
        image: window.tempImageBase64
    };

    // Update State
    const index = state.masterItems[type].findIndex(i => i.id === id);
    if (index >= 0) {
        state.masterItems[type][index] = newItem;
    } else {
        state.masterItems[type].push(newItem);
    }

    saveMasterState();
    alert("保存しました！");
    renderItemManager(type);
}

// --- Gacha Manager ---
function renderGachaManager() {
    modalContainer.innerHTML = `
        <div class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div class="bg-rpg-dark border border-gold/40 w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl flex flex-col animate-fade-in">
                <!-- Header -->
                <div class="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 class="text-2xl font-fantasy text-gold flex items-center gap-2">
                        <i data-lucide="layout-grid"></i> ガチャマシン管理
                    </h2>
                    <button onclick="openParentMode()" class="text-gray-400 hover:text-white p-2">
                        <i data-lucide="arrow-left" class="w-6 h-6"></i>
                    </button>
                </div>

                <!-- Toolbar -->
                <div class="p-4 bg-black/20 flex justify-between items-center">
                    <div class="text-sm text-gray-400">
                        登録数: <span class="text-white font-bold">${state.masterGachas.length}</span>
                    </div>
                    <button onclick="openGachaEditor(null)" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold transition-colors">
                        <i data-lucide="plus"></i> 新規ガチャ追加
                    </button>
                </div>

                <!-- List -->
                <div class="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-2">
                    ${state.masterGachas.map(g => `
                        <div class="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-white/5 hover:border-gold/30 transition-colors group">
                            <!-- Image Preview -->
                            <div class="w-16 h-16 rounded bg-gray-800 flex items-center justify-center overflow-hidden border border-${g.color || 'gold'}">
                                ${g.image ? `<img src="${g.image}" class="w-full h-full object-cover opacity-50">` : ''}
                                <i data-lucide="${g.icon || 'star'}" class="absolute text-${g.color || 'white'} w-8 h-8"></i>
                            </div>

                            <!-- Info -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <span class="font-bold text-white truncate text-lg">${g.name}</span>
                                    <span class="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">ID: ${g.id}</span>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex gap-2">
                                <button onclick="openGachaEditor('${g.id}')" class="p-2 hover:bg-white/10 rounded text-blue-400" title="編集">
                                    <i data-lucide="edit-2" class="w-5 h-5"></i>
                                </button>
                                ${!['weapon', 'material', 'gold'].includes(g.id) ? `
                                <button onclick="deleteGacha('${g.id}')" class="p-2 hover:bg-white/10 rounded text-red-400" title="削除">
                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                </button>
                                ` : `
                                <div class="p-2 text-gray-600 cursor-not-allowed" title="デフォルトガチャは削除できません">
                                    <i data-lucide="lock" class="w-5 h-5"></i>
                                </div>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function deleteGacha(id) {
    if (!confirm("本当にこのガチャを削除しますか？\n(紐づくアイテムは表示されなくなりますが、ユーザーの所持品からは消えません)")) return;

    state.masterGachas = state.masterGachas.filter(g => g.id !== id);
    saveMasterGachas();
    renderGachaManager();
}

function openGachaEditor(id) {
    const gacha = id ? state.masterGachas.find(g => g.id === id) : {
        id: '',
        name: '',
        icon: 'star',
        color: 'white',
        image: ''
    };

    const isNew = !id;
    const isDefault = ['weapon', 'material', 'gold'].includes(gacha.id);

    modalContainer.innerHTML = `
        <div class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div class="bg-rpg-dark border border-gold/40 w-full max-w-2xl rounded-xl shadow-2xl animate-fade-in-up">
                <div class="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 class="text-xl font-fantasy text-gold">${isNew ? '新規ガチャ作成' : 'ガチャ編集'}</h2>
                    <button onclick="renderGachaManager()" class="text-gray-400 hover:text-white"><i data-lucide="x"></i></button>
                </div>

                <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2 md:col-span-1">
                            <label class="block text-xs text-gray-500 mb-1">ガチャ名</label>
                            <input type="text" id="edit-gacha-name" value="${gacha.name}" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white focus:border-gold outline-none" placeholder="例: 防具ガチャ">
                        </div>
                        <div class="col-span-2 md:col-span-1">
                            <label class="block text-xs text-gray-500 mb-1">ID (英数字)</label>
                            <input type="text" id="edit-gacha-id" value="${gacha.id}" ${!isNew ? 'disabled' : ''} class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white focus:border-gold outline-none ${!isNew ? 'opacity-50 cursor-not-allowed' : ''}" placeholder="例: armor">
                            ${isNew ? '<p class="text-[10px] text-gray-500 mt-1">※作成後に変更することはできません</p>' : ''}
                        </div>

                        <div>
                            <label class="block text-xs text-gray-500 mb-1">アイコン (Lucideアイコン名)</label>
                            <input type="text" id="edit-gacha-icon" value="${gacha.icon}" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white focus:border-gold outline-none" placeholder="例: shield">
                            <p class="text-[10px] text-gray-500 mt-1"><a href="https://lucide.dev/icons/" target="_blank" class="text-blue-400 hover:underline">アイコン一覧はこちら</a></p>
                        </div>

                        <div>
                            <label class="block text-xs text-gray-500 mb-1">テーマカラー (Tailwind色指定)</label>
                            <input type="text" id="edit-gacha-color" value="${gacha.color}" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white focus:border-gold outline-none" placeholder="例: green-500">
                        </div>

                        <div class="col-span-2">
                            <label class="block text-xs text-gray-500 mb-1">背景画像 URL</label>
                            <input type="text" id="edit-gacha-image" value="${gacha.image}" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white focus:border-gold outline-none" placeholder="https://...">
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                        <button onclick="renderGachaManager()" class="px-4 py-2 rounded text-gray-400 hover:text-white transition-colors">キャンセル</button>
                        <button onclick="saveGacha('${gacha.id}', ${isNew})" class="btn-primary px-6 py-2 rounded shadow-lg">保存する</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function saveGacha(oldId, isNew) {
    const name = document.getElementById('edit-gacha-name').value;
    const id = isNew ? document.getElementById('edit-gacha-id').value : oldId;
    const icon = document.getElementById('edit-gacha-icon').value || 'star';
    const color = document.getElementById('edit-gacha-color').value || 'white';
    const image = document.getElementById('edit-gacha-image').value;

    if (!name || !id) return alert("ガチャ名とIDは必須です");
    if (!/^[a-zA-Z0-9_]+$/.test(id)) return alert("IDは半角英数字とアンダースコアのみ使用できます");

    if (isNew && state.masterGachas.some(g => g.id === id)) {
        return alert("このIDは既に使われています");
    }

    const newGacha = { id, name, icon, color, image };

    if (isNew) {
        state.masterGachas.push(newGacha);
        if (!state.masterItems[id]) {
            state.masterItems[id] = [];
        }
    } else {
        const index = state.masterGachas.findIndex(g => g.id === id);
        if (index >= 0) {
            state.masterGachas[index] = newGacha;
        }
    }

    saveMasterGachas();
    saveMasterState(); // To save new empty item arrays if created
    alert("保存しました！");
    renderGachaManager();
}

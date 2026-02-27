// app.js - Main Logic

// --- State Management ---

const INITIAL_GOLD = 500;
const GACHA_COST = 100;
const STORAGE_KEY = 'gacha_rpg_vanilla';

// Simple State
let state = {
    users: [],
    currentUser: null,
    view: 'login', // 'login', 'dashboard', 'gacha'
    modal: null // 'parentMode', 'transfer', 'gachaResult'
};

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
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: state.users }));
    render();
}

// --- Logic ---

function login(username, password) {
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) {
        state.currentUser = user;
        state.view = 'dashboard';
        render();
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
    state.currentUser = newUser;
    state.view = 'dashboard';
    saveState();
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
    let pool = [];
    if (type === 'weapon') pool = WEAPON_POOL;
    if (type === 'material') pool = MATERIAL_POOL;
    if (type === 'gold') pool = GOLD_POOL;

    // Weighted Random
    const rand = Math.random() * 100;
    let rarityTarget = 1;
    if (rand < 5) rarityTarget = 5;
    else if (rand < 20) rarityTarget = 4;
    else if (rand < 50) rarityTarget = 3;
    else if (rand < 80) rarityTarget = 2;
    else rarityTarget = 1;

    const candidates = pool.filter(i => i.rarity === rarityTarget);
    const item = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : pool[0];

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
                                    ${item.type === 'weapon' ? '⚔️' : item.type === 'material' ? '🧱' : '💰'}
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
    if (type === 'weapon') return '武器';
    if (type === 'material') return '素材';
    if (type === 'gold') return '財宝';
    return type;
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
            ${renderGachaCard('武器ガチャ', 'weapon', 'sword', 'red-500', 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=2669&auto=format&fit=crop')}
            ${renderGachaCard('素材ガチャ', 'material', 'hammer', 'blue-500', 'https://images.unsplash.com/photo-1621360841012-3f82b7c6c44f?q=80&w=2670&auto=format&fit=crop')}
            ${renderGachaCard('ゴールドガチャ', 'gold', 'coins', 'yellow-500', 'https://images.unsplash.com/photo-1629814493203-9d41334c2225?q=80&w=2670&auto=format&fit=crop')}
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

    // Show Loading
    modalContainer.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl pointer-events-auto";
    modalContainer.innerHTML = `
        <div class="flex flex-col items-center">
            <div class="w-32 h-32 rounded-full border-4 border-t-transparent border-gold mb-8 animate-spin"></div>
            <h2 class="text-3xl font-fantasy text-gradient-gold tracking-widest uppercase animate-pulse">召喚中...</h2>
        </div>
    `;

    setTimeout(() => {
        const item = pullGacha(type);
        renderGachaResult(item);
    }, 2500);
}

function renderGachaResult(item) {
    modalContainer.innerHTML = `
        <div class="absolute inset-0 bg-gradient-radial from-gold/10 to-transparent pointer-events-none animate-pulse"></div>
        <div class="relative z-10 flex flex-col items-center text-center animate-bounce-in">
            <div class="mb-8 relative transform transition-all duration-700 scale-100">
                 <div class="w-48 h-48 rounded-2xl flex items-center justify-center text-8xl shadow-[0_0_100px_rgba(255,215,0,0.3)] ${getRarityGradient(item.rarity)}">
                    ${item.type === 'weapon' ? '⚔️' : item.type === 'material' ? '🧱' : '💰'}
                 </div>
                 <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
                    ${'<i data-lucide="star" class="w-8 h-8 text-yellow-400 fill-current drop-shadow-lg"></i>'.repeat(item.rarity)}
                 </div>
            </div>
            <h2 class="text-4xl md:text-6xl font-fantasy mb-4 px-4 text-white drop-shadow-xl ${item.rarity === 5 ? 'animate-pulse text-gold' : ''}">${item.name}</h2>
            <p class="text-gray-400 text-lg mb-8 font-fantasy tracking-widest uppercase">${getItemTypeJA(item.type)} • ${item.description || (item.value ? `価値: ${item.value}G` : 'レアアイテム')}</p>
            <button onclick="closeModal()" class="btn-primary px-12 py-4 text-xl flex items-center gap-2">
                <i data-lucide="x" class="w-6 h-6"></i> 閉じる
            </button>
        </div>
    `;
    lucide.createIcons();
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
    if (pin === '1234') {
        const content = document.getElementById('parent-content');
        content.innerHTML = `
            <div class="space-y-4">
                <select id="parent-user-select" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white">
                    <option value="">対象の冒険者を選択</option>
                    ${window.tempUserOptions}
                </select>
                <input type="number" id="parent-amount" value="500" class="w-full bg-black/50 border border-gray-600 rounded p-2 text-white">
                <button onclick="execAddGold()" class="w-full btn-primary py-2">ゴールドを追加</button>
            </div>
        `;
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
        alert("送金しました！");
        closeModal();
    } else {
        alert("所持金が足りないか、エラーが発生しました");
    }
}

// --- Init ---
loadState();
render();

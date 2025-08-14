class Storage {
    constructor() {
        this.storage = {};
        this.cache = [];
    }
    
    store(key, value) {
        this.storage[key] = value;
        this.updateVisualization();
    }
    
    load(key) {
        const warm = this.cache.includes(key);
        if (!warm) {
            this.cache.push(key);
        }
        const value = this.storage.hasOwnProperty(key) ? this.storage[key] : 0;
        this.updateVisualization();
        return { warm, value };
    }
    
    clear() {
        this.storage = {};
        this.cache = [];
        this.updateVisualization();
    }
    
    updateVisualization() {
        this.updateStorageSlots();
        this.updateCache();
    }
    
    updateStorageSlots() {
        const container = document.getElementById('storageSlots');
        const keys = Object.keys(this.storage);
        
        if (keys.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #7f8c8d; padding: 20px;">No data stored yet. Try storing a value!</div>';
            return;
        }
        
        container.innerHTML = keys.map(key => {
            const isWarm = this.cache.includes(parseInt(key));
            const statusClass = isWarm ? 'warm' : 'cold';
            const statusText = isWarm ? 'warm' : 'cold';
            const statusTextClass = isWarm ? 'warm-status' : 'cold-status';
            
            return `
                <div class="storage-slot ${statusClass}">
                    <span class="slot-key">Key: ${key}</span>
                    <span class="slot-value">${this.storage[key]}</span>
                    <span class="slot-status ${statusTextClass}">${statusText}</span>
                </div>
            `;
        }).join('');
    }
    
    updateCache() {
        const container = document.getElementById('cacheItems');
        
        if (this.cache.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #7f8c8d; padding: 20px; width: 100%;">Cache is empty. Load some values to warm them up!</div>';
            return;
        }
        
        container.innerHTML = this.cache.map(key => 
            `<div class="cache-item">Key: ${key}</div>`
        ).join('');
    }
}

const storage = new Storage();

function storeValue() {
    const key = parseInt(document.getElementById('keyInput').value);
    const value = parseInt(document.getElementById('valueInput').value);
    
    if (isNaN(key) || isNaN(value)) {
        showResult('❌ Please enter valid numbers for both key and value');
        return;
    }
    
    storage.store(key, value);
    showResult(`✅ Stored value ${value} at key ${key}`);
    updateExplanation(`Value ${value} has been stored at storage slot ${key}. The slot will be marked as warm when first accessed.`);
}

function loadValue() {
    const key = parseInt(document.getElementById('keyInput').value);
    
    if (isNaN(key)) {
        showResult('❌ Please enter a valid key number');
        return;
    }
    
    const result = storage.load(key);
    const gasIndicator = result.warm ? 
        '<span class="gas-indicator low-gas">Low Gas</span>' : 
        '<span class="gas-indicator high-gas">High Gas</span>';
        
    showResult(`📖 Key: ${key} → Value: ${result.value} | ${result.warm ? '🔥 WARM' : '❄️ COLD'} ${gasIndicator}`);
    
    const gasExplanation = result.warm ? 
        'This was a warm access - costs less gas since the slot was accessed before.' :
        'This was a cold access - costs more gas since it\'s the first time accessing this slot.';
        
    updateExplanation(`Loaded value ${result.value} from storage slot ${key}. ${gasExplanation}`);
}

function clearStorage() {
    storage.clear();
    showResult('🗑️ Storage and cache cleared');
    updateExplanation('All storage slots and cache have been cleared. Ready for new operations!');
}

function showResult(message) {
    document.getElementById('result').innerHTML = message;
}

function updateExplanation(message) {
    const explanation = document.getElementById('explanation');
    explanation.innerHTML = `
        <strong>💡 Current Operation:</strong><br>
        ${message}<br><br>
        <strong>Key Concepts:</strong><br>
        • <strong>Cold access:</strong> First time accessing costs more gas<br>
        • <strong>Warm access:</strong> Subsequent accesses cost less gas<br>
        • <strong>Cache:</strong> Tracks which slots have been accessed<br>
        • <strong>Default value:</strong> Unset storage slots return 0
    `;
}
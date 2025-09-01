document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);

async function loadOptions() {
    const config = await chrome.storage.sync.get({
        proxyHost: '',
        proxyPort: 1080,
        proxyType: 'socks5',
        websites: []
    });
    
    document.getElementById('proxyHost').value = config.proxyHost;
    document.getElementById('proxyPort').value = config.proxyPort;
    document.getElementById('proxyType').value = config.proxyType;
    document.getElementById('websites').value = config.websites.join('\n');
}

async function saveOptions() {
    const websites = document.getElementById('websites').value
        .split('\n')
        .map(site => site.trim())
        .filter(site => site.length > 0);
    
    const config = {
        proxyHost: document.getElementById('proxyHost').value,
        proxyPort: parseInt(document.getElementById('proxyPort').value),
        proxyType: document.getElementById('proxyType').value,
        websites: websites
    };
    
    try {
        await chrome.storage.sync.set(config);
        showStatus('Settings saved successfully!', 'success');
    } catch (error) {
        showStatus('Error saving settings: ' + error.message, 'error');
    }
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = type;
    status.style.display = 'block';
    
    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}
document.addEventListener('DOMContentLoaded', loadPopup);
document.getElementById('toggleBtn').addEventListener('click', toggleDomain);
document.getElementById('optionsBtn').addEventListener('click', openOptions);

async function loadPopup() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const config = await chrome.storage.sync.get({
        proxyHost: '',
        proxyPort: 1080,
        proxyType: 'socks5',
        websites: []
    });
    
    const domain = extractDomain(tab.url);
    const isProxied = config.websites.includes(domain);
    
    document.getElementById('currentDomain').textContent = domain || 'Unknown';
    document.getElementById('proxyHost').textContent = config.proxyHost;
    document.getElementById('proxyType').textContent = config.proxyType.toUpperCase();
    document.getElementById('websiteCount').textContent = config.websites.length;
    
    const domainStatus = document.getElementById('domainStatus');
    const toggleBtn = document.getElementById('toggleBtn');
    
    if (isProxied) {
        domainStatus.textContent = 'Using Proxy';
        domainStatus.className = 'domain-status proxied';
        toggleBtn.textContent = 'Remove from Proxy';
    } else {
        domainStatus.textContent = 'Not Using Proxy';
        domainStatus.className = 'domain-status not-proxied';
        toggleBtn.textContent = 'Add to Proxy';
    }
}

function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return getTopLevelDomain(urlObj.hostname);
    } catch {
        return '';
    }
}

function getTopLevelDomain(hostname) {
    // Split hostname into parts
    const parts = hostname.split('.');
    
    // Handle special cases and common TLDs
    if (parts.length <= 2) {
        return hostname; // Already a top-level domain like "google.com"
    }
    
    // For 3+ parts, check for common second-level domains
    const lastTwo = parts.slice(-2).join('.');
    const commonSLDs = ['co.uk', 'com.au', 'co.jp', 'co.nz', 'co.za', 'com.br', 'com.mx'];
    
    if (commonSLDs.includes(lastTwo)) {
        // Return domain.co.uk format
        return parts.slice(-3).join('.');
    }
    
    // Default: return last two parts (domain.com)
    return lastTwo;
}

async function toggleDomain() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const config = await chrome.storage.sync.get({
        proxyHost: '',
        proxyPort: 1080,
        proxyType: 'socks5',
        websites: []
    });
    
    const domain = extractDomain(tab.url);
    if (!domain) {
        showStatus('Cannot get domain from this page');
        return;
    }
    
    const websites = [...config.websites];
    const domainIndex = websites.indexOf(domain);
    
    if (domainIndex > -1) {
        websites.splice(domainIndex, 1);
        showStatus(`Removed ${domain} from proxy (affects all subdomains)`);
    } else {
        websites.push(domain);
        showStatus(`Added ${domain} to proxy (includes all subdomains)`);
    }
    
    const newConfig = { ...config, websites };
    await chrome.storage.sync.set(newConfig);
    
    setTimeout(() => {
        loadPopup();
    }, 500);
}

function openOptions() {
    chrome.runtime.openOptionsPage();
}

function showStatus(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    setTimeout(() => {
        status.textContent = '';
    }, 2000);
}
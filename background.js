chrome.runtime.onStartup.addListener(initializeProxy);
chrome.runtime.onInstalled.addListener(initializeProxy);

async function initializeProxy() {
  console.log('🔄 Initializing Proxifier extension...');
  
  const config = await getProxyConfig();
  console.log('Current config:', config);
  
  if (config.websites.length > 0 && config.proxyHost) {
    await setProxyConfiguration(config);
  } else {
    await disableProxy();
  }
  
  // Force icon update on startup
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      console.log('Updating icon for current tab:', tab.url);
      await updateIcon(tab);
    } else {
      console.log('No active tab, setting default icon');
      await updateIcon(null);
    }
  } catch (error) {
    console.error('Could not update icon during initialization:', error);
    // Force set default icon
    try {
      await chrome.action.setIcon({ path: "icons/proxy_off_48.png" });
      console.log('✅ Set default fallback icon');
    } catch (fallbackError) {
      console.error('❌ Even default icon failed:', fallbackError);
    }
  }
}

async function getProxyConfig() {
  const result = await chrome.storage.sync.get({
    proxyHost: '',
    proxyPort: 1080,
    proxyType: 'socks5',
    websites: []
  });
  return result;
}

async function setProxyConfiguration(config) {
  const proxyConfig = {
    mode: "pac_script",
    pacScript: {
      data: generatePacScript(config)
    }
  };

  try {
    await chrome.proxy.settings.set({ value: proxyConfig });
    console.log('Proxy configuration set successfully');
  } catch (error) {
    console.error('Failed to set proxy configuration:', error);
  }
}

function generatePacScript(config) {
  const websites = config.websites || [];
  
  // Create checks for exact match and subdomain match
  const websiteChecks = websites.map(site => 
    `(host === "${site}" || shExpMatch(host, "*.${site}"))`
  ).join(' || ');

  let proxyString;
  if (config.proxyType === 'socks5') {
    proxyString = `SOCKS5 ${config.proxyHost}:${config.proxyPort}; SOCKS ${config.proxyHost}:${config.proxyPort}`;
  } else {
    proxyString = `PROXY ${config.proxyHost}:${config.proxyPort}`;
  }

  // Handle case where no websites are configured
  if (websites.length === 0) {
    return `
      function FindProxyForURL(url, host) {
        return "DIRECT";
      }
    `;
  }

  return `
    function FindProxyForURL(url, host) {
      if (${websiteChecks}) {
        return "${proxyString}";
      }
      return "DIRECT";
    }
  `;
}

async function disableProxy() {
  try {
    await chrome.proxy.settings.set({ value: { mode: "direct" } });
    console.log('Proxy disabled');
  } catch (error) {
    console.error('Failed to disable proxy:', error);
  }
}

async function updateIcon(tab = null) {
  let isProxied = false;
  
  if (tab) {
    const config = await getProxyConfig();
    const domain = extractDomain(tab.url);
    isProxied = config.websites.includes(domain);
    console.log(`UpdateIcon: domain=${domain}, isProxied=${isProxied}, websites=${config.websites.join(',')}`);
  }
  
  const iconPaths = isProxied ? {
    "16": "icons/proxy_on_16.png",
    "48": "icons/proxy_on_48.png",
    "128": "icons/proxy_on_128.png"
  } : {
    "16": "icons/proxy_off_16.png",
    "48": "icons/proxy_off_48.png", 
    "128": "icons/proxy_off_128.png"
  };
  
  console.log('Attempting to set icon with paths:', iconPaths);
  
  try {
    await chrome.action.setIcon({ path: iconPaths });
    console.log(`✅ Icon updated successfully: ${isProxied ? 'proxy on' : 'proxy off'}`);
  } catch (error) {
    console.error('❌ Failed to update icon:', error);
    console.error('Paths that failed:', iconPaths);
    
    // Try fallback with just one size
    try {
      const fallbackPath = isProxied ? "icons/proxy_on_48.png" : "icons/proxy_off_48.png";
      console.log('Trying fallback path:', fallbackPath);
      await chrome.action.setIcon({ path: fallbackPath });
      console.log('✅ Fallback icon set successfully');
    } catch (fallbackError) {
      console.error('❌ Fallback icon also failed:', fallbackError);
    }
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

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'sync') {
    const config = await getProxyConfig();
    if (config.websites.length > 0 && config.proxyHost) {
      await setProxyConfiguration(config);
    } else {
      await disableProxy();
    }
  }
});


chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  await updateIcon(tab);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    await updateIcon(tab);
  }
});


# Proxifier Chrome Extension

A Chrome extension that forces proxy usage for specified websites using your SOCKS5/HTTP proxy server.

## Features

- Manifest V3 compatible
- SOCKS5 and HTTP proxy support
- Per-website proxy configuration with automatic subdomain matching
- Domain-based toggle functionality via popup
- Cross-browser settings synchronization
- Visual icon indicators with custom 'P' design
- Organized icon assets in dedicated folder
- Simplified interface - no enable/disable switches

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this directory
4. The extension should now appear in your extensions list

## Configuration

1. Click the Proxifier icon in your Chrome toolbar
2. Click "Open Settings" or right-click the extension icon and select "Options"
3. Configure your proxy settings:
   - **Proxy Host**: `vps.j4.gl` (default)
   - **Proxy Port**: `1080` (default for SOCKS5)
   - **Proxy Type**: Choose between SOCKS5 or HTTP
   - **Target Websites**: Add websites (one per line) that should use the proxy

## Initial Setup Required

1. **Configure Proxy**: Go to Options → Enter your proxy server details
   - **Host**: Your proxy server address
   - **Port**: Your proxy server port (default: 1080)
   - **Type**: Choose SOCKS5 or HTTP
2. **Add Domains**: Enter top-level domains (subdomains included automatically)

## Testing

1. **Setup**: First configure your proxy in Options
2. Navigate to any website (e.g., `https://google.com`)
3. Click the Proxifier extension icon → Click "Add to Proxy"
4. Icon should turn blue and traffic routes through proxy
5. Click "Remove from Proxy" → Icon turns gray, direct connection
6. Test by visiting websites to verify proxy routing

## Usage

- **Popup Toggle**: Click the extension icon to open popup, then click "Add to Proxy"/"Remove from Proxy"
- **Visual Feedback**: Icon changes immediately based on current domain's proxy status
  - Gray icon with 'P': Current domain not using proxy
  - Blue icon with 'P': Current domain using proxy
- **Always-On Proxy**: Proxy is automatically enabled when domains are in the list (no manual on/off)
- **Settings**: Right-click extension icon → Options for detailed configuration
- **Domain Management**: Add/remove domains via popup or options page
- **Smart Subdomain Handling**: Adding `j4.gl` automatically includes `cdn.j4.gl`, `api.j4.gl`, etc.

## How It Works

The extension uses Chrome's proxy API with PAC (Proxy Auto-Configuration) scripts to route traffic for specified websites through your proxy server while allowing direct connections for other sites.

## Subdomain Matching

The extension automatically extracts top-level domains and applies proxy settings to all subdomains:

- **Visit** `cdn.j4.gl` → **Adds** `j4.gl` to proxy list
- **Applies to**: `j4.gl`, `api.j4.gl`, `cdn.j4.gl`, `www.j4.gl`, etc.
- **Visit** `maps.google.com` → **Adds** `google.com` to proxy list  
- **Applies to**: `google.com`, `maps.google.com`, `drive.google.com`, `mail.google.com`, etc.

**Special Handling**: Recognizes common country domains like `.co.uk`, `.com.au`, etc.

## Permissions

- **proxy**: Required to configure proxy settings
- **storage**: Store extension settings
- **activeTab**: Access to test functionality
- **declarativeNetRequest**: Enhanced network request handling
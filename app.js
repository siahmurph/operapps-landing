// ─── App Definitions ──────────────────────────────────────────────────────────
const APPS = [
  {
    key: 'fido',
    name: 'FiDO 2.0',
    desc: 'File Delivery Operations — submit files to Vantage for encoding and delivery.',
    path: '/fido/',
    icon: 'bi-camera-reels-fill',
    color: '#3b82f6'
  },
  {
    key: 'sandpiper',
    name: 'Sandpiper',
    desc: 'Playlist and schedule management.',
    path: '/sandpiper/',
    icon: 'bi-music-note-beamed',
    color: '#8b5cf6'
  },
  {
    key: 'parouter',
    name: 'PA Router',
    desc: 'Public affairs program routing — manage series prefixes and destinations.',
    path: '/parouter/',
    icon: 'bi-diagram-3-fill',
    color: '#10b981'
  },
  {
    key: 'purgomatic',
    name: 'Purge-O-Matic',
    desc: 'Automated purge job configuration and monitoring.',
    path: '/purgeomatic/',
    icon: 'bi-trash3-fill',
    color: '#ef4444'
  },
  {
    key: null,
    name: 'VanManager',
    desc: 'Vantage workflow controls — enable or disable workflows.',
    path: '/vanmanage/',
    icon: 'bi-sliders',
    color: '#0d6efd'
  },
  {
    key: null,
    name: 'Crusher',
    desc: 'App maintenance control panel — toggle maintenance mode for any app.',
    path: '/crusher/',
    icon: 'bi-wrench-adjustable-circle-fill',
    color: '#f97316'
  }
]

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initTheme()
  const [status, containers] = await Promise.all([loadStatus(), loadContainerStatuses()])
  renderTiles(status, containers)
})

async function loadStatus () {
  try {
    const res = await fetch('/crusher/status.json', { cache: 'no-store' })
    return res.ok ? await res.json() : {}
  } catch {
    return {}
  }
}

async function pingApp (path) {
  const ctrl = new AbortController()
  const tid = setTimeout(() => ctrl.abort(), 5000)
  try {
    const res = await fetch(path, { method: 'HEAD', cache: 'no-store', signal: ctrl.signal })
    return res.status < 500 ? 'online' : 'offline'
  } catch {
    return 'offline'
  } finally {
    clearTimeout(tid)
  }
}

async function loadContainerStatuses () {
  const results = {}
  await Promise.all(
    APPS.map(async app => {
      results[app.path] = await pingApp(app.path)
    })
  )
  return results
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderTiles (status, containers = {}) {
  const grid = document.getElementById('tile-grid')
  grid.innerHTML = APPS.map(app => {
    const s = app.key ? status[app.key] : null
    const isDown = s?.enabled === true
    const statusDot = s == null ? 'unknown' : isDown ? 'maintenance' : 'live'
    const statusTxt = s == null ? '' : isDown ? 'Maintenance' : 'Live'
    const cState = containers[app.path]
    const cClass = cState === 'online' ? 'is-online' : cState === 'offline' ? 'is-offline' : 'is-checking'
    const cDot = cState === 'online' ? 'live' : cState === 'offline' ? 'maintenance' : 'unknown'
    const cLabel = cState === 'online' ? 'Online' : cState === 'offline' ? 'Offline' : '…'

    return `
      <div class="col-12 col-sm-6 col-lg-4">
        <a href="${app.path}" class="app-tile card border shadow-sm h-100 ${
      isDown ? 'is-down' : ''
    }">
          <div class="card-body d-flex flex-column gap-3 p-4">
            <div class="d-flex align-items-start justify-content-between">
              <i class="bi ${app.icon} tile-icon" style="color: ${
      app.color
    };"></i>
              ${
                statusTxt
                  ? `
              <div class="d-flex align-items-center gap-2 mt-1">
                <div class="status-dot ${statusDot}"></div>
                <span class="status-label">${statusTxt}</span>
              </div>`
                  : ''
              }
            </div>
            <div>
              <div class="tile-name mb-1">${app.name}</div>
              <div class="tile-desc">${app.desc}</div>
            </div>
            <div class="mt-auto pt-2 d-flex align-items-center justify-content-between">
              <span class="text-secondary" style="font-size: 0.75rem; opacity: 0.5;">${
                app.path
              }</span>
              <span class="container-badge ${cClass}"><span class="status-dot ${cDot}"></span>${cLabel}</span>
            </div>
          </div>
        </a>
      </div>`
  }).join('')
}

// ─── Theme ────────────────────────────────────────────────────────────────────
function initTheme () {
  const stored = localStorage.getItem('operapps-theme') || 'dark'
  setTheme(stored)
  document.getElementById('theme-toggle').addEventListener('click', () => {
    setTheme(
      document.documentElement.getAttribute('data-bs-theme') === 'dark'
        ? 'light'
        : 'dark'
    )
  })
}

function setTheme (theme) {
  document.documentElement.setAttribute('data-bs-theme', theme)
  localStorage.setItem('operapps-theme', theme)
  document.getElementById('theme-icon').className =
    theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill'
}

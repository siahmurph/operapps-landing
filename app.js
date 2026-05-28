// ─── App Definitions ──────────────────────────────────────────────────────────
const APPS = [
  {
    key: 'fido',
    name: 'FiDO 2.0',
    desc: 'File Delivery Operations — submit files to Vantage for encoding and delivery.',
    path: '/fido/',
    icon: 'bi-camera-reels-fill',
    color: '#3b82f6',
    stackAliases: ['fido', 'fido2', 'fido2.0']
  },
  {
    key: 'sandpiper',
    name: 'Sandpiper',
    desc: 'Playlist and schedule management.',
    path: '/sandpiper/',
    icon: 'bi-music-note-beamed',
    color: '#8b5cf6',
    stackAliases: ['sandpiper', 'sandpiper-op2']
  },
  {
    key: 'parouter',
    name: 'PA Router',
    desc: 'Public affairs program routing — manage series prefixes and destinations.',
    path: '/parouter/',
    icon: 'bi-diagram-3-fill',
    color: '#10b981',
    stackAliases: ['parouter']
  },
  {
    key: 'purgomatic',
    name: 'Purge-O-Matic',
    desc: 'Automated purge job configuration and monitoring.',
    path: '/purgeomatic/',
    icon: 'bi-trash3-fill',
    color: '#ef4444',
    stackAliases: ['purgeomatic', 'purgomatic']
  },
  {
    key: null,
    name: 'VanManager',
    desc: 'Vantage workflow controls — enable or disable workflows.',
    path: '/vanmanage/',
    icon: 'bi-sliders',
    color: '#0d6efd',
    stackAliases: ['vanmanager']
  },
  {
    key: null,
    name: 'Crusher',
    desc: 'App maintenance control panel — toggle maintenance mode for any app.',
    path: '/crusher/',
    icon: 'bi-wrench-adjustable-circle-fill',
    color: '#f97316',
    stackAliases: ['crusher']
  }
]

function getStackData (app, stacks) {
  if (!app.stackAliases?.length) return null

  for (const stackName of app.stackAliases) {
    if (stacks[stackName]) return stacks[stackName]
  }

  return null
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initTheme()
  const [status, stacks] = await Promise.all([
    loadStatus(),
    loadStackStatuses()
  ])
  renderTiles(status, stacks)
})

async function loadStatus () {
  try {
    const res = await fetch('/crusher/status.json', { cache: 'no-store' })
    return res.ok ? await res.json() : {}
  } catch {
    return {}
  }
}

async function loadStackStatuses () {
  try {
    const res = await fetch('/crusher/api/stacks', { cache: 'no-store' })
    return res.ok ? await res.json() : {}
  } catch {
    return {}
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderTiles (status, stacks = {}) {
  const grid = document.getElementById('tile-grid')
  grid.innerHTML = APPS.map(app => {
    const s = app.key ? status[app.key] : null
    const isDown = s?.enabled === true
    const statusDot = s == null ? 'unknown' : isDown ? 'maintenance' : 'live'
    const statusTxt = s == null ? '' : isDown ? 'Maintenance' : 'Live'
    const stackData = getStackData(app, stacks)
    const stackHtml = stackData
      ? (() => {
          const { running, total } = stackData
          const dotClass =
            running === total
              ? 'live'
              : running === 0
              ? 'maintenance'
              : 'partial'
          return `<span class="stack-count"><span class="status-dot ${dotClass}"></span>${running} / ${total}</span>`
        })()
      : ''

    return `
      <div class="col-12 col-sm-6 col-lg-4">
        <a href="${app.path}" class="app-tile card border shadow-sm h-100 ${
      isDown ? 'is-down' : ''
    }" target="_blank" rel="noopener noreferrer">
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
              ${stackHtml}
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

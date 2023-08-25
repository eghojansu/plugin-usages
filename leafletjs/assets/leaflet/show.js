((doc, L) => {
  const docReady = fn => {
    if (doc.readyState === "complete" || doc.readyState === "interactive") {
      // call on next available tick
      setTimeout(fn, 1);
    } else {
        doc.addEventListener("DOMContentLoaded", fn);
    }
  }
  const leafletGetOptions = (dom, map) => Object.keys(dom.dataset)
    .filter(Boolean)
    .map(option => [option, map && option in map ? map[option] : option])
    .reduce((options, [option, name]) => ({
      ...options,
      [name]: dom.dataset[option],
    }), {})
  const leafletGetSource = source => fetch(source, {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    }).then(response => response.ok ? response.json() : {})
  const leafletShow = (dom, {
    createMarkerPopup,
    source,
    zoom = 5,
    center = [-0.8633111881255454, 118.37866948699072],
    markers: defaultMarkers = [
      {
        lat: -6.86742,
        lng: 109.1379,
        title: 'Marker 1',
      },
      {
        lat: -6.8681937,
        lng: 109.1224783,
        title: 'Marker 2',
      },
    ],
    ...leafletOptions
  } = {}) => {
    const options = {
      center,
      zoom,
      maxZoom: 18,
      gestureHandling: true,
      ...leafletOptions
    }
    const createMarkerPopupDefault = ({ title }) => `<div class="">
        <h4>${title}</h4>
    </div>`
    const loadMap = (markers = defaultMarkers) => {
      const map = L.map(dom, options)
      const markersLayer = L.markerClusterGroup ? L.markerClusterGroup() : L.layerGroup()
      const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })

      markersLayer.addTo(map)
      tileLayer.addTo(map)

      markers.forEach(({ lat, lng, ...marker }) => {
        if (!lat && !lng) {
          return
        }

        const content = (createMarkerPopup || createMarkerPopupDefault)(marker)

        L.marker([lat, lng]).addTo(markersLayer).bindPopup(content, {})
      })
    }

    if (source) {
      leafletGetSource(source).then(({ markers, center, zoom }) => {
        if (center) {
          options.center = center
        }

        if (zoom && zoom != options.zoom) {
          options.zoom = zoom
        }

        loadMap(markers)
      }).catch(() => {
        // see anything?
      })
    } else {
      loadMap()
    }
  }
  const leafletStart = (selectors, mapOptions) => document.querySelectorAll(selectors)
    .forEach(dom => leafletShow(dom, leafletGetOptions(dom, mapOptions)))

  docReady(() => leafletStart('[data-leaflet]', { source: 'leaflet' }))
})(document, L)

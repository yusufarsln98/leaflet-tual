export interface FreeTileLayer {
  id: string
  name: string
  category: string
  url: string
  subdomains: string
  attribution: string
  maxZoom?: number
}

export const FREE_TILE_LAYERS: FreeTileLayer[] = [
  {
    id: 'esri-dark',
    name: 'Dark Gray Canvas',
    category: 'Esri Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    subdomains: '',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
  },
  {
    id: 'esri-light',
    name: 'Light Gray Canvas',
    category: 'Esri Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    subdomains: '',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
  },
  {
    id: 'osm',
    name: 'OpenStreetMap Standard',
    category: 'Default',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
]

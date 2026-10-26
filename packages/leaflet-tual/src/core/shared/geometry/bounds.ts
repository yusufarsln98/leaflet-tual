import type { Bounds, Item } from '../../types/index.js'
import { getPenGeometryPoints } from '../../entities/pen/pen-geometry.js'

export function bounds(item: Item): Bounds {
  switch (item.type) {
    case 'arrow': {
      const lats = [item.from.lat, item.to.lat]
      const lngs = [item.from.lng, item.to.lng]
      if (item.via) {
        lats.push(item.via.lat)
        lngs.push(item.via.lng)
      }
      return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
      }
    }
    case 'ruler': {
      return {
        minLat: Math.min(item.from.lat, item.to.lat),
        maxLat: Math.max(item.from.lat, item.to.lat),
        minLng: Math.min(item.from.lng, item.to.lng),
        maxLng: Math.max(item.from.lng, item.to.lng),
      }
    }
    case 'shape':
    case 'note': {
      const delta = 0.001
      return {
        minLat: item.at.lat - delta,
        maxLat: item.at.lat + delta,
        minLng: item.at.lng - delta,
        maxLng: item.at.lng + delta,
      }
    }
    case 'freedraw': {
      if (item.points.length === 0) {
        return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }
      }
      const lats = item.points.map((p) => p.lat)
      const lngs = item.points.map((p) => p.lng)
      return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
      }
    }
    case 'pen': {
      const points = getPenGeometryPoints(item)
      if (points.length === 0) {
        return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }
      }
      const lats = points.map((p) => p.lat)
      const lngs = points.map((p) => p.lng)
      return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
      }
    }
    case 'text': {
      const delta = 0.0005
      return {
        minLat: item.at.lat - delta,
        maxLat: item.at.lat + delta,
        minLng: item.at.lng - delta,
        maxLng: item.at.lng + delta,
      }
    }
  }
}

/**
 * OASIS HYDRO SUITE — SIG & Cartographie Interactive Réelle
 * Moteur cartographique Leaflet avec tuiles réelles, couches de bassins et ouvrages géoréférencés
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Maximize2,
  Share2,
  Ruler,
  Eye,
  EyeOff,
  MapPin,
  Navigation,
  Info
} from 'lucide-react';
import { Project, Watershed, HydraulicStructure } from '../../types/oasis';
import { exportProjectToGeoJson } from '../../services/storageService';

interface GisMapProps {
  project: Project;
  onSelectStructure?: (structure: HydraulicStructure) => void;
  onSelectWatershed?: (watershed: Watershed) => void;
}

export const GisMap: React.FC<GisMapProps> = ({
  project,
  onSelectStructure,
  onSelectWatershed
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);

  const [activeBaseLayer, setActiveBaseLayer] = useState<'osm' | 'satellite' | 'topo'>('osm');
  const [showWatersheds, setShowWatersheds] = useState<boolean>(true);
  const [showStructures, setShowStructures] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'structure' | 'watershed';
    data: any;
  } | null>(null);
  const [measuringMode, setMeasuringMode] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([]);
  const [measureDistanceM, setMeasureDistanceM] = useState<number>(0);

  const measurePolylineRef = useRef<L.Polyline | null>(null);

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix pour les icônes Leaflet avec Webpack/Vite
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });

    // Centrage initial sur le projet
    const map = L.map(mapContainerRef.current, {
      center: [43.63, 1.48],
      zoom: 12,
      zoomControl: false
    });

    // Contrôle de zoom en haut à droite
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Groupe de couches pour les objets vectoriels
    const featureGroup = L.featureGroup().addTo(map);
    layersGroupRef.current = featureGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Gestion du fond de carte (Tuiles réelles)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Supprimer les tuiles existantes
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl: string;
    let attribution: string;

    if (activeBaseLayer === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    } else if (activeBaseLayer === 'satellite') {
      tileUrl =
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri World Imagery';
    } else {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenTopoMap contributors';
    }

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution
    }).addTo(map);
  }, [activeBaseLayer]);

  // Rendu des polygones de bassins versants et des points d'ouvrages
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Bassins Versants (Polygones)
    if (showWatersheds) {
      project.watersheds.forEach((ws) => {
        if (ws.coordinates && ws.coordinates.length > 2) {
          const latlngs: L.LatLngTuple[] = ws.coordinates.map((pt) => [pt.lat, pt.lng]);

          const polygon = L.polygon(latlngs, {
            color: ws.color || '#0284c7',
            weight: 2.5,
            opacity: 0.9,
            fillColor: ws.color || '#0284c7',
            fillOpacity: 0.22
          });

          polygon.bindTooltip(
            `<strong>${ws.code}</strong> — ${ws.name}<br/>Surface: ${ws.areaKm2} km² · Q25: ${ws.calculatedFlows?.q25 || '-'} m³/s`,
            { permanent: false, direction: 'center', className: 'text-xs' }
          );

          polygon.on('click', () => {
            setSelectedItem({ type: 'watershed', data: ws });
            if (onSelectWatershed) onSelectWatershed(ws);
          });

          group.addLayer(polygon);
        }
      });
    }

    // 2. Ouvrages Hydrauliques (Marqueurs personnalisés)
    if (showStructures) {
      project.structures.forEach((struct) => {
        const isCompliant = struct.results?.status === 'COMPLIANT';
        const isWarning = struct.results?.status === 'WARNING';
        const markerColor = isCompliant ? '#10B981' : isWarning ? '#F59E0B' : '#EF4444';

        // Création d'une icône SVG personnalisée en fonction du statut
        const customIcon = L.divIcon({
          className: 'custom-hydro-marker',
          html: `
            <div style="
              background-color: ${markerColor};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 10px;
              font-family: monospace;
            ">
              ${struct.code.replace('OH-', '')}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([struct.position.lat, struct.position.lng], { icon: customIcon });

        const popupContent = `
          <div style="font-family: Inter, sans-serif; min-width: 200px;">
            <div style="font-weight: bold; color: #0E4A7B; font-size: 13px; margin-bottom: 2px;">
              ${struct.code} — PK ${Math.floor(struct.pkMeters / 1000)}+${String(struct.pkMeters % 1000).padStart(3, '0')}
            </div>
            <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
              ${struct.name}
            </div>
            <div style="background: #F1F5F9; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 6px;">
              <div><strong>Débit Q25 :</strong> ${struct.designFlowM3s.toFixed(2)} m³/s</div>
              <div><strong>Vitesse V :</strong> ${struct.results ? `${struct.results.flowVelocityMs.toFixed(2)} m/s` : '-'}</div>
              <div><strong>Tirant d'eau :</strong> ${struct.results ? `${struct.results.normalDepthM.toFixed(2)} m` : '-'}</div>
              <div><strong>Remplissage :</strong> ${struct.results ? `${struct.results.fillingRatioPercent.toFixed(0)}%` : '-'}</div>
            </div>
            <div style="font-size: 10px; font-weight: bold; color: ${markerColor};">
              Statut : ${struct.results?.status || 'Calculé'}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          setSelectedItem({ type: 'structure', data: struct });
          if (onSelectStructure) onSelectStructure(struct);
        });

        group.addLayer(marker);
      });
    }

    // Ajustement de la vue sur l'ensemble des données
    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [project, showWatersheds, showStructures]);

  // Mode mesure de distance sur le terrain
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!measuringMode) return;

      const newPoints = [...measurePoints, e.latlng];
      setMeasurePoints(newPoints);

      if (newPoints.length > 1) {
        let totalDist = 0;
        for (let i = 0; i < newPoints.length - 1; i++) {
          totalDist += newPoints[i].distanceTo(newPoints[i + 1]);
        }
        setMeasureDistanceM(Math.round(totalDist));
      }

      // Tracer la polyligne de mesure
      if (measurePolylineRef.current) {
        measurePolylineRef.current.remove();
      }
      measurePolylineRef.current = L.polyline(newPoints, {
        color: '#E53935',
        dashArray: '5, 8',
        weight: 3
      }).addTo(map);
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [measuringMode, measurePoints]);

  const resetMeasure = () => {
    setMeasurePoints([]);
    setMeasureDistanceM(0);
    if (measurePolylineRef.current) {
      measurePolylineRef.current.remove();
      measurePolylineRef.current = null;
    }
  };

  const fitAllBounds = () => {
    if (
      mapInstanceRef.current &&
      layersGroupRef.current &&
      layersGroupRef.current.getLayers().length > 0
    ) {
      mapInstanceRef.current.fitBounds(layersGroupRef.current.getBounds(), { padding: [40, 40] });
    }
  };

  return (
    <div className="relative h-[calc(100vh-8.5rem)] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex flex-col">
      {/* Barre d'outils cartographique supérieure */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-md border border-slate-200 text-xs">
        {/* Sélecteur de fond de carte */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveBaseLayer('osm')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeBaseLayer === 'osm'
                ? 'bg-[#0E4A7B] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            OSM Plan
          </button>
          <button
            onClick={() => setActiveBaseLayer('satellite')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeBaseLayer === 'satellite'
                ? 'bg-[#0E4A7B] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satellite HD
          </button>
          <button
            onClick={() => setActiveBaseLayer('topo')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeBaseLayer === 'topo'
                ? 'bg-[#0E4A7B] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Relief Topo
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Visibilité des couches */}
        <button
          onClick={() => setShowWatersheds(!showWatersheds)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-colors ${
            showWatersheds
              ? 'bg-sky-50 text-[#0E4A7B] border-sky-200'
              : 'bg-white text-slate-400 border-slate-200'
          }`}
        >
          {showWatersheds ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Bassins Versants ({project.watersheds.length})</span>
        </button>

        <button
          onClick={() => setShowStructures(!showStructures)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-colors ${
            showStructures
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-white text-slate-400 border-slate-200'
          }`}
        >
          {showStructures ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Ouvrages Hydrauliques ({project.structures.length})</span>
        </button>

        <div className="w-px h-5 bg-slate-200" />

        {/* Outil Mesure */}
        <button
          onClick={() => {
            const next = !measuringMode;
            setMeasuringMode(next);
            if (!next) resetMeasure();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-colors ${
            measuringMode
              ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-400/30'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Ruler className="w-3.5 h-3.5 text-red-500" />
          <span>{measuringMode ? 'Mode Mesure Actif' : 'Mesurer distance'}</span>
        </button>

        {measuringMode && (
          <div className="flex items-center gap-2 bg-red-100 text-red-900 px-2.5 py-1 rounded-lg font-mono font-bold">
            <span>
              {measureDistanceM > 1000
                ? `${(measureDistanceM / 1000).toFixed(2)} km`
                : `${measureDistanceM} m`}
            </span>
            <button
              onClick={resetMeasure}
              className="text-[10px] bg-red-200 hover:bg-red-300 text-red-800 px-1.5 py-0.5 rounded"
            >
              Effacer
            </button>
          </div>
        )}

        {/* Recadrer */}
        <button
          onClick={fitAllBounds}
          title="Recentrer sur tous les ouvrages et bassins du projet"
          className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Export GeoJSON */}
        <button
          onClick={() => exportProjectToGeoJson(project)}
          className="flex items-center gap-1 bg-[#0E4A7B] hover:bg-[#093558] text-white px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-300" />
          <span>Export GeoJSON SIG</span>
        </button>
      </div>

      {/* Conteneur de carte Leaflet réel */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Volet d'inspection latéral droit quand un élément est cliqué */}
      {selectedItem && (
        <div className="absolute right-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-5 z-[1000] overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs uppercase font-bold text-slate-400">
                {selectedItem.type === 'structure' ? 'Ouvrage Hydraulique' : 'Bassin Versant'}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {selectedItem.type === 'structure' ? (
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <div className="text-base font-bold text-[#0E4A7B] font-['Montserrat']">
                    {selectedItem.data.code}
                  </div>
                  <div className="text-slate-500 font-medium">{selectedItem.data.name}</div>
                  <div className="font-mono text-slate-400 text-[11px] mt-0.5">
                    PK {Math.floor(selectedItem.data.pkMeters / 1000)}+
                    {String(selectedItem.data.pkMeters % 1000).padStart(3, '0')}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type de profil :</span>
                    <span className="font-semibold text-slate-800">{selectedItem.data.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rugosité Strickler K :</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedItem.data.stricklerK}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pente du radier :</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {(selectedItem.data.bedSlopeMPerM * 100).toFixed(2)} %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Débit de calcul Q :</span>
                    <span className="font-mono font-bold text-[#0E4A7B]">
                      {selectedItem.data.designFlowM3s.toFixed(2)} m³/s
                    </span>
                  </div>
                </div>

                {selectedItem.data.results && (
                  <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 space-y-1.5">
                    <div className="font-bold text-[#0E4A7B] text-[11px] uppercase tracking-wider">
                      Résultats Manning-Strickler
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Hauteur normale yn :</span>
                      <span className="font-mono font-bold text-slate-900">
                        {selectedItem.data.results.normalDepthM.toFixed(3)} m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Vitesse d'écoulement V :</span>
                      <span className="font-mono font-bold text-slate-900">
                        {selectedItem.data.results.flowVelocityMs.toFixed(2)} m/s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Taux de remplissage :</span>
                      <span className="font-mono font-bold text-slate-900">
                        {selectedItem.data.results.fillingRatioPercent.toFixed(1)} %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tirant d'air restant :</span>
                      <span className="font-mono font-bold text-slate-900">
                        {selectedItem.data.results.freeboardM.toFixed(2)} m
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onSelectStructure && onSelectStructure(selectedItem.data)}
                  className="w-full py-2 bg-[#0E4A7B] hover:bg-[#00A3E0] text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center mt-2 flex items-center justify-center gap-1.5"
                >
                  <span>Résoudre dans le Solveur Hydraulique</span>
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <div className="text-base font-bold text-sky-700 font-['Montserrat']">
                    {selectedItem.data.code}
                  </div>
                  <div className="text-slate-500 font-medium">{selectedItem.data.name}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Superficie :</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedItem.data.areaKm2} km²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Longueur du thalweg :</span>
                    <span className="font-mono text-slate-800">
                      {selectedItem.data.lengthKm} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dénivelée ΔH :</span>
                    <span className="font-mono text-slate-800">{selectedItem.data.deltaH} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coefficient C :</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedItem.data.runoffCoefficient}
                    </span>
                  </div>
                </div>

                {selectedItem.data.calculatedFlows && (
                  <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 space-y-1.5">
                    <div className="font-bold text-sky-900 text-[11px] uppercase tracking-wider">
                      Débits de Crue (Méthode Rationnelle)
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Q10 (décennal) :</span>
                      <span className="font-mono font-bold text-slate-900">
                        {selectedItem.data.calculatedFlows.q10} m³/s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Q25 (projet) :</span>
                      <span className="font-mono font-bold text-[#0E4A7B]">
                        {selectedItem.data.calculatedFlows.q25} m³/s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Q100 (centennal) :</span>
                      <span className="font-mono font-bold text-red-700">
                        {selectedItem.data.calculatedFlows.q100} m³/s
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onSelectWatershed && onSelectWatershed(selectedItem.data)}
                  className="w-full py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-xl font-bold text-xs shadow-sm transition-all text-center mt-2 flex items-center justify-center gap-1.5"
                >
                  <span>Calculer dans le Moteur Hydrologique</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            Géoréférencement WGS84 standard EPSG:4326
          </div>
        </div>
      )}

      {/* Légende en bas à gauche */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-200 shadow-md text-[11px] flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm" />
          <span className="text-slate-700 font-medium">Ouvrage Conforme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm" />
          <span className="text-slate-700 font-medium">Avertissement (Vmin/Vmax)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm" />
          <span className="text-slate-700 font-medium">Non Conforme</span>
        </div>
      </div>
    </div>
  );
};

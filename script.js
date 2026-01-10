
/*****************************************************
 * 1. INITIALISATION DE LA CARTE
 *****************************************************/

const map = L.map('map').setView([48.8566, 2.3522], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);


/*****************************************************
 * 2. VARIABLES GLOBALES
 *****************************************************/

let allFeatures = [];
let geojsonLayer = null;

const activeRomans = new Set();
const activeTypes  = new Set();
const activePersos = new Set()

/*****************************************************
 * 3. POPUPS
 *****************************************************/

function onEachFeature(feature, layer) {

  const p = feature.properties;

  layer.bindPopup(`
    <strong>${p.nom}</strong><br><br>

    <strong>Roman(s)</strong><br>
    <em>${p.romans.join(', ')}</em><br><br>

    <strong>Personnage(s)</strong><br>
    ${p.personnages.join(', ')}<br><br>

    <strong>Fonction(s)</strong><br>
    ${p.type_lieu.join(', ')}<br><br>

    <em>${p.citation}</em>
  `);
}


/*****************************************************
 * 4. FILTRAGE CROISÉ (ROMANS ∧ TYPES)
 *****************************************************/

function filterFeature(feature) {

  if (activeRomans.size > 0) {
    if (!feature.properties.romans.some(r => activeRomans.has(r))) {
      return false;
    }
  }

  if (activeTypes.size > 0) {
    if (!feature.properties.type_lieu.some(t => activeTypes.has(t))) {
      return false;
    }
  }

  if (activePersos.size > 0) {
    if (!feature.properties.personnages.some(p => activePersos.has(p))) {
      return false;
    }
  }

  return true;
}



/*****************************************************
 * 5. RAFRAÎCHISSEMENT DE LA CARTE
 *****************************************************/

function updateMap() {
  geojsonLayer.clearLayers();
  geojsonLayer.addData(allFeatures);
}


/*****************************************************
 * 6. CONSTRUCTION AUTOMATIQUE DES FILTRES
 *****************************************************/
function buildFiltersUI(features) {

  const romansSet = new Set();
  const typesSet  = new Set();
  const persosSet = new Set();

  features.forEach(f => {
    f.properties.romans.forEach(r => romansSet.add(r));
    f.properties.type_lieu.forEach(t => typesSet.add(t));
    f.properties.personnages.forEach(p => persosSet.add(p));
  });

  const romansDiv = document.getElementById('filters-romans');
  const typesDiv  = document.getElementById('filters-types');
  const persosDiv = document.getElementById('filters-persos');

  romansSet.forEach(roman => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox"> ${roman}`;
    label.querySelector('input').addEventListener('change', e => {
      e.target.checked ? activeRomans.add(roman) : activeRomans.delete(roman);
      updateMap();
    });
    romansDiv.append(label, document.createElement('br'));
  });

  typesSet.forEach(type => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox"> ${type}`;
    label.querySelector('input').addEventListener('change', e => {
      e.target.checked ? activeTypes.add(type) : activeTypes.delete(type);
      updateMap();
    });
    typesDiv.append(label, document.createElement('br'));
  });

  persosSet.forEach(perso => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox"> ${perso}`;
    label.querySelector('input').addEventListener('change', e => {
      e.target.checked ? activePersos.add(perso) : activePersos.delete(perso);
      updateMap();
    });
    persosDiv.append(label, document.createElement('br'));
  });
}


/*****************************************************
 * 7. CHARGEMENT DU GEOJSON
 *****************************************************/

fetch('data/lieuxzola.geojson')
  .then(res => res.json())
  .then(data => {

    allFeatures = data.features;

    geojsonLayer = L.geoJSON(allFeatures, {
      onEachFeature: onEachFeature,
      filter: filterFeature
    }).addTo(map);

    buildFiltersUI(allFeatures);
  })

console.log('Conectado')

function toggleMenu() {
    var menuItems = document.getElementById("menuItems");
    if (menuItems.style.display === "none" || menuItems.style.display === "") {
        menuItems.style.display = "flex";
    } else {
        menuItems.style.display = "none";
    }
}

// Inicializa el mapa con varias capas base
var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> '
});

var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a><a href="http://viewfinderpanoramas.org"></a><a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/"></a>)'
});

var esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: ''
});

// Mapa inicial
var map = L.map('map', {
    center: [20, 0],
    zoom: 2,
    layers: [openStreetMap] // Capa base predeterminada
});

// Control de capas base
var baseLayers = {
    "Político": openStreetMap,
    "Relieve": openTopoMap,
    "Satelite": esriWorldImagery
};

L.control.layers(baseLayers).addTo(map);

// Definir los iconos personalizados
var seaLakeIceIcon = L.icon({
    iconUrl: 'https://cdn.prod.website-files.com/625843c6d847c8dca08551d1/642d4476e3a49459e0408053_zyro-image%20(2)%201.png',
    iconSize: [52, 57],
    iconAnchor: [16, 37],
    popupAnchor: [0, -37]
});

var fireIcon = L.icon({
    iconUrl: 'https://static.vecteezy.com/system/resources/thumbnails/017/744/774/small_2x/fire-and-flames-design-element-png.png',
    iconSize: [22, 27],
    iconAnchor: [16, 37],
    popupAnchor: [0, -37]
});

var volcanoIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1808/1808385.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

var stormIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252035.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Arrays para almacenar los marcadores mostrados en el mapa
let wildfireMarkers = [];
let seaLakeIceMarkers = [];
let volcanoMarkers = [];
let stormMarkers = [];

// Función para agregar un marcador de incendio al mapa
function addWildfireMarker(coords, title) {
    const marker = L.marker(coords, { icon: fireIcon }).bindPopup(`<strong>${title}</strong>`);
    wildfireMarkers.push(marker);
    marker.addTo(map);
}

// Función para agregar un marcador de glaciares
function addSeaLakeIceMarker(coords, title) {
    const marker = L.marker(coords, { icon: seaLakeIceIcon }).bindPopup(`<strong>${title}</strong>`);
    seaLakeIceMarkers.push(marker);
    marker.addTo(map);
}

// Función para agregar un marcador de volcán
function addVolcanoMarker(coords, title) {
    const marker = L.marker(coords, { icon: volcanoIcon }).bindPopup(`<strong>${title}</strong>`);
    volcanoMarkers.push(marker);
    marker.addTo(map);
}

// Función para agregar un marcador de tormenta severa
function addStormMarker(coords, title) {
    const marker = L.marker(coords, { icon: stormIcon }).bindPopup(`<strong>${title}</strong>`);
    stormMarkers.push(marker);
    marker.addTo(map);
}

// Función para quitar los marcadores del mapa
function clearMarkers(markersArray) {
    markersArray.forEach(marker => map.removeLayer(marker));
    markersArray.length = 0; 
}

// Función para filtrar eventos por fechas
function filterEventsByDate(events, startDate, endDate) {
    return events.filter(event => {
        const eventDate = new Date(event.geometry[0].date);
        return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
    });
}

// Solicitud a la API de EONET para obtener eventos
fetch('https://eonet.gsfc.nasa.gov/api/v3/events')
    .then(response => response.json())
    .then(data => {
        const events = data.events;

        const wildfires = events.filter(event => event.categories.some(category => category.title === "Wildfires"));
        const seaLakeIceEvents = events.filter(event => event.categories.some(category => category.title === "Sea and Lake Ice"));
        const volcanoEvents = events.filter(event => event.categories.some(category => category.title === "Volcanoes"));
        const stormEvents = events.filter(event => event.categories.some(category => category.title === "Severe Storms"));

        // Asignar eventos a los botones y filtrarlos por fechas
        const botonIncendios = document.getElementById('primero');
        const botonIcebergs = document.getElementById('segundo');
        const botonTormentas = document.getElementById('tercero');
        const botonVolcanes = document.getElementById('cuarto');
        const filterButton = document.getElementById('filter-events');

        let startDate = '';
        let endDate = '';

        // Escucha el botón de filtrar
        filterButton.addEventListener('click', () => {
            startDate = document.getElementById('start-date').value;
            endDate = document.getElementById('end-date').value;

            if (startDate && endDate) {
                console.log('Filtrando eventos entre', startDate, 'y', endDate);
                clearMarkers(wildfireMarkers);
                clearMarkers(seaLakeIceMarkers);
                clearMarkers(volcanoMarkers);
                clearMarkers(stormMarkers);
            } else {
                console.log('Por favor, selecciona un rango de fechas válido.');
            }
        });

        botonIncendios.addEventListener('click', () => {
            if (wildfireMarkers.length === 0 && startDate && endDate) {
                console.log('Mostrando incendios filtrados');
                const filteredWildfires = filterEventsByDate(wildfires, startDate, endDate);
                filteredWildfires.forEach(event => {
                    const coords = event.geometry[0].coordinates;
                    const latLng = [coords[1], coords[0]]; // Latitud y longitud
                    const title = event.title;
                    addWildfireMarker(latLng, title);
                });
            } else {
                console.log('Ocultando incendios');
                clearMarkers(wildfireMarkers);
            }
        });

        botonIcebergs.addEventListener('click', () => {
            if (seaLakeIceMarkers.length === 0 && startDate && endDate) {
                console.log('Mostrando icebergs filtrados');
                const filteredIcebergs = filterEventsByDate(seaLakeIceEvents, startDate, endDate);
                filteredIcebergs.forEach(event => {
                    const coords = event.geometry[0].coordinates;
                    const latLng = [coords[1], coords[0]]; // Latitud y longitud
                    const title = event.title;
                    addSeaLakeIceMarker(latLng, title);
                });
            } else {
                console.log('Ocultando icebergs');
                clearMarkers(seaLakeIceMarkers);
            }
        });

        botonTormentas.addEventListener('click', () => {
            if (stormMarkers.length === 0 && startDate && endDate) {
                console.log('Mostrando tormentas severas filtradas');
                const filteredStorms = filterEventsByDate(stormEvents, startDate, endDate);
                filteredStorms.forEach(event => {
                    const coords = event.geometry[0].coordinates;
                    const latLng = [coords[1], coords[0]]; // Latitud y longitud
                    const title = event.title;
                    addStormMarker(latLng, title);
                });
            } else {
                console.log('Ocultando tormentas severas');
                clearMarkers(stormMarkers);
            }
        });

        botonVolcanes.addEventListener('click', () => {
            if (volcanoMarkers.length === 0 && startDate && endDate) {
                console.log('Mostrando volcanes filtrados');
                const filteredVolcanoes = filterEventsByDate(volcanoEvents, startDate, endDate);
                filteredVolcanoes.forEach(event => {
                    const coords = event.geometry[0].coordinates;
                    const latLng = [coords[1], coords[0]]; // Latitud y longitud
                    const title = event.title;
                    addVolcanoMarker(latLng, title);
                });
            } else {
                console.log('Ocultando volcanes');
                clearMarkers(volcanoMarkers);
            }
        });
    })
    .catch(error => {
        console.error('Error al obtener los eventos de EONET:', error);
    });
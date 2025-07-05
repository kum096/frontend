document.addEventListener('DOMContentLoaded', function () {
  let map, markerLayer;

  const form = document.querySelector('form');
  const shipmentDetails = document.getElementById('shipmentDetails');
  const errorMessage = document.getElementById('errorMessage');
  const mapDiv = document.getElementById('map');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyBtn = document.getElementById('copyBtn');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const trackingNumber = this.tracking_number.value.trim();
    if (!trackingNumber) return;

    // Disable submit button while fetching
    submitBtn.disabled = true;

    // Hide previous details, errors and map
    shipmentDetails.style.display = 'none';
    errorMessage.style.display = 'none';
    mapDiv.style.display = 'none';

    try {
      const response = await fetch(`https://backend-umdv.onrender.com/api/v1/shipments/tracking/${trackingNumber}`);
      if (!response.ok) {
        throw new Error('Shipment not found');
      }
      const shipment = await response.json();

      // Fill shipment details table
      const tbody = document.getElementById('shipmentTableBody');
      tbody.innerHTML = '';

      for (const [key, value] of Object.entries(shipment)) {
        const tr = document.createElement('tr');

        const tdKey = document.createElement('td');
        tdKey.textContent = key.replace(/_/g, ' ').toUpperCase();
        tdKey.style.fontWeight = 'bold';

        const tdValue = document.createElement('td');
        // Escape commas, quotes, newlines for CSV safety
        const displayValue = value === null ? '-' : String(value);
        tdValue.textContent = displayValue;

        tr.appendChild(tdKey);
        tr.appendChild(tdValue);
        tbody.appendChild(tr);
      }

      shipmentDetails.style.display = 'block';

      // Determine coordinates for map display
      let coords = null;

      if (shipment.current_location_coords && typeof shipment.current_location_coords === 'object') {
        const lat = shipment.current_location_coords.latitude;
        const lng = shipment.current_location_coords.longitude;
        if (typeof lat === 'number' && typeof lng === 'number') {
          coords = [lng, lat]; // OpenLayers uses [lng, lat]
        }
      } else if (shipment.current_location && typeof shipment.current_location === 'string') {
        const parts = shipment.current_location.split(',').map(Number);
        if (parts.length === 2 && !parts.some(isNaN)) {
          coords = [parts[1], parts[0]]; // lat,lng to lng,lat
        }
      } else if (shipment.location_coords && Array.isArray(shipment.location_coords)) {
        if (
          shipment.location_coords.length === 2 &&
          typeof shipment.location_coords[0] === 'number' &&
          typeof shipment.location_coords[1] === 'number'
        ) {
          coords = [shipment.location_coords[1], shipment.location_coords[0]]; // lat,lng to lng,lat
        }
      }

      if (coords) {
        mapDiv.style.display = 'block';

        // Initialize map if not yet created
        if (!map) {
          map = new ol.Map({
            target: 'map',
            layers: [
              new ol.layer.Tile({
                source: new ol.source.OSM(),
              }),
            ],
            view: new ol.View({
              center: ol.proj.fromLonLat(coords),
              zoom: 13,
            }),
          });

          // Create vector layer for marker
          markerLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
          });
          map.addLayer(markerLayer);
        } else {
          // Update map view center
          map.getView().setCenter(ol.proj.fromLonLat(coords));
          map.getView().setZoom(13);
          // Clear previous marker
          markerLayer.getSource().clear();
        }

        // Add a marker feature
        const markerFeature = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat(coords)),
        });

        // Style the marker (simple red circle)
        markerFeature.setStyle(
          new ol.style.Style({
            image: new ol.style.Circle({
              radius: 8,
              fill: new ol.style.Fill({ color: 'red' }),
              stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
            }),
          })
        );

        markerLayer.getSource().addFeature(markerFeature);

        // Invalidate size / update map rendering (sometimes needed if map container was hidden)
        setTimeout(() => {
          map.updateSize();
        }, 100);
      } else {
        mapDiv.style.display = 'none';
        alert('Location data is not available for this shipment.');
      }
    } catch (error) {
      errorMessage.textContent = error.message || 'An error occurred.';
      errorMessage.style.display = 'block';
    } finally {
      // Enable submit button back after fetch completes
      submitBtn.disabled = false;
    }
  });

  downloadBtn.addEventListener('click', () => {
    const rows = document.querySelectorAll('#shipmentTableBody tr');
    if (rows.length === 0) {
      alert('No shipment details to download.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Field,Value\n';

    rows.forEach((row) => {
      const key = row.children[0].textContent.replace(/"/g, '""');
      let val = row.children[1].textContent.replace(/"/g, '""');
      // Wrap fields containing commas/newlines/quotes in double quotes
      const safeKey = /,|\n|"/.test(key) ? `"${key}"` : key;
      const safeVal = /,|\n|"/.test(val) ? `"${val}"` : val;

      csvContent += `${safeKey},${safeVal}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);

    const trackingNumber = document.querySelector('input[name="tracking_number"]').value.trim();
    link.setAttribute('download', `shipment_${trackingNumber || 'details'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  copyBtn.addEventListener('click', () => {
    const rows = document.querySelectorAll('#shipmentTableBody tr');
    if (rows.length === 0) {
      alert('No shipment details to copy.');
      return;
    }

    let textToCopy = '';
    rows.forEach((row) => {
      const key = row.children[0].textContent;
      const val = row.children[1].textContent;
      textToCopy += `${key}: ${val}\n`;
    });

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => alert('Shipment details copied to clipboard!'))
      .catch(() => alert('Failed to copy!'));
  });
});

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Users, Phone, Clock, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import userService from "../../services/userService";

// Fix for default marker icon in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Function to create custom marker with avatar and name
const createCustomMarker = (elderly) => {
  const avatarUrl = elderly.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(elderly.fullName || 'User')}&background=2196F3&color=fff&size=80`;
  const name = elderly.fullName || "N/A";
  
  const iconHtml = `
    <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
      <div style="
        background: white;
        padding: 4px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 2px solid #EF4444;
      ">
        <img 
          src="${avatarUrl}" 
          alt="${name}"
          style="
            width: 40px;
            height: 40px;
            border-radius: 8px;
            object-fit: cover;
            display: block;
          "
          onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2196F3&color=fff&size=80'"
        />
        <div style="
          background: #EF4444;
          color: white;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 4px;
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">${name}</div>
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #EF4444;
        margin-top: -1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [60, 80],
    iconAnchor: [30, 80],
    popupAnchor: [0, -80],
  });
};

// Component to handle map auto-zoom
function MapAutoZoom({ elderlyWithLocation }) {
  const map = useMap();

  useEffect(() => {
    if (elderlyWithLocation.length > 0) {
      // Get all coordinates - note: coordinates are stored as [lng, lat] but Leaflet expects [lat, lng]
      const bounds = elderlyWithLocation.map((elderly) => {
        const [lng, lat] = elderly.currentLocation.coordinates;
        return [lat, lng]; // Swap to [lat, lng] for Leaflet
      });
      
      if (bounds.length === 1) {
        // If only one elderly, zoom to that location
        map.setView(bounds[0], 16);
      } else {
        // If multiple, fit bounds to show all
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [elderlyWithLocation, map]);

  return null;
}

function AdminElderlyLocationPage() {
  const [elderlyList, setElderlyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedElderly, setSelectedElderly] = useState(null);

  useEffect(() => {
    fetchElderlyData();
  }, []);

  const fetchElderlyData = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllElderly();
      if (response.success) {
        setElderlyList(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching elderly data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredElderly = elderlyList.filter((elderly) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      elderly.fullName?.toLowerCase().includes(searchLower) ||
      elderly.phoneNumber?.includes(searchTerm) ||
      elderly.currentLocation?.address?.toLowerCase().includes(searchLower)
    );
  });

  // Get elderly with valid coordinates
  const elderlyWithLocation = elderlyList.filter(
    (elderly) =>
      elderly.currentLocation?.coordinates &&
      Array.isArray(elderly.currentLocation.coordinates) &&
      elderly.currentLocation.coordinates.length === 2 &&
      !isNaN(elderly.currentLocation.coordinates[0]) &&
      !isNaN(elderly.currentLocation.coordinates[1])
  );

  // Calculate center of map (average of all coordinates)
  const mapCenter =
    elderlyWithLocation.length > 0
      ? (() => {
          // coordinates are stored as [lng, lat], need to convert to [lat, lng]
          const avgLng = elderlyWithLocation.reduce((sum, e) => sum + e.currentLocation.coordinates[0], 0) / elderlyWithLocation.length;
          const avgLat = elderlyWithLocation.reduce((sum, e) => sum + e.currentLocation.coordinates[1], 0) / elderlyWithLocation.length;
          return [avgLat, avgLng]; // Return as [lat, lng] for Leaflet
        })()
      : [16.0544, 108.2022]; // Default to Da Nang, Vietnam

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <style>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="text-blue-600" size={32} />
            Quản Lý Vị Trí Người Cao Tuổi
          </h1>
          <p className="text-gray-600 mt-2">
            Theo dõi và quản lý vị trí hiện tại của người cao tuổi trong hệ thống
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại, hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng số người cao tuổi</p>
                <p className="text-2xl font-bold text-gray-900">{elderlyList.length}</p>
              </div>
              <Users className="text-blue-600" size={40} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Có thông tin vị trí</p>
                <p className="text-2xl font-bold text-gray-900">
                  {elderlyWithLocation.length}
                </p>
              </div>
              <MapPin className="text-green-600" size={40} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chưa có thông tin vị trí</p>
                <p className="text-2xl font-bold text-gray-900">
                  {elderlyList.length - elderlyWithLocation.length}
                </p>
              </div>
              <Navigation className="text-orange-600" size={40} />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Map Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="text-blue-600" size={20} />
                  Bản Đồ Vị Trí Người Cao Tuổi
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Hiển thị {elderlyWithLocation.length} người cao tuổi có thông tin vị trí
                </p>
              </div>
              <div className="h-[500px] w-full">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20}
                  />
                  <MapAutoZoom elderlyWithLocation={elderlyWithLocation} />
                  {elderlyWithLocation.map((elderly) => {
                    const [lng, lat] = elderly.currentLocation.coordinates;
                    return (
                      <Marker
                        key={elderly.userId}
                        position={[lat, lng]}
                        icon={createCustomMarker(elderly)}
                      >
                        <Popup>
                          <div className="p-2" style={{ minWidth: '200px' }}>
                            <div className="flex items-center gap-3 mb-3">
                              <img 
                                src={elderly.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(elderly.fullName || 'User')}&background=2196F3&color=fff&size=80`}
                                alt={elderly.fullName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(elderly.fullName || 'User')}&background=2196F3&color=fff&size=80`;
                                }}
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900 text-base">
                                  {elderly.fullName || "N/A"}
                                </h3>
                                <p className="text-xs text-gray-500">ID: {elderly.userId}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                <strong>📞 SĐT:</strong> {elderly.phoneNumber || "N/A"}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>📍 Địa chỉ:</strong>{" "}
                                {elderly.currentLocation?.address || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                Tọa độ: {lat.toFixed(6)}, {lng.toFixed(6)}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedElderly(elderly)}
                              className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition font-medium"
                            >
                              Xem chi tiết đầy đủ
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </>
        )}

        {/* Selected Elderly Detail Modal */}
        {selectedElderly && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedElderly(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="text-blue-600" />
                    Chi Tiết Vị Trí
                  </h2>
                  <button
                    onClick={() => setSelectedElderly(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin cá nhân</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Họ và tên</p>
                        <p className="text-gray-900 font-medium">{selectedElderly.fullName || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="text-gray-900 font-medium">{selectedElderly.phoneNumber || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin vị trí</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Địa chỉ hiện tại</p>
                      {selectedElderly.currentLocation?.address ? (
                        <>
                          <p className="text-gray-900 mb-2">{selectedElderly.currentLocation.address}</p>
                          {selectedElderly.currentLocation?.coordinates &&
                            Array.isArray(selectedElderly.currentLocation.coordinates) &&
                            selectedElderly.currentLocation.coordinates.length === 2 && (
                              <p className="text-xs text-gray-500">
                                Tọa độ: {selectedElderly.currentLocation.coordinates[0].toFixed(6)},{" "}
                                {selectedElderly.currentLocation.coordinates[1].toFixed(6)}
                              </p>
                            )}
                        </>
                      ) : (
                        <p className="text-gray-400 italic">Chưa có thông tin vị trí</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin cập nhật</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Cập nhật lần cuối: <span className="font-medium">{formatDate(selectedElderly.updatedAt)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedElderly(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminElderlyLocationPage;

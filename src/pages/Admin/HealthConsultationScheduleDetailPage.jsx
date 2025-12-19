import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService from "../../services/adminService";
import ROUTE_PATH from "../../constants/routePath";

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <circle cx="80" cy="62" r="28" fill="#cbd5e1"/>
      <path d="M30 140c10-28 32-44 50-44s40 16 50 44" fill="#cbd5e1"/>
    </svg>
  `);

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN");
};

const formatMoney = (v) => {
  if (v == null) return "N/A";
  return Number(v).toLocaleString("vi-VN") + " VND";
};

const statusBadge = (status) => {
  const map = {
    confirmed: {
      text: "Đã xác nhận",
      cls: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
    },
    in_progress: {
      text: "Đang thực hiện",
      cls: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    },
    completed: {
      text: "Hoàn thành",
      cls: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    },
    cancelled: {
      text: "Đã hủy",
      cls: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    },
  };
  return (
    map[status] || {
      text: status || "N/A",
      cls: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200",
    }
  );
};

const paymentBadge = (paymentStatus) => {
  if (paymentStatus === "paid")
    return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
  if (paymentStatus === "refunded")
    return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
  return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
};

const PersonInfoCard = ({
  title,
  subtitle,
  dotClass = "bg-emerald-500",
  person,
  fields = [],
}) => {
  const avatarSrc = person?.avatar?.trim?.() ? person.avatar : DEFAULT_AVATAR;

  const Row = ({ label, value }) => (
    <div className="flex items-start justify-between gap-6 py-2">
      <div className="text-slate-600">{label}:</div>
      <div className="text-slate-900 font-semibold text-right break-words">
        {value || "Không có"}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
      <div className="flex items-start gap-5">
        <img
          src={avatarSrc}
          alt={person?.fullName || "Avatar"}
          className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100 bg-slate-100"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <span className={`inline-block w-2 h-2 rounded-full ${dotClass}`} />
          </div>
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>

          <div className="mt-4 divide-y divide-slate-100">
            {fields.map((f) => (
              <Row key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SmallInfoCard = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-slate-600">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const LabelValue = ({ label, value, valueClass = "" }) => (
  <div className="pt-3 border-t border-slate-100 first:border-t-0 first:pt-0">
    <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
      {label}
    </div>
    <div className={`mt-1 text-slate-900 font-semibold ${valueClass}`}>
      {value}
    </div>
  </div>
);

const HealthConsultationScheduleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await adminService.getRegisteredPackageById(id);
        if (res?.success) setData(res.data);
        else setError(res?.message || "Không lấy được thông tin chi tiết");
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Có lỗi xảy ra khi lấy chi tiết lịch tư vấn"
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200 px-10 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700">
          <p className="font-semibold">⚠ Lỗi</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() =>
            navigate(ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES)
          }
          className="mt-5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  const {
    doctor,
    beneficiary,
    registrant,
    price,
    status,
    scheduledDate,
    slot,
    paymentMethod,
    paymentStatus,
    createdAt,
    note,
  } = data;

  console.log("Chi tiết lịch tư vấn:", data);
  
  const st = statusBadge(status);

  const paymentMethodText =
    paymentMethod === "cash"
      ? "Tiền mặt"
      : paymentMethod === "bank_transfer"
      ? "Chuyển khoản"
      : "N/A";

  const paymentStatusText =
    paymentStatus === "paid"
      ? "Đã thanh toán"
      : paymentStatus === "refunded"
      ? "Đã hoàn tiền"
      : "Chưa thanh toán";

  return (
    <div className="min-h-screen p-6 ">
      <div className="max-w-6xl mx-auto">
        {/* Header giống bố cục hỗ trợ */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Chi tiết lịch tư vấn
            </h1>
            <p className="text-slate-600 mt-1">
              Quản lý thông tin lịch hẹn và dịch vụ tư vấn sức khỏe
            </p>
          </div>

          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${st.cls}`}
          >
            {st.text}
          </span>
        </div>

        <button
          onClick={() =>
            navigate(ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES)
          }
          className="mb-6 px-4 py-2.5 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm ring-1 ring-slate-200"
        >
          ← Quay lại danh sách
        </button>

        {/* ✅ LAYOUT 2 CỘT giống ảnh hỗ trợ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: 3 card người */}
          <div className="lg:col-span-2 space-y-6">
            <PersonInfoCard
              title="Bác sĩ"
              subtitle="Bác sĩ thực hiện tư vấn"
              dotClass="bg-emerald-500"
              person={doctor}
              fields={[
                { label: "Tên", value: doctor?.fullName },
                { label: "SĐT", value: doctor?.phoneNumber },
                { label: "Email", value: doctor?.email },
              ]}
            />

            <PersonInfoCard
              title="Người cao tuổi"
              subtitle="Người nhận tư vấn"
              dotClass="bg-blue-500"
              person={beneficiary}
              fields={[
                { label: "Tên", value: beneficiary?.fullName },
                { label: "Giới tính", value: beneficiary?.gender },
                {
                  label: "Ngày sinh",
                  value: beneficiary?.dateOfBirth
                    ? formatDate(beneficiary.dateOfBirth)
                    : "Không có",
                },
                { label: "SĐT", value: beneficiary?.phoneNumber },
                { label: "Email", value: beneficiary?.email },
                { label: "Địa chỉ", value: beneficiary?.currentAddress },
              ]}
            />

            <PersonInfoCard
              title="Người đăng ký"
              subtitle="Quản lý đặt lịch"
              dotClass="bg-purple-500"
              person={registrant}
              fields={[
                { label: "Tên", value: registrant?.fullName },
                { label: "SĐT", value: registrant?.phoneNumber },
                { label: "Email", value: registrant?.email },
              ]}
            />
          </div>

          {/* RIGHT: Lịch hẹn + Thanh toán */}
          <div className="lg:col-span-1 space-y-6">
            <SmallInfoCard
              icon={<span className="text-xl">🕒</span>}
              title="Lịch hẹn"
            >
              <LabelValue label="Ngày khám" value={formatDate(scheduledDate)} />
              <LabelValue
                label="Buổi"
                value={slot === "morning" ? "Sáng" : "Chiều"}
              />
              <LabelValue label="Ngày đăng ký" value={formatDate(createdAt)} />
              {/* Ghi chú */}
              <LabelValue
                label="Ghi chú"
                value={data?.note || "Không có"}
              />
            </SmallInfoCard>

            <SmallInfoCard
              icon={<span className="text-xl text-emerald-600">$</span>}
              title="Thanh toán"
            >
              <LabelValue label="Phương thức" value={paymentMethodText} />
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  Trạng thái thanh toán
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${paymentBadge(
                      paymentStatus
                    )}`}
                  >
                    {paymentStatusText}
                  </span>
                </div>
              </div>
              <LabelValue
                label="Giá"
                value={formatMoney(price)}
                valueClass="text-emerald-600 text-lg"
              />
            </SmallInfoCard>
          </div>
        </div>
      </div>
      {/* ===== LỊCH SỬ TƯ VẤN ===== */}
      {data?.consultationSummary && (
        <div className="mt-10 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Lịch sử tư vấn
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.consultationSummary.mainDisease && (
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Nhận xét tổng quan
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {data.consultationSummary.mainDisease}
                </p>
              </div>
            )}

            {data.consultationSummary.medications && (
              <div>
                <p className="text-sm text-slate-600 font-medium">Lời khuyên</p>
                <p className="text-lg font-semibold text-slate-900 whitespace-pre-wrap">
                  {data.consultationSummary.medications}
                </p>
              </div>
            )}

            {data.consultationSummary.systolic && (
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Huyết áp tâm thu
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {data.consultationSummary.systolic} mmHg
                </p>
              </div>
            )}

            {data.consultationSummary.diastolic && (
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Huyết áp tâm trương
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {data.consultationSummary.diastolic} mmHg
                </p>
              </div>
            )}

            {data.consultationSummary.pulse && (
              <div>
                <p className="text-sm text-slate-600 font-medium">Nhịp tim</p>
                <p className="text-lg font-semibold text-slate-900">
                  {data.consultationSummary.pulse} bpm
                </p>
              </div>
            )}

            {data.consultationSummary.weight && (
              <div>
                <p className="text-sm text-slate-600 font-medium">Cân nặng</p>
                <p className="text-lg font-semibold text-slate-900">
                  {data.consultationSummary.weight} kg
                </p>
              </div>
            )}

            {data.consultationSummary.bloodSugar && (
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Đường huyết
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {data.consultationSummary.bloodSugar}
                </p>
              </div>
            )}
          </div>

          {/* Sinh hoạt hằng ngày */}
          {(data.consultationSummary.mobility ||
            data.consultationSummary.bathing ||
            data.consultationSummary.feeding) && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Khả năng sinh hoạt hàng ngày
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.consultationSummary.mobility && (
                  <div className="p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-600">
                      Di chuyển
                    </p>
                    <p className="text-slate-900 mt-1 whitespace-pre-wrap">
                      {data.consultationSummary.mobility}
                    </p>
                  </div>
                )}

                {data.consultationSummary.bathing && (
                  <div className="p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-600">
                      Tắm rửa
                    </p>
                    <p className="text-slate-900 mt-1 whitespace-pre-wrap">
                      {data.consultationSummary.bathing}
                    </p>
                  </div>
                )}

                {data.consultationSummary.feeding && (
                  <div className="p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-600">
                      Ăn uống
                    </p>
                    <p className="text-slate-900 mt-1 whitespace-pre-wrap">
                      {data.consultationSummary.feeding}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthConsultationScheduleDetailPage;

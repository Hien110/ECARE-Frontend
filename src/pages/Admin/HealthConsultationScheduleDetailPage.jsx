import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService, { updateConsultationPaymentStatus, getRatingByConsultationId } from "../../services/adminService";
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
  const [refunding, setRefunding] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rating, setRating] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await adminService.getRegisteredPackageById(id);
        if (res?.success) {
          setData(res.data);
          
          // Nếu lịch khám đã hoàn thành, lấy đánh giá
          if (res.data?.status === 'completed') {
            fetchRating();
          }
        } else {
          setError(res?.message || "Không lấy được thông tin chi tiết");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Có lỗi xảy ra khi lấy chi tiết lịch tư vấn"
        );
      } finally {
        setLoading(false);
      }
    };
    
    const fetchRating = async () => {
      setLoadingRating(true);
      try {
        const res = await getRatingByConsultationId(id);
        if (res?.success) {
          setRating(res.data);
        }
      } catch (err) {
        // Không có đánh giá hoặc lỗi thì bỏ qua
        console.log("Chưa có đánh giá cho lịch khám này");
      } finally {
        setLoadingRating(false);
      }
    };
    
    if (id) fetchDetail();
  }, [id]);

  const handleRefundClick = () => {
    setShowConfirmModal(true);
  };

  const handleRefund = async () => {
    setShowConfirmModal(false);
    setRefunding(true);
    try {
      const res = await updateConsultationPaymentStatus(id, "refunded");
      if (res?.success) {
        setData(prev => ({
          ...prev,
          paymentStatus: "refunded"
        }));
        setShowSuccessModal(true);
      } else {
        setErrorMessage(res?.message || "Cập nhật trạng thái thất bại");
        setShowErrorModal(true);
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Cập nhật trạng thái thất bại");
      setShowErrorModal(true);
    }
    setRefunding(false);
  };

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

            {/* Thông tin hoàn tiền */}
            {status === "cancelled" && paymentStatus === "paid" && registrant && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm ring-1 ring-amber-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl text-amber-600">$</span>
                  <h3 className="text-xl font-bold text-slate-900">Thông tin hoàn tiền</h3>
                </div>
                <div className="bg-white rounded-xl p-4 ring-1 ring-amber-100">
                  <p className="text-xs text-amber-700 font-semibold mb-3 uppercase tracking-wide">
                    Tài khoản nhận hoàn tiền
                  </p>
                  <div className="space-y-3 text-sm">
                    {registrant.bankName && (
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wide">Ngân hàng</p>
                        <p className="font-semibold text-slate-900 mt-1">{registrant.bankName}</p>
                      </div>
                    )}
                    {registrant.bankAccountHolderName && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-slate-500 text-xs uppercase tracking-wide">Tên chủ tài khoản</p>
                        <p className="font-semibold text-slate-900 mt-1">{registrant.bankAccountHolderName}</p>
                      </div>
                    )}
                    {registrant.bankAccountNumber && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-slate-500 text-xs uppercase tracking-wide">Số tài khoản</p>
                        <p className="font-mono font-bold text-slate-900 text-base tracking-wider mt-1">
                          {registrant.bankAccountNumber}
                        </p>
                      </div>
                    )}
                    {(!registrant.bankName && !registrant.bankAccountNumber) && (
                      <div className="text-center py-2">
                        <p className="text-slate-500 text-sm italic">Chưa có thông tin tài khoản ngân hàng</p>
                      </div>
                    )}
                  </div>
                  {registrant.bankAccountNumber && (
                    <div className="mt-4 pt-3 border-t border-amber-100">
                      <p className="text-xs text-amber-600 italic">
                        💡 Vui lòng hoàn tiền về tài khoản trên
                      </p>
                    </div>
                  )}
                </div>
                {paymentStatus === "paid" && (
                  <div className="mt-4">
                    <button
                      onClick={handleRefundClick}
                      disabled={refunding}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {refunding ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span className="text-xl">$</span>
                          Xác nhận đã hoàn tiền
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
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

      {/* ===== ĐÁNH GIÁ ===== */}
      {status === 'completed' && (
        <div className="mt-10 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">⭐</span>
            <h2 className="text-2xl font-bold text-slate-900">
              Đánh giá dịch vụ
            </h2>
          </div>

          {loadingRating ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-slate-600">Đang tải đánh giá...</span>
            </div>
          ) : rating ? (
            <div className="space-y-6">
              {/* Thông tin người đánh giá */}
              <div className="flex items-start gap-4">
                <img
                  src={rating.reviewer?.avatar || DEFAULT_AVATAR}
                  alt={rating.reviewer?.fullName}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-100 bg-slate-100"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">
                      {rating.reviewer?.fullName || "Người dùng"}
                    </h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <svg
                          key={index}
                          className={`w-5 h-5 ${
                            index < rating.rating
                              ? "text-yellow-400 fill-current"
                              : "text-slate-300 fill-current"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-lg font-bold text-slate-900">
                        {rating.rating}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {rating.reviewer?.email || ""}
                  </p>
                  <p className="text-sm text-slate-500">
                    Đánh giá vào: {formatDate(rating.ratedAt)}
                  </p>
                </div>
              </div>

              {/* Bình luận */}
              {rating.comment && (
                <div className="bg-slate-50 rounded-xl p-4 ring-1 ring-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Nhận xét:
                  </p>
                  <p className="text-slate-900 whitespace-pre-wrap">
                    {rating.comment}
                  </p>
                </div>
              )}

              {/* Bác sĩ được đánh giá */}
              {rating.reviewee && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">Bác sĩ được đánh giá:</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={rating.reviewee?.avatar || DEFAULT_AVATAR}
                      alt={rating.reviewee?.fullName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
                    />
                    <span className="font-semibold text-slate-900">
                      {rating.reviewee?.fullName || "Không rõ"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <p className="text-slate-600 text-lg">
                Chưa có đánh giá cho lịch khám này
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Người đăng ký có thể đánh giá sau khi hoàn thành dịch vụ
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Xác nhận hoàn tiền</h3>
              <p className="text-gray-700 mb-2">Bạn có chắc chắn đã hoàn tiền cho người đăng ký?</p>
              <p className="text-sm text-gray-500">Hành động này sẽ cập nhật trạng thái thanh toán thành "Đã hoàn tiền".</p>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleRefund}
                className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-green-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Thành công!</h3>
              <p className="text-gray-700 text-center">Đã cập nhật trạng thái hoàn tiền thành công</p>
            </div>
            <div className="px-6 pb-6 flex justify-center">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-red-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Lỗi!</h3>
              <p className="text-gray-700 text-center">{errorMessage}</p>
            </div>
            <div className="px-6 pb-6 flex justify-center">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthConsultationScheduleDetailPage;

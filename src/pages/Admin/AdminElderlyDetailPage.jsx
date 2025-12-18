"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import adminService, {
  getAcceptRelationshipByElderlyIdAdmin,
  getSupporterSchedulesByElderlyId,
} from "../../services/adminService";
import ROUTE_PATH from "../../constants/routePath";

const AdminElderlyDetailPage = () => {
  const [params] = useSearchParams();
  const userId = params.get("id");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===== Doctor consultation schedules =====
  const [consultationSchedules, setConsultationSchedules] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);

  // ===== Supporter schedules (NEW) =====
  const [supporterSchedules, setSupporterSchedules] = useState([]);
  const [loadingSupporterSchedules, setLoadingSupporterSchedules] =
    useState(false);

  // ✅ NEW: relationships (family members linked with this elderly)
  const [relationships, setRelationships] = useState([]);
  const [relLoading, setRelLoading] = useState(false);
  const [relError, setRelError] = useState("");

  // ✅ NEW: Tabs
  const TAB = { CONSULTATION: "consultation", SUPPORTER: "supporter" };
  const [activeTab, setActiveTab] = useState(TAB.CONSULTATION);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError("");

    adminService
      .getUserById(userId)
      .then((res) => setData(res?.data || null))
      .catch((e) => {
        console.error("AdminElderlyDetailPage - Error:", e);
        setError(e?.response?.data?.message || "Tải thông tin thất bại");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // ===== Fetch doctor consultations =====
  useEffect(() => {
    if (!userId) return;
    setLoadingConsultations(true);

    adminService
      .getConsultationSchedulesByBeneficiary(userId)
      .then((res) => {
        if (res?.success) setConsultationSchedules(res?.data || []);
        else setConsultationSchedules(res?.data || []);
      })
      .catch((e) => console.error("Error fetching consultation schedules:", e))
      .finally(() => setLoadingConsultations(false));
  }, [userId]);

  // ===== Fetch supporter schedules by elderlyId (✅ use your function) =====
  useEffect(() => {
    if (!userId) return;
    setLoadingSupporterSchedules(true);

    getSupporterSchedulesByElderlyId(userId)
      .then((res) => {
        // res có thể là {success, data} hoặc chỉ data tùy backend bạn trả
        if (res?.success && Array.isArray(res?.data))
          setSupporterSchedules(res.data);
        else if (Array.isArray(res?.data)) setSupporterSchedules(res.data);
        else if (Array.isArray(res)) setSupporterSchedules(res);
        else setSupporterSchedules([]);
      })
      .catch((e) => {
        console.error("Error fetching supporter schedules:", e);
        setSupporterSchedules([]);
      })
      .finally(() => setLoadingSupporterSchedules(false));
  }, [userId]);

  // ✅ fetch accepted relationships by elderly id
  useEffect(() => {
    if (!userId) return;
    setRelLoading(true);
    setRelError("");
    getAcceptRelationshipByElderlyIdAdmin(userId)
      .then((res) => setRelationships(res?.data || res || []))
      .catch((e) => {
        console.error("Error fetching relationships:", e);
        setRelError("Không thể tải danh sách thành viên liên kết");
      })
      .finally(() => setRelLoading(false));
  }, [userId]);

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    try {
      return new Date(iso).toLocaleDateString("vi-VN");
    } catch {
      return iso;
    }
  };

  const formatPhone = (phone) => {
    if (!phone || phone === "N/A") return "N/A";
    const p = String(phone).trim();
    if (p.startsWith("+")) return p;
    if (p.startsWith("+84")) return p;
    if (p.startsWith("84")) return "+" + p;
    if (p.startsWith("0")) return "+84" + p.slice(1);
    return p;
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      confirmed: { text: "Đã xác nhận", color: "indigo" },
      in_progress: { text: "Đang thực hiện", color: "amber" },
      completed: { text: "Hoàn thành", color: "emerald" },
      cancelled: { text: "Đã hủy", color: "rose" },
      canceled: { text: "Đã hủy", color: "rose" },
    };
    return statusMap[status] || { text: status, color: "slate" };
  };

  const statusBadge = {
    indigo: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    emerald:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    rose: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    slate: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200",
  };

  const paymentBadge = (paymentStatus) => {
    if (paymentStatus === "paid")
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    if (paymentStatus === "refunded")
      return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
    return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  };

  const paymentText = (paymentStatus) => {
    if (paymentStatus === "paid") return "Đã thanh toán";
    if (paymentStatus === "refunded") return "Đã hoàn tiền";
    return "Chưa thanh toán";
  };

  const getInitials = (fullName) => {
    const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "U";
    return parts
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const relationLabel = (rel) => {
    const raw =
      rel?.relationshipType ||
      rel?.relationType ||
      rel?.relation ||
      rel?.type ||
      rel?.familyRole ||
      "";
    if (!raw) return null;
    return String(raw).replaceAll("_", " ");
  };

  const linkedFamilyCount = Array.isArray(relationships)
    ? relationships.length
    : 0;

  const consultationStats = useMemo(() => {
    return {
      completed: consultationSchedules.filter((s) => s.status === "completed")
        .length,
      cancelled: consultationSchedules.filter(
        (s) => s.status === "cancelled" || s.status === "canceled"
      ).length,
      total: consultationSchedules.length,
    };
  }, [consultationSchedules]);

  const supporterStats = useMemo(() => {
    return {
      completed: supporterSchedules.filter((s) => s.status === "completed")
        .length,
      cancelled: supporterSchedules.filter(
        (s) => s.status === "cancelled" || s.status === "canceled"
      ).length,
      total: supporterSchedules.length,
    };
  }, [supporterSchedules]);

  /** ===== EARLY RETURNS ===== */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200 px-10 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-700 max-w-xl w-full">
          <p className="font-semibold mb-1">⚠ Có lỗi xảy ra</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 px-10 py-8 text-center">
          <p className="text-slate-700 text-lg font-medium">Không có dữ liệu</p>
        </div>
      </div>
    );

  /** ===== Derived values ===== */
  const name = data.fullName || "Người dùng";
  const phone = formatPhone(data.phoneNumber || "N/A");
  const address = data.address || "N/A";
  const currentAddress = data.currentAddress || "N/A";
  const dob = data.dateOfBirth ? formatDate(data.dateOfBirth) : "N/A";
  const age = data.dateOfBirth
    ? Math.max(
        0,
        new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()
      )
    : null;

  const roleLabel =
    data.role === "supporter"
      ? "Người hỗ trợ"
      : data.role === "doctor"
      ? "Bác sĩ"
      : "Người cao tuổi";

  const isConsultationTab = activeTab === TAB.CONSULTATION;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            Chi tiết người cao tuổi
          </h1>
          <p className="text-slate-600 mt-2">
            Quản lý thông tin cá nhân, liên kết và lịch sử dịch vụ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card (giữ nguyên của bạn) */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="h-24" />
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 -mt-16 mb-6 relative z-10">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-4xl font-bold text-white shadow-sm ring-4 ring-white overflow-hidden">
                    {data.avatar ? (
                      <img
                        src={data.avatar}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(name)}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-900">
                      {name}
                    </h2>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 whitespace-nowrap">
                        {roleLabel}
                      </span>

                      {age !== null && (
                        <span className="text-sm text-slate-600 font-semibold">
                          {age} tuổi
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {data.description && (
                  <div className="mb-6 p-4 rounded-xl bg-slate-50 ring-1 ring-slate-200">
                    <p className="text-slate-700 leading-relaxed">
                      {data.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* phone */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 flex-shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Điện thoại
                      </div>
                      <div className="font-semibold text-slate-900 mt-1 break-words">
                        {phone}
                      </div>
                    </div>
                  </div>

                  {/* dob */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 flex-shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Ngày sinh
                      </div>
                      <div className="font-semibold text-slate-900 mt-1">
                        {dob}
                      </div>
                    </div>
                  </div>

                  {/* address */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 flex-shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Địa chỉ thường trú
                      </div>
                      <div className="font-semibold text-slate-900 mt-1 line-clamp-2">
                        {address}
                      </div>
                    </div>
                  </div>

                  {/* current address */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 flex-shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 10.5l9-7 9 7V20a2 2 0 01-2 2H5a2 2 0 01-2-2v-9.5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 22V12h6v10"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Địa chỉ tạm trú
                      </div>
                      <div className="font-semibold text-slate-900 mt-1 line-clamp-2">
                        {currentAddress}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: stats */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900">Tổng quan</h3>
              <p className="text-sm text-slate-600 mt-1">
                Thống kê nhanh theo dịch vụ
              </p>

              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 ring-1 ring-inset ring-slate-200">
                  <div className="text-xs font-semibold text-slate-700 uppercase">
                    Thành viên đã liên kết
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {linkedFamilyCount}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 ring-1 ring-inset ring-blue-200">
                  <div className="text-xs font-semibold text-blue-700 uppercase">
                    Lịch tư vấn (bác sĩ)
                  </div>
                  <div className="text-2xl font-bold text-blue-800 mt-1">
                    {consultationStats.total}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 ring-1 ring-inset ring-emerald-200">
                  <div className="text-xs font-semibold text-emerald-700 uppercase">
                    Lịch hỗ trợ (supporter)
                  </div>
                  <div className="text-2xl font-bold text-emerald-800 mt-1">
                    {supporterStats.total}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Linked family members (giữ nguyên) */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden mt-6">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-900">
              Thành viên gia đình đã liên kết
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {linkedFamilyCount} thành viên
            </p>
          </div>

          <div className="p-6">
            {relLoading ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto"></div>
                <div className="text-slate-600 mt-3 font-semibold">
                  Đang tải dữ liệu...
                </div>
              </div>
            ) : relError ? (
              <div className="text-center py-10 text-rose-600 font-semibold">
                {relError}
              </div>
            ) : linkedFamilyCount === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <div className="text-4xl mb-2">📭</div>
                <p className="font-semibold">
                  Chưa có thành viên nào được liên kết
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {relationships.map((rel, idx) => {
                  const family =
                    rel.family ||
                    rel.familyMember ||
                    rel.member ||
                    rel.registrant ||
                    {};
                  const familyName = family.fullName || `Thành viên ${idx + 1}`;
                  const familyPhone = family.phoneNumber
                    ? formatPhone(family.phoneNumber)
                    : "Chưa cập nhật";
                  const typeText = relationLabel(rel);

                  return (
                    <div
                      key={rel._id || family._id || idx}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white ring-1 ring-slate-200 hover:bg-blue-50/40 hover:ring-blue-200 transition"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 flex items-center justify-center font-bold">
                          {getInitials(familyName)}
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {familyName}
                            {typeText ? (
                              <span className="ml-2 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                {typeText}
                              </span>
                            ) : null}
                          </div>

                          <div className="text-sm text-slate-600 mt-1">
                            <span className="font-semibold text-slate-700">
                              SĐT:
                            </span>{" "}
                            {familyPhone}
                          </div>
                        </div>
                      </div>

                      {family._id ? (
                        <Link
                          to={`${
                            ROUTE_PATH.ADMIN_FAMILY_VIEW || "/admin/family/view"
                          }?id=${family._id}`}
                          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm font-semibold whitespace-nowrap"
                        >
                          Xem chi tiết
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-500">
                          Không có ID
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {/* ===== Tabs + List section ===== */}
        <div className="mt-10">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isConsultationTab
                  ? "Lịch tư vấn sức khỏe"
                  : "Lịch hỗ trợ sức khỏe"}
              </h2>
              <p className="text-slate-600 mt-1">
                {isConsultationTab
                  ? "Danh sách các lịch tư vấn (bác sĩ) liên quan đến người dùng này"
                  : "Danh sách các lịch hỗ trợ (supporter) liên quan đến người dùng này"}
              </p>
            </div>

            {/* ✅ 2 buttons */}
            <div className="inline-flex rounded-2xl ring-1 ring-slate-200 bg-white p-1">
              <button
                onClick={() => setActiveTab(TAB.CONSULTATION)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  isConsultationTab
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Lịch tư vấn sức khỏe
              </button>
              <button
                onClick={() => setActiveTab(TAB.SUPPORTER)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  !isConsultationTab
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Lịch hỗ trợ sức khỏe
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
            {/* ===== CONSULTATION LIST ===== */}
            {isConsultationTab ? (
              loadingConsultations ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto"></div>
                  <div className="text-slate-600 mt-4 font-semibold">
                    Đang tải dữ liệu...
                  </div>
                </div>
              ) : consultationSchedules.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {consultationSchedules.map((schedule, idx) => {
                    const statusInfo = getStatusDisplay(schedule.status);
                    return (
                      <Link
                        key={schedule._id || idx}
                        to={`${ROUTE_PATH.ADMIN_HEALTH_CONSULTATION_SCHEDULES}/${schedule._id}`}
                        className="block p-6 hover:bg-blue-50/40 transition-colors group"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 ring-1 ring-inset ring-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
                                {idx + 1}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 group-hover:text-blue-700">
                                  {formatDate(schedule.scheduledDate)} •{" "}
                                  {schedule.slot === "morning"
                                    ? "Buổi sáng"
                                    : "Buổi chiều"}
                                </h4>
                                <p className="text-sm text-slate-600 mt-1">
                                  Đăng ký bởi:{" "}
                                  <span className="font-semibold text-slate-800">
                                    {schedule.registrant?.fullName || "N/A"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="ml-12 text-sm text-slate-600 space-y-1">
                              <div>
                                <span className="font-semibold text-slate-700">
                                  Bác sĩ:
                                </span>{" "}
                                {schedule.doctor?.fullName || "Chưa gán"}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-700">
                                  Giá:
                                </span>{" "}
                                {schedule.price?.toLocaleString("vi-VN") ||
                                  "N/A"}{" "}
                                VND
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row lg:flex-col gap-2 lg:text-right">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                statusBadge[statusInfo.color]
                              }`}
                            >
                              {statusInfo.text}
                            </span>

                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${paymentBadge(
                                schedule.paymentStatus
                              )}`}
                            >
                              {paymentText(schedule.paymentStatus)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="font-semibold text-slate-600">
                    Chưa có lịch tư vấn nào.
                  </div>
                </div>
              )
            ) : /* ===== SUPPORTER LIST (NEW) ===== */
            loadingSupporterSchedules ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto"></div>
                <div className="text-slate-600 mt-4 font-semibold">
                  Đang tải dữ liệu...
                </div>
              </div>
            ) : supporterSchedules.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {supporterSchedules.map((s, idx) => {
                  // ✅ FIX: dùng đúng field theo model
                  const startDate = s.startDate
                    ? formatDate(s.startDate)
                    : "N/A";
                  const endDate = s.endDate ? formatDate(s.endDate) : "N/A";

                  let dateText = "N/A";
                  if (startDate !== "N/A" && endDate !== "N/A") {
                    dateText = `${startDate} → ${endDate}`;
                  } else if (startDate !== "N/A") {
                    dateText = startDate;
                  } else if (endDate !== "N/A") {
                    dateText = endDate;
                  }

                  const statusInfo = getStatusDisplay(s.status);
                  const supporterName = s.supporter?.fullName || "N/A";
                  const serviceName = s.service?.name || "N/A";

                  return (
                    <Link
                      key={s._id || idx}
                      to={`${ROUTE_PATH.ADMIN_SUPPORTER_SCHEDULING_DETAIL}`.replace(
                        ":id",
                        s._id || ""
                      )}
                      className="block p-6 hover:bg-blue-50/40 transition-colors group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 ring-1 ring-inset ring-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 group-hover:text-blue-700">
                                {dateText}{" "}
                                {s.slot
                                  ? `• ${
                                      s.slot === "morning"
                                        ? "Buổi sáng"
                                        : "Buổi chiều"
                                    }`
                                  : ""}
                              </h4>
                              <p className="text-sm text-slate-600 mt-1">
                                Dịch vụ:{" "}
                                <span className="font-semibold text-slate-800">
                                  {serviceName}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="ml-12 text-sm text-slate-600 space-y-1">
                            <div>
                              <span className="font-semibold text-slate-700">
                                Supporter:
                              </span>{" "}
                              {supporterName}
                            </div>
                            {typeof s.price !== "undefined" ? (
                              <div>
                                <span className="font-semibold text-slate-700">
                                  Giá:
                                </span>{" "}
                                {s.price?.toLocaleString("vi-VN") || "N/A"} VND
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 lg:text-right">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                              statusBadge[statusInfo.color]
                            }`}
                          >
                            {statusInfo.text}
                          </span>

                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${paymentBadge(
                              s.paymentStatus
                            )}`}
                          >
                            {paymentText(s.paymentStatus)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="font-semibold text-slate-600">
                  Chưa có lịch hỗ trợ nào.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminElderlyDetailPage;

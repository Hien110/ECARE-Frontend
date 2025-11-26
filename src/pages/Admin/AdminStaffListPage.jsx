import UserListTable from "../../components/UserListTable";

export default function StaffListPage() {
  return (
    <UserListTable
      filterRoles={["doctor", "supporter"]}
      title="Danh Sách Nhân Viên (Bác sĩ & Supporter)"
      description="Quản lý nhân viên bác sĩ và cộng tác viên trong hệ thống"
      showAddButtons={true}
    />
  );
}

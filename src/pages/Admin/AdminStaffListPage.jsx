import UserListTable from "../../components/UserListTable";

export default function StaffListPage() {
  return (
    <UserListTable
      filterRoles={["doctor", "supporter"]}
      title="Danh Sách Nhân Viên"
      description="Quản lý nhân viên bác sĩ và người hỗ trợ trong hệ thống"
      showAddButtons={true}
    />
  );
}

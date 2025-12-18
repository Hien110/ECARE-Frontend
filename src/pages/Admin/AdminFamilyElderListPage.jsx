import UserListTable from "../../components/UserListTable";

export default function FamilyElderListPage() {
  return (
    <UserListTable
      filterRoles={["elderly", "family"]}
      title="Danh Sách Người cao tuổi & người thân gia đình"
      description="Quản lý thành viên gia đình và người cao tuổi trong hệ thống"
      showAddButtons={false}
    />
  );
}

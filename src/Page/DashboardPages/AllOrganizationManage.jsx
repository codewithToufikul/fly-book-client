import { useQuery } from "@tanstack/react-query";

const AllOrganizationManage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.flybook.com.bd/api/v1/organizations"
      );
      const data = await response.json();
      return data;
    },
  });
  return (
    <div>
      <h1>All Organization Manage</h1>
    </div>
  );
};
export default AllOrganizationManage;

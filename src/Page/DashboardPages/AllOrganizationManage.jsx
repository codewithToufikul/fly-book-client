import { useQuery } from "@tanstack/react-query";

const AllOrganizationManage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/organizations"
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

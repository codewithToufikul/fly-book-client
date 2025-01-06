import React from "react";
import { Link } from "react-router";
import usePeople from "../../Hooks/usePeople";
import Swal from "sweetalert2";
import usePublicAxios from "../../Hooks/usePublicAxios";

const AllUsersAdmin = () => {
  const { peoples, refetch, isLoading, isError, error } = usePeople();
  const axiosPublic = usePublicAxios()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }
  const handleDeleteUser = async(userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosPublic.delete(`/user/delete/${userId}`);
          if (res.data.success) {
            Swal.fire({
              title: "Removed!",
              text: "User has been removed!.",
              icon: "success",
            });
            refetch();
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
  };
  return (
    <div>
      <h1 className=" text-xl lg:text-3xl font-semibold text-center mt-5">
        All Users
      </h1>
      <div className="overflow-x-auto mt-5">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th className=" lg:text-lg">User</th>
              <th className=" lg:text-lg">Number</th>
              <th className=" lg:text-lg">Verified</th>
              <th className=" lg:text-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {peoples.map((user) => (
              <tr>
                <td>
                  <Link
                    to={`/profile/${user._id}`}
                    className="flex items-center gap-3"
                  >
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img src={user.profileImage} alt="user.name" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{user.name}</div>
                      <div className="text-sm opacity-50">
                        {user.friends?.length} friends
                      </div>
                    </div>
                  </Link>
                </td>
                <td>
                  <p>{user.email}</p>
                  <br />
                </td>
                <td>
                  <p>{user.verificationStatus ? "true" : "false"}</p>
                </td>
                <th>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="btn bg-red-400 text-white btn-sm"
                  >
                    Remove User
                  </button>
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUsersAdmin;

import React from "react";
import { Link } from "react-router";
import usePeople from "../../Hooks/usePeople";
import Swal from "sweetalert2";
import usePublicAxios from "../../Hooks/usePublicAxios";
import { MdEdit } from "react-icons/md";

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

  const handleEditWallet = (user) => {
    Swal.fire({
      title: 'Update Wallet',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">FlyWallet (Coins)</label>
            <input id="swal-flyWallet" type="number" class="swal2-input" value="${user.flyWallet || 0}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Wallet Balance</label>
            <input id="swal-wallet" type="number" class="swal2-input" value="${user.wallet || 0}">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: () => {
        return {
          flyWallet: document.getElementById('swal-flyWallet').value,
          wallet: document.getElementById('swal-wallet').value
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosPublic.put('/admin/wallet/update-user', {
            userId: user._id, 
            flyWallet: result.value.flyWallet,
            wallet: result.value.wallet
          });
          
          if (res.data.success) {
            Swal.fire('Updated!', 'User wallet has been updated.', 'success');
            refetch();
          }
        } catch (error) {
          console.error("Update failed:", error);
          Swal.fire('Error!', 'Failed to update wallet.', 'error');
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
              <th className=" lg:text-lg">Browsing Time</th>
              <th className=" lg:text-lg">FlyWallet</th>
              <th className=" lg:text-lg">My Wallet</th>
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
                <td>
                  <p className="font-semibold text-blue-600">
                    {user.totalBrowsingMinutes ? `${user.totalBrowsingMinutes} mins` : "0 mins"}
                  </p>
                </td>
                <td>
                  <p className="font-bold text-amber-500">
                    🪙 {user.flyWallet || 0}
                  </p>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-green-600">
                      💳 {user.wallet || 0}
                    </p>
                    <button 
                      onClick={() => handleEditWallet(user)}
                      className="btn btn-xs btn-ghost text-blue-500"
                    >
                      <MdEdit />
                    </button>
                  </div>
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

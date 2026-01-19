import { IoSearchOutline } from "react-icons/io5";
import useAllFriends from "../../Hooks/useAllFriends";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { useSocket } from "../../contexts/SocketContext";

const HomeLeft = () => {
  const fnd = [1, 2, 4, 5, 6, 7, 8, 9, 10];
  const { allFriends, refetch: refetchFriends } = useAllFriends();
  const socket = useSocket(); // Use global socket
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Listen for user online/offline status using global socket
  useEffect(() => {
    if (!socket) return;

    // Listen for user online/offline status
    socket.on("userOnline", (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    socket.on("userOffline", (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [socket]);

  return (
    <div className=" flex sticky top-[110px] z-40 ">
      <div className=" w-1/2"></div>
      <div className="w-1/2">
        <div className=" border-b-2 pb-2 w-full flex justify-between items-center pr-3">
          <h1 className=" text-2xl font-medium">Your Friends</h1>
          <h2 className=" text-2xl">
            <IoSearchOutline />
          </h2>
        </div>
        <div>
          <ul className=" space-y-3 mt-4 px-2">
            {allFriends.map(
              user =>
              (
                <li key={user}>
                  <Link to={`/profile/${user._id}`} className=" flex items-center space-x-2 hover:bg-gray-200 rounded-md cursor-pointer">
                    <div className="relative w-[50px] h-[50px] p-1 rounded-full">
                      <img
                        className=" w-full h-full object-cover rounded-full"
                        src={user.profileImage}
                        alt=""
                      />
                      {onlineUsers.has(user._id) || user.isOnline ? (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      ) : (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <h2 className=" text-xl font-medium"> {user.name}</h2>
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomeLeft;

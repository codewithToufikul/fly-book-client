import { IoSearchOutline } from "react-icons/io5";
import useAllFriends from "../../Hooks/useAllFriends";
import { Link } from "react-router";

const HomeLeft = () => {
  const fnd = [1, 2, 4, 5, 6, 7, 8, 9, 10];
  const { allFriends, refetch: refetchFriends } = useAllFriends();
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
                    <div className="w-[50px] h-[50px] p-1 rounded-full">
                      <img
                        className=" w-full h-full object-cover rounded-full"
                        src={user.profileImage}
                        alt=""
                      />
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

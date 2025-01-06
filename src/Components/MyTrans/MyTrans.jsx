import { useQuery } from "@tanstack/react-query";
import usePublicAxios from "../../Hooks/usePublicAxios";
import useUser from "../../Hooks/useUser";
import { Link } from "react-router";

const MyTrans = () => {
  const axiosPublic = usePublicAxios();
  const { user, loading: userLoading } = useUser();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["transData"],
    queryFn: () => axiosPublic.get("/books/trans").then((res) => res.data.data),
  });

  if (isLoading || userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>Error loading transfer data.</div>;
  }

  const myTransHistory = (data || []).filter(
    (trans) => trans.sendId === user.id || trans.receiveId === user.id
  );
  if (myTransHistory.length == 0) {
    return (
      <div>
        <h1 className=" text-lg lg:text-2xl text-center mt-5">
          You Have No Transfer History!
        </h1>
      </div>
    );
  }
  return (
    <div className="mt-5 bg-gray-50 p-5 rounded-xl">
      <h1 className="text-xl lg:text-3xl font-semibold border-b-2 pb-2">
        Your Transfer List
      </h1>
      <div className=" mt-5">
        <div className="overflow-x-auto ">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th className=" lg:text-xl lg:font-semibold">Book</th>
                <th className=" lg:text-xl lg:font-semibold">Transfer</th>
                <th className=" lg:text-xl lg:font-semibold">Time</th>
                <th className=" lg:text-xl lg:font-semibold">Receiver/Sender</th>
              </tr>
            </thead>
            <tbody>
              {myTransHistory.map((trans) => (
                <tr>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className=" h-20 w-14 lg:h-24 lg:w-20">
                          <img src={trans.bookImage} alt="book image" />
                        </div>
                      </div>
                      <div>
                        <div className=" text-sm lg:text-lg">{trans.bookName}</div>
                      </div>
                    </div>
                  </td>
                  <td>Transfer</td>
                  <td>
                    <p className=" text-xs lg:text-lg">{`${
                      trans.transDate
                    } at ${trans.transTime.slice(0, -6) + trans.transTime.slice(-3)}`}</p>
                  </td>
                  <td>
                  <Link to={`/profile/${trans.receiveId}`} className=" text-lg lg:text-xl font-medium hover:underline cursor-pointer">
                  {
                    trans?.transName
                  }
                  </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyTrans;

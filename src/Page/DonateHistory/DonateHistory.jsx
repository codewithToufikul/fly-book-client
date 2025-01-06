import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";

const DonateHistory = () => {
  return (
    <div>
      <Navbar />
      <div className=" max-w-[1220px] mx-auto">
      <h1 className=" text-lg font-medium my-2 text-center bg-gray-50 py-5 lg:text-3xl">Books Donation History</h1>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Donner Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Books Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b ">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                >
                  Imran Hossen
                </th>
                <td className="px-6 py-4">12/11/2024</td>
                <td className="px-6 py-4">2 Books</td>
              </tr>
              <tr className="bg-white border-b ">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                >
                  Toufikul Islam
                </th>
                <td className="px-6 py-4">15/11/2024</td>
                <td className="px-6 py-4">1 Books</td>
              </tr>
              <tr className="bg-white border-b ">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                >
                  Adib Abtahi
                </th>
                <td className="px-6 py-4">16/11/2024</td>
                <td className="px-6 py-4">2 Books</td>
              </tr>
              <tr className="bg-white border-b ">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                >
                  Larib Hossen
                </th>
                <td className="px-6 py-4">20/11/2024</td>
                <td className="px-6 py-4">3 Books</td>
              </tr>
              <tr className="bg-white border-b ">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                >
                  Romman Hossen
                </th>
                <td className="px-6 py-4">22/11/2024</td>
                <td className="px-6 py-4">1 Books</td>
              </tr>
              <tr className="bg-white border-b ">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                >
                  Md Wazed Romsani
                </th>
                <td className="px-6 py-4">24/11/2024</td>
                <td className="px-6 py-4">2 Books</td>
              </tr>
              <tr className="bg-white border-b ">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                >
                  Arafat Islam
                </th>
                <td className="px-6 py-4">01/12/2024</td>
                <td className="px-6 py-4">3 Books</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className=" mt-16">
        <DownNav />
      </div>
    </div>
  );
};

export default DonateHistory;

import React from 'react';
import { GiBookshelf } from 'react-icons/gi';
import { IoPeopleSharp } from 'react-icons/io5';
import { LuBookOpenCheck } from 'react-icons/lu';
import { TbBooks } from 'react-icons/tb';

const DashboardData = () => {
    return (
        <div>
                        <main className=" mt-5">
              <div className="grid mb-4 pb-10 px-8 mx-4 rounded-3xl bg-gray-100 border-4 border-green-400">
                <div className="grid grid-cols-12 gap-6">
                  <div className="grid grid-cols-12 col-span-12 gap-6 xxl:col-span-9">
                    <div className="col-span-12 mt-8">
                      <div className="flex items-center h-10 intro-y">
                        <h2 className="mr-5 text-lg font-medium truncate">
                          Dashboard
                        </h2>
                      </div>
                      <div className="grid grid-cols-12 gap-6 mt-5">
                        <a
                          className="transform hover:scale-105 transition duration-300 shadow-xl rounded-lg col-span-12 sm:col-span-6 xl:col-span-3 intro-y bg-white"
                          href="#"
                        >
                          <div className="p-5">
                            <div className="flex justify-between">
                              <h2 className=" text-3xl text-green-500">
                                <TbBooks />
                              </h2>
                            </div>
                            <div className="ml-2 w-full flex-1">
                              <div>
                                <div className="mt-3 text-3xl font-bold leading-8">
                                  3
                                </div>
                                <div className="mt-1 text-base text-gray-600">
                                  Total Books
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                        <a
                          className="transform hover:scale-105 transition duration-300 shadow-xl rounded-lg col-span-12 sm:col-span-6 xl:col-span-3 intro-y bg-white"
                          href="#"
                        >
                          <div className="p-5">
                            <div className="flex justify-between">
                              <h2 className=" text-3xl text-blue-500">
                                <IoPeopleSharp />
                              </h2>
                            </div>
                            <div className="ml-2 w-full flex-1">
                              <div>
                                <div className="mt-3 text-3xl font-bold leading-8">
                                  3
                                </div>
                                <div className="mt-1 text-base text-gray-600">
                                  Total Users
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                        <a
                          className="transform hover:scale-105 transition duration-300 shadow-xl rounded-lg col-span-12 sm:col-span-6 xl:col-span-3 intro-y bg-white"
                          href="#"
                        >
                          <div className="p-5">
                            <div className="flex justify-between">
                              <h2 className=" text-3xl text-red-500">
                                <LuBookOpenCheck />
                              </h2>
                            </div>
                            <div className="ml-2 w-full flex-1">
                              <div>
                                <div className="mt-3 text-3xl font-bold leading-8">
                                  2
                                </div>
                                <div className="mt-1 text-base text-gray-600">
                                  Total Transfer Books
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                        <a
                          className="transform hover:scale-105 transition duration-300 shadow-xl rounded-lg col-span-12 sm:col-span-6 xl:col-span-3 intro-y bg-white"
                          href="#"
                        >
                          <div className="p-5">
                            <div className="flex justify-between">
                              <h2 className=" text-3xl text-indigo-500">
                                <GiBookshelf />
                              </h2>
                            </div>
                            <div className="ml-2 w-full flex-1">
                              <div>
                                <div className="mt-3 text-3xl font-bold leading-8">
                                  1
                                </div>
                                <div className="mt-1 text-base text-gray-600">
                                  Total Onindo Books
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                      <div className="lg:p-6 pt-5 mt-4">
                        <div className="space-y-6">
                          {/* Title */}
                          <h2 className="text-2xl font-semibold">
                            Transfer Chart
                          </h2>

                          {/* Bar Chart */}
                          <div className="space-y-4">
                            {/* Today Transfer */}
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-700">
                                  Today: 5 books
                                </span>
                                <span className="text-gray-700">100%</span>
                              </div>
                              <div className="h-4 bg-gray-200 rounded-full">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: "100%" }}
                                ></div>
                              </div>
                            </div>

                            {/* Last 7 Days Transfer */}
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-700">
                                  Last 7 Days: 20 books
                                </span>
                                <span className="text-gray-700">80%</span>
                              </div>
                              <div className="h-4 bg-gray-200 rounded-full">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: "80%" }}
                                ></div>
                              </div>
                            </div>

                            {/* Last 15 Days Transfer */}
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-700">
                                  Last 15 Days: 40 books
                                </span>
                                <span className="text-gray-700">60%</span>
                              </div>
                              <div className="h-4 bg-gray-200 rounded-full">
                                <div
                                  className="h-full bg-yellow-500 rounded-full"
                                  style={{ width: "60%" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
        </div>
    );
};

export default DashboardData;
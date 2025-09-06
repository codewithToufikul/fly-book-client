import { useState } from "react";
import { useParams } from "react-router";
import DownNav from "../../Components/DownNav/DownNav";
import Navbar from "../../Components/Navbar/Navbar";
import { useQuery } from "@tanstack/react-query";
import { HiDotsVertical } from "react-icons/hi";
import toast from "react-hot-toast";
import usePublicAxios from "../../Hooks/usePublicAxios";

const MyAllActivies = () => {
    const { orgId } = useParams();
    const token = localStorage.getItem("token");
    const axiosPublic = usePublicAxios();

    const { data: organizations, isLoading, isError, refetch } = useQuery({
        queryKey: ["organizations", orgId],
        queryFn: async () => {
            const response = await fetch(`http://localhost:3000/api/v1/organizations/${orgId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to retrieve organizations");
            return response.json();
        }
    });

    const [editActivity, setEditActivity] = useState(null);

    const handleMoveToEvent = async (activityId) => {
        try {
            const response = await axiosPublic.put(`/api/v1/events/${activityId}`, { organizationId: orgId });
            if (response.data.success) {
                toast.success("Activity moved to event successfully!");
            } else {
                toast.error("Failed to move activity to event.");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to move activity to event.");
        }
    };

    const handleDeleteActivity = async (activityId) => {
        try {
            const response = await axiosPublic.delete(`/api/v1/activities/${activityId}/${orgId}`);
            if (response.data.success) {
                toast.success("Activity deleted successfully!");
                refetch();
            } else {
                toast.error(response.data.error || "Failed to delete activity.");
            }
        } catch (error) {
            console.log(error);
            toast.error("An error occurred while deleting activity.");
        }
    };

    const handleEditActivity = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosPublic.put(`/api/v1/activities/${editActivity._id}/${orgId}`, {
                title: editActivity.title,
                date: editActivity.date,
                place: editActivity.place,
                details: editActivity.details,
                image: editActivity.image
            });

            if (response.data.success) {
                toast.success("Activity updated successfully!");
                setEditActivity(null);
                refetch();
            } else {
                toast.error("Failed to update activity.");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to update activity.");
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {isError.message}</div>;

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4">
                {!organizations.data.activities?.length ? (
                    <div className="flex flex-col items-center justify-center mt-12 p-8 bg-white rounded-lg shadow-md">
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Activities Found</h3>
                        <p className="text-gray-500 text-center">You haven't added any activities yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
                        {organizations.data.activities.map(activity => (
                            <div key={activity._id} className="bg-white rounded-lg shadow-md p-4 relative">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h5 className="font-bold text-lg">{activity.title}</h5>
                                        <p className="text-sm text-gray-600">{activity.date}</p>
                                    </div>
                                </div>
                                <p className="mt-2 text-gray-600">{activity.place}</p>
                                <img src={activity.image} alt="activity" className="w-full h-48 object-cover mt-4" />
                                <div className="absolute top-0 right-0">
                                    <button className="bg-white rounded-full p-2 hover:bg-gray-200" onClick={() => {
                                        document.getElementById(`dropdown-${activity._id}`).classList.toggle("hidden");
                                    }}>
                                        <HiDotsVertical className="w-6 h-6 text-gray-600" />
                                    </button>
                                    <div id={`dropdown-${activity._id}`} className="hidden absolute top-12 w-[200px] right-0 bg-white rounded-md shadow-md p-2">
                                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-200" onClick={() => handleDeleteActivity(activity._id)}>
                                            Delete
                                        </button>
                                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-200" onClick={() => setEditActivity(activity)}>
                                            Edit
                                        </button>
                                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-200" onClick={() => handleMoveToEvent(activity._id)}>
                                            Move to event
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editActivity && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <form className="bg-white p-6 rounded-lg shadow-md" onSubmit={handleEditActivity}>
                        <h2 className="text-lg font-semibold mb-4">Edit Activity</h2>
                        <input type="text" className="w-full border p-2 mb-2" value={editActivity.title} onChange={(e) => setEditActivity({ ...editActivity, title: e.target.value })} />
                        <input type="text" className="w-full border p-2 mb-2" value={editActivity.date} onChange={(e) => setEditActivity({ ...editActivity, date: e.target.value })} />
                        <input type="text" className="w-full border p-2 mb-2" value={editActivity.place} onChange={(e) => setEditActivity({ ...editActivity, place: e.target.value })} />
                        <textarea className="w-full border p-2 mb-2" value={editActivity.details} onChange={(e) => setEditActivity({ ...editActivity, details: e.target.value })}></textarea>
                        <button type="submit" className="bg-green-500 text-white p-2 rounded">Save</button>
                        <button type="button" className="ml-2 bg-red-500 text-white p-2 rounded" onClick={() => setEditActivity(null)}>Cancel</button>
                    </form>
                </div>
            )}

            <DownNav />
        </div>
    );
};

export default MyAllActivies;

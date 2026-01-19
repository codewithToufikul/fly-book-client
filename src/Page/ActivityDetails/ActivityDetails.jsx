import { useParams } from "react-router-dom"; // Corrected import
import { useEffect, useState } from "react";
import Linkify from "react-linkify"; // Fixed import
import DownNav from "../../Components/DownNav/DownNav";
import Navbar from "../../Components/Navbar/Navbar";

const ActivityDetails = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch(`https://fly-book-server-lzu4.onrender.com/api/v1/activity/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch activity");
        }
        const result = await response.json();
        setActivity(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No activity found</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-[800px] mx-auto py-4 px-4">
        <h1 className="text-2xl lg:text-3xl font-bold mb-4">
          {activity.title}
        </h1>
        {activity.image && (
          <img
            src={activity.image}
            alt="Activity"
            className="w-full h-[400px] object-contain mb-4"
          />
        )}
        <div className="border-b-2 border-gray-300 py-4 mb-4">
          <ul className="space-y-2">
            <li className="mb-2 text-base">
              Event Name:{" "}
              <span className="font-bold text-primary text-lg">
                {activity.title}
              </span>
            </li>
            <li className="mb-2 text-base">
              Event Date:{" "}
              <span className="font-bold text-primary text-lg">
                {activity.date}
              </span>
            </li>
            <li className="mb-2 text-base">
              Event Place:{" "}
              <span className="font-bold text-primary text-lg">
                {activity.place}
              </span>
            </li>
          </ul>
        </div>
        <Linkify
          componentDecorator={(decoratedHref, decoratedText, key) => (
            <a
              key={key}
              href={decoratedHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-lg hover:underline"
            >
              {decoratedText}
            </a>
          )}
        >
          <p className="mb-4 text-lg whitespace-pre-wrap">{activity.details}</p>
        </Linkify>
      </div>
      <div className="mt-12">
        <DownNav />
      </div>
    </div>
  );
};

export default ActivityDetails;

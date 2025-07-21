import React, { useEffect, useState } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import DownNav from '../../Components/DownNav/DownNav';

function AudioBooks() {
  const [loading, setLoading] = useState(false);
  const [audioBooks, setAudioBooks] = useState(null);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/audioBook.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAudioBooks(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 mt-10">
        {loading && <p className="text-center text-lg font-medium">Loading...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {audioBooks && audioBooks.length > 0 && audioBooks.map((audioBook, index) => ( 
          <div 
            key={index} 
            className="bg-white shadow-lg rounded-xl p-6 flex flex-col md:flex-row gap-6 mb-8"
          >
            <div className=' h-[300px] md:h-[300px]'>
            <img 
              src={audioBook.coverImage} 
              alt={audioBook.title} 
              className=" w-full lg:w-60 h-full rounded-lg object-cover" 
            />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{audioBook.title}</h2>
              <p className="text-gray-600 mt-1">by {audioBook.author}</p>
              <p className="text-sm text-gray-500 mb-4">Narrated by {audioBook.narrator}</p>
              <p className="text-gray-700 mb-4">{audioBook.description}</p>
              <div className="text-sm text-gray-500 mb-2">
                <span>⏱ Duration: {audioBook.duration}</span> | 
                <span> 🌐 Language: {audioBook.language}</span> | 
                <span> 📅 Released: {audioBook.releaseDate}</span>
              </div>
              <div className="mt-4">
                <audio controls className="w-full">
                  <source src={audioBook.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          </div>
        ))}

        {/* Optional: Show a message if no books were found */}
        {audioBooks && audioBooks.length === 0 && !loading && !error && (
          <p className="text-center text-gray-600">No audiobooks found.</p>
        )}
      </div>
      <div className="mt-12">
        <DownNav />
      </div>
    </div>
  );
}

export default AudioBooks;

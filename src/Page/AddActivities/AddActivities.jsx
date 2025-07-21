import React, { useState } from 'react'
import { useParams } from 'react-router'
import { Button, Container, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Navbar from '../../Components/Navbar/Navbar';
import DownNav from '../../Components/DownNav/DownNav';
import toast from 'react-hot-toast';

export default function AddActivities() {
    const { orgId } = useParams();
    const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY;
    const token = localStorage.getItem("token");
    const [activityData, setActivityData] = useState({
        title: '',
        date: dayjs(),
        place: '',
        details: '',
        image: null
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setActivityData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setActivityData(prev => ({
            ...prev,
            image: file
        }));
    };

    const handleDateChange = (newDate) => {
        setActivityData(prev => ({
            ...prev,
            date: newDate
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = null;
            if (activityData.image) {
                const formData = new FormData();
                formData.append('image', activityData.image);

                const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (!data.success) {
                    throw new Error('Failed to upload image');
                }
                imageUrl = data.data.url;
            }

            const activityPayload = {
                title: activityData.title,
                date: activityData.date.format('YYYY-MM-DD'),
                place: activityData.place,
                details: activityData.details,
                image: imageUrl,
                organizationId: orgId
            };

            const response = await fetch('https://api.flybook.com.bd/api/v1/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(activityPayload)
            });

            if (!response.ok) {
                throw new Error('Failed to create activity');
            }

            // Reset form
            setActivityData({
                title: '',
                date: dayjs(),
                place: '',
                details: '',
                image: null
            });

            toast.success('Activity added successfully!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to add activity. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <h1 className='text-2xl font-bold mb-4'>Add Your Organization Activity</h1>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <TextField
                            fullWidth
                            label="Activity Title"
                            name="title"
                            value={activityData.title}
                            onChange={handleInputChange}
                            required
                        />

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Activity Date"
                                value={activityData.date}
                                onChange={handleDateChange}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>

                        <TextField
                            fullWidth
                            label="Place"
                            name="place"
                            value={activityData.place}
                            onChange={handleInputChange}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Details"
                            name="details"
                            value={activityData.details}
                            onChange={handleInputChange}
                            multiline
                            rows={4}
                            required
                        />

                        <input
                            accept="image/*"
                            type="file"
                            onChange={handleImageChange}
                            style={{ marginTop: '10px' }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Activity'}
                        </Button>
                    </div>
                </form>
            </Container>
            <div className=' mt-12'>
                <DownNav />
            </div>
        </div>
    );
}

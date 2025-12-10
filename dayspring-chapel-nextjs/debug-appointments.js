// Standalone debug script using native fetch
const API_BASE_URL = 'https://dayspring-backend-4ar8.onrender.com';

async function fetchAppointments() {
    try {
        console.log('Fetching appointments...');
        const response = await fetch(`${API_BASE_URL}/api/Appointments/get-all-appointment`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Appointments Data Status Check:');
        console.log('--------------------------------');

        const appointments = data.data || data;

        if (Array.isArray(appointments)) {
            appointments.forEach(app => {
                console.log(`ID: ${app.id}, Name: ${app.firstname} ${app.surname}, Status: ${app.status} (Type: ${typeof app.status})`);
            });

            if (appointments.length > 0) {
                console.log('\nFull Object Example (First Item):');
                console.log(JSON.stringify(appointments[0], null, 2));
            } else {
                console.log('No appointments found.');
            }
        } else {
            console.log('Data is not an array:', data);
        }

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

fetchAppointments();

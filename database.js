class Database {
    async registerUser(username, password) {
        console.log('Attempting register with:', username, password);
        const response = await fetch('https://admin.cherrysideloading.xyz/api.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'register', username, password }),
        });
        console.log(response.json());
        const data = await response.json();
        return data.success;
    }

    async loginUser(username, password) {
        console.log('Attempting login with:', username, password);
        const response = await fetch('https://admin.cherrysideloading.xyz/api.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username, password }),
        });
        const data = await response.json();
        console.log('Login response:', data);
        if (data.success) {
            const user = {
                ...data.user,
                isDev: data.user.isDev === 1 || data.user.isDev === true
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        } else {
            console.error('Login failed:', data.error);
            return null;
        }
    }

    async getAllUsers() {
        try {
            console.log('getAllUsers called');
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            console.log('currentUser in getAllUsers:', currentUser);
    
            if (!currentUser || !currentUser.isDev) {
                console.error('Unauthorized access to getAllUsers');
                return null;
            }
    
            const userDataEncoded = btoa(JSON.stringify(currentUser)); // Encode user data to base64
    
            console.log('Sending request to api.php');
            const response = await fetch('https://admin.cherrysideloading.xyz/api.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Data': userDataEncoded  // Send encoded user data as header
                },
                body: JSON.stringify({ action: 'getAllUsers' }),
            });
    
            console.log('Response received:', response);
            const data = await response.json();
            console.log('Parsed data:', data);
            return data.success ? data.users : null;
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            return null;
        }
    }    

    async updateUser(id, updateData) {
        try {
            console.log('updateUser called');
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            console.log('currentUser in updateUser:', currentUser);
    
            if (!currentUser || !currentUser.isDev) {
                console.error('Unauthorized access to updateUser');
                return null;
            }
    
            const userDataEncoded = btoa(JSON.stringify(currentUser)); // Encode user data to base64
    
            console.log('Sending request to api.js for updateUser');
            const response = await fetch('https://admin.cherrysideloading.xyz/api.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Data': userDataEncoded  // Send encoded user data as header
                },
                body: JSON.stringify({ action: 'updateUser', id, updateData }),
            });
    
            console.log('Response received:', response);
            const data = await response.json();
            console.log('Parsed data:', data);
            return data.success;
        } catch (error) {
            console.error('Error in updateUser:', error);
            return false;
        }
    }    

    async deleteUser(id) {
        const response = await fetch('https://admin.cherrysideloading.xyz/api.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteUser', id }),
        });
        const data = await response.json();
        return data.success;
    }

    async getUserStats(id) {
        const response = await fetch('https://admin.cherrysideloading.xyz/api.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getUserStats', id }),
        });
        const data = await response.json();
        return data.success ? data.stats : null;
    }

    async getUserData(id) {
        const response = await fetch('https://admin.cherrysideloading.xyz/api.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getUserData', id }),
        });
        const data = await response.json();
        return data.success ? data.userData : null;
    }
}

const db = new Database();

async function checkAndUpdateDevStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        try {
            const response = await fetch('https://admin.cherrysideloading.xyz/api.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'checkDevStatus', username: currentUser.username }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.success) {
                currentUser.isDev = data.isDev === 1 || data.isDev === true;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                document.dispatchEvent(new Event('loginStatusChanged'));
            }
        } catch (error) {
            console.error('Error checking dev status:', error);
        }
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', checkAndUpdateDevStatus);  
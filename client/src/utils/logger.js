import axios from 'axios';

let authToken = null;

export async function initializeLogging() {
    console.log('Starting authentication with proxy...');
    
    try {
        // Use relative URL - proxy will forward to http://20.244.56.144
        const response = await axios.post('/evaluation-service/auth', {
            email: "Hemanthreddy.Dwarampudi_2026@woxsen.edu.in",
            name: "Hemanth Dwarampudi",
            rollno: "22Wu0101030",
            accessCode: "UMXVQT",
            clientID: "39dcef9d-1803-46ed-bd82-264d08c4505a",
            clientSecret: "sSEBjXztYRCCQzPh"
        });


        
        console.log('Auth response:', response.data);
        authToken = response.data.access_token;
        console.log('Real-time logging initialized successfully!');
        return true;
    } catch (error) {
        console.error('Failed to initialize logging:', error);
        console.error('Error details:', error.response?.data);
        return false;
    }
}

export async function Log(stack, level, packageName, message) {
    if (!authToken) {
        console.error('Logging not initialized');
        return;
    }

    const truncatedMessage = message.substring(0, 47);

    try {
        // Use relative URL - proxy will forward to http://20.244.56.144
        const response = await axios.post('/evaluation-service/logs', {
            stack: stack,
            level: level,
            package: packageName,
            message: truncatedMessage
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✅ LOG SENT: [${stack}] [${level}] [${packageName}] ${truncatedMessage}`);
        return response.data;
    } catch (error) {
        console.error('❌ Logging failed:', error);
        console.error('Error details:', error.response?.data);
    }
}
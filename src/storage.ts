import { Routes, TravelTicket, Airlines } from './interfaces';


// Generate the random destination airport at runtime
const randomNumber = Math.floor(Math.random() * 10) + 1; // Generate random number between 1 and 10
const airportCodes = ['Los Angeles (LAX)', 'New York (JFK)', 'Chicago (ORD)', 'Dallas (DFW)', 'Denver (DEN)', 'San Francisco (SFO)', 'Tokyo (HND)', 'Las Vegas (LAS)', 'Phoenix (PHX)', 'Houston (IAH)']; // Map random number to airport codes
const destinationAirport = airportCodes[randomNumber - 1]; // Subtract 1 because array is 0-indexed

// Generate random routes with airlines and flight numbers
const airlineNames: Airlines['name'][] = ['Delta', 'American', 'United', 'Southwest', 'JetBlue', 'Alaska', 'Spirit', 'Frontier', 'Hawaiian', 'Air Canada', 'WestJet'];

const generateRandomRoutes = (count: number): Routes[] => {
    const routes: Routes[] = [];
    
    for (let i = 0; i < count; i++) {
        const randomAirlineIndex = Math.floor(Math.random() * airlineNames.length);
        const selectedAirline = airlineNames[randomAirlineIndex];
        const randomFlightNumber = Math.floor(Math.random() * 900) + 100; // Generate random 3-digit number (100-999)
        
        routes.push({
            airline: [{ name: selectedAirline }],
            flightNumber: `${selectedAirline.substring(0, 2).toUpperCase()}${randomFlightNumber}`
        });
    }
    
    return routes;
};

// Create an array of random routes
const Routes = generateRandomRoutes(5); // Generate 5 random routes

const availableRoutes = {
    origin: "Seattle (SEA)",
    destination: destinationAirport,
    availableRoutes: Routes,
    selectedRoute: 'TBD',
    travelDates: 'Monday November 17th - Friday November 21st, 2025',
    status: 'pending',
} as TravelTicket;

export { availableRoutes 

};
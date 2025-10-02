interface StorageState {
    currTicket: TravelTicket;
    completedBookings: TravelTicket[];
}

interface TravelTicket {
    id?: string;
    member?: { name: string };
    origin: "Seattle (SEA)";
    destination: string;
    availableRoutes: Routes[];
    selectedRoute: string
    travelDates: string;
    status: 'pending' | 'booked';
    bookingDate?: string;
}

interface Airlines {
    name: 'Delta' | 'American' | 'United' | 'Southwest' | 'JetBlue' | 'Alaska' | 'Spirit' | 'Frontier' | 'Hawaiian'| 'Air Canada'| 'WestJet';
}

interface Routes {
    airline: Airlines[]
    flightNumber: string;
}

interface Member {
    name: string;
}

export { StorageState, TravelTicket, Routes, Member, Airlines };
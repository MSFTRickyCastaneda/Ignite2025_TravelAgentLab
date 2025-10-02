import { App } from '@microsoft/teams.apps';
import { ChatPrompt } from '@microsoft/teams.ai';
import { AzureOpenAIChatModelOptions, OpenAIChatModel } from '@microsoft/teams.openai';
import { ConsoleLogger, LocalStorage } from '@microsoft/teams.common';
import { DevtoolsPlugin } from '@microsoft/teams.dev';
import { InvokeResponse, TaskModuleResponse } from '@microsoft/teams.api';
import { StorageState } from './interfaces';
import { generateTravelAssignmentCard, generateTravelPlanningDialogCard, generateSubmittedTravelPlanningCard } from './cards';
import { availableRoutes } from './storage';
import {  } from '@microsoft/teams.mcp';

//Storage for current ticket and completed bookings
const storage = new LocalStorage<StorageState>();

// Initialize storage only if it doesn't exist to preserve destination
if (!storage.get('local')) {
    storage.set('local', { 
        currTicket: availableRoutes,
        completedBookings: []
    } as StorageState);
}

const app = new App({
  
});

//Not sure about this yet look into later
app.on('dialog.open', async () => {
    const ticket = storage.get('local')!.currTicket;
    const dialogCard = generateTravelPlanningDialogCard(ticket!);

    return {
        task: {
            type: 'continue',
            value: {
                card: {
                    contentType: 'application/vnd.microsoft.card.adaptive',
                    content: dialogCard,
                },
                Destination: storage.get('local')!.currTicket.destination,
                Route: storage.get('local')!.currTicket.availableRoutes,
            },
        },
    } as TaskModuleResponse;
});

// What happens after the user submits the travel route assignment
app.on('dialog.submit', async ({ activity, send }) => {
    const data = activity.value!.data;
    const userName = data.userNameInput;
    const selectedRoute = data.selectedRoute;
    const state = storage.get('local');
    const ticket = state!.currTicket;
    
    // Update the ticket with user selections
    const completedTicket = {
        ...ticket,
        id: `TKT-${Date.now()}`,
        member: { name: userName },
        selectedRoute: selectedRoute.toString(),
        status: "booked" as const,
        bookingDate: new Date().toLocaleDateString()
    };

    // Add completed booking to the array
    state!.completedBookings.push(completedTicket);
    
    // Reset current ticket for next booking (keep same destination)
    state!.currTicket = {
        ...availableRoutes,
        destination: ticket.destination,
        status: 'pending'
    };

    // Save the updated state to storage
    storage.set('local', state!);

    const updatedCard = generateSubmittedTravelPlanningCard(completedTicket);
    await send(updatedCard);

    return {
        status: 200,
        body: {
            task: {
                type: 'message',
                value: 'Great your travel to ' + storage.get('local')!.currTicket.destination + ' has been booked!',
            },
        },
    } as InvokeResponse<'task/submit'>;
});

app.on('message', async ({ send, activity }) => {
    await send({ type: 'typing' });
    
    // Store current destination before AI call to detect changes
    const stateBefore = storage.get('local');
    const destinationBefore = stateBefore?.currTicket.destination;
    
    const res = await prompt.send(activity.text);
    await send(res.content!);
    
    // Check if AI generated a new travel assignment by detecting destination change
    const stateAfter = storage.get('local');
    const destinationAfter = stateAfter?.currTicket.destination;
    
    // Show card if destination changed (indicating new assignment) or if response mentions travel assignment keywords
    const showCard = destinationBefore !== destinationAfter || 
                    res.content?.toLowerCase().includes('upcoming travel') ||
                    res.content?.toLowerCase().includes('travel assignment') ||
                    res.content?.toLowerCase().includes('scheduled to present') ||
                    res.content?.toLowerCase().includes('ignite');
    
    if (showCard && stateAfter?.currTicket) {
        const card = generateTravelAssignmentCard(stateAfter.currTicket);
        await send(card);
    }
});

const prompt = new ChatPrompt(
    {
        instructions: [
            'you are an assistant that helps manage booking travel for individual team members.',
            'When users ask about their travel bookings, past trips, or want to see what they have booked, call the list_bookings function.',
            'When users ask about upcoming travel, new assignments, or if they have any travel coming up, call the generate_new_travel_assignment function.',
            'When users ask about flight status, delays, or whether their flight is on time, call the check_flight_status_for_booking function.',
            'on startup you will greet users friendly and ask them if they would like to get more information about upcoming travel assignments, their existing bookings, or flight status.',
        ].join('\n'),
        model: new OpenAIChatModel({
            model: process.env.OPENAPI_MODEL,
            apiKey: process.env.OPENAPI_KEY,
            endpoint: process.env.OPENAPI_ENDPOINT,
            apiVersion: process.env.OPENAPI_VERSION,
        } as AzureOpenAIChatModelOptions),
    },
)
 // gets a list of the available routes for the selected airport   
    .function('get_routes', 'Returns a list of the available routes for the selected airport', () => {
        const state = storage.get('local');
        return state?.currTicket.availableRoutes;
    })
    // Function to list all completed bookings
    .function('list_bookings', 'Lists all completed travel bookings for the user. Call this when user asks about their bookings, trips, travel history, or wants to see what they have booked.', () => {
        const state = storage.get('local');
        const bookings = state?.completedBookings || [];
        
        if (bookings.length === 0) {
            return 'You have no completed bookings yet.';
        }
        
        // Create a summary of all bookings
        let bookingSummary = `📋 Your Travel Bookings (${bookings.length} total):\n\n`;
        bookings.forEach((booking, index) => {
            bookingSummary += `${index + 1}. ${booking.id}\n`;
            bookingSummary += `👤 Traveler: ${booking.member?.name || 'Unknown'}\n`;
            bookingSummary += `🛫 ${booking.origin} → 🛬 ${booking.destination}\n`;
            bookingSummary += `✈️ Route: ${booking.selectedRoute}\n`;
            bookingSummary += `📅 Travel Dates: ${booking.travelDates}\n`;
            bookingSummary += `📆 Booked: ${booking.bookingDate}\n`;
            bookingSummary += `✅ Status: ${booking.status}\n\n`;
        });
        
        return bookingSummary;
    })
    // Function to generate new travel assignment
    .function('generate_new_travel_assignment', 'Generates a new travel assignment with random destination. Call this when user asks about upcoming travel, new assignments, or if they have any travel coming up.', () => {
        const airportCodes = ['Los Angeles (LAX)', 'New York (JFK)', 'Chicago (ORD)', 'Dallas (DFW)', 'Denver (DEN)', 'San Francisco (SFO)', 'Tokyo (HND)', 'Las Vegas (LAS)', 'Phoenix (PHX)', 'Houston (IAH)'];
        const randomNumber = Math.floor(Math.random() * 10) + 1;
        const newDestination = airportCodes[randomNumber - 1];
        
        // Update the ticket with the new destination
        const state = storage.get('local');
        if (state) {
            state.currTicket = {
                ...state.currTicket,
                destination: newDestination,
                status: 'pending'
            };
            storage.set('local', state);
        }
        
        return `✈️ UPCOMING TRAVEL ASSIGNMENT: You're scheduled to present at Microsoft Ignite in ${newDestination}! This is an important business trip, and it's best to book your travel soon to get the best rates and flight times. I'll show you the available booking options with premium airlines and convenient schedules.`;
    });

(async () => {
    await app.start(+(process.env.PORT || 3000));
})();
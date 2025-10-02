import {
    AdaptiveCard,
    ChoiceSetInput,
    Container,
    Fact,
    FactSet,
    SubmitAction,
    TaskFetchAction,
    TextBlock,
    TextInput,
} from '@microsoft/teams.cards'
import { TravelTicket } from './interfaces';

/**
 * Generates a professional travel assignment card with premium styling
 */
function generateTravelAssignmentCard(currTicket: TravelTicket): any {
    const card = new AdaptiveCard();
    card.version = '1.5';
    
    // Premium header with emphasis styling
    const headerContainer = new Container();
    headerContainer.style = 'emphasis';
    headerContainer.items = [
        new TextBlock('✈️ New Travel Assignment', { 
            size: 'Large', 
            weight: 'Bolder', 
            color: 'Accent',
            horizontalAlignment: 'Center',
            spacing: 'Medium'
        })
    ];
    
    // Content container with organized information
    const contentContainer = new Container();
    contentContainer.spacing = 'Medium';
    contentContainer.items = [
        new TextBlock('📋 Trip Information', { 
            size: 'Medium', 
            weight: 'Bolder', 
            spacing: 'Medium',
            color: 'Dark'
        }),
        new TextBlock(`🛫 **Departure:** ${currTicket.origin}`, { 
            weight: 'Bolder', 
            spacing: 'Small',
            wrap: true
        }),
        new TextBlock(`🛬 **Destination:** ${currTicket.destination}`, { 
            weight: 'Bolder', 
            color: 'Accent',
            spacing: 'Small',
            wrap: true
        }),
        new TextBlock(`📅 **Travel Period:** ${currTicket.travelDates}`, { 
            spacing: 'Small',
            wrap: true
        }),
        new TextBlock(`� **Current Status:** ${currTicket.status.toUpperCase()}`, { 
            color: currTicket.status === 'pending' ? 'Warning' : 'Good',
            weight: 'Bolder',
            spacing: 'Small'
        })
    ];
    
    // Call-to-action footer
    const footerContainer = new Container();
    footerContainer.spacing = 'Large';
    footerContainer.style = 'accent';
    footerContainer.items = [
        new TextBlock('Ready to secure your travel arrangements? 🎯', { 
            horizontalAlignment: 'Center',
            color: 'Light',
            weight: 'Bolder'
        })
    ];
    
    card.body = [headerContainer, contentContainer, footerContainer];

    card.actions = [new TaskFetchAction().withTitle('🚀 Choose Your Airline & Route').withId('proceedToBookingButton')];

    return {
        type: 'message',
        attachments: [
            {
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: card,
            },
        ],
    };
}

/**
 * Generates a premium booking confirmation card with complete details
 */
function generateSubmittedTravelPlanningCard(currTicket: TravelTicket): any {
    const card = new AdaptiveCard();
    card.version = '1.5';
    
    // Success celebration header
    const headerContainer = new Container();
    headerContainer.style = 'good';
    headerContainer.items = [
        new TextBlock('🎉 Booking Confirmed!', { 
            size: 'Large', 
            weight: 'Bolder', 
            color: 'Light',
            horizontalAlignment: 'Center',
            spacing: 'Medium'
        }),
        new TextBlock('Your premium travel experience has been reserved', {
            horizontalAlignment: 'Center',
            color: 'Light',
            spacing: 'Small'
        })
    ];
    
    // Professional booking summary using FactSet
    const detailsContainer = new Container();
    detailsContainer.spacing = 'Large';
    detailsContainer.items = [
        new TextBlock('📋 Booking Summary', { 
            size: 'Medium', 
            weight: 'Bolder', 
            spacing: 'Medium',
            color: 'Dark'
        })
    ];

    const factSet = new FactSet();
    factSet.facts = [
        new Fact('🎫 Booking ID', currTicket.id || 'Generating...'),
        new Fact('👤 Traveler', currTicket.member?.name || 'Unknown'),
        new Fact('🛫 Departure', currTicket.origin),
        new Fact('🛬 Destination', currTicket.destination),
        new Fact('📅 Travel Dates', currTicket.travelDates),
        new Fact('✈️ Selected Flight', currTicket.selectedRoute),
        new Fact('� Booking Date', currTicket.bookingDate || new Date().toLocaleDateString()),
        new Fact('✅ Status', currTicket.status.toUpperCase())
    ];
    factSet.spacing = 'Medium';
    
    detailsContainer.items.push(factSet);
    
    // Premium footer with booking reference
    const footerContainer = new Container();
    footerContainer.spacing = 'Large';
    footerContainer.style = 'emphasis';
    footerContainer.items = [
        new TextBlock(`📝 Reference: ${currTicket.id || 'TBD'}`, { 
            horizontalAlignment: 'Center',
            weight: 'Bolder',
            color: 'Accent',
            size: 'Medium'
        }),
        new TextBlock('Bon voyage! ✈️🌟', { 
            horizontalAlignment: 'Center',
            color: 'Accent',
            spacing: 'Small'
        })
    ];
    
    card.body = [headerContainer, detailsContainer, footerContainer];

    return {
        type: 'message',
        attachments: [
            {
                contentType: 'application/vnd.microsoft.card.adaptive',
                content: card,
            },
        ],
    };
}


/**
 * Generates a premium booking dialog with enhanced user experience
 */
function generateTravelPlanningDialogCard(currTicket: TravelTicket): AdaptiveCard {
    const card = new AdaptiveCard();
    card.version = '1.5';
    
    // Premium header
    const headerContainer = new Container();
    headerContainer.style = 'accent';
    headerContainer.items = [
        new TextBlock('✈️ Complete Your Reservation', { 
            size: 'Large', 
            weight: 'Bolder', 
            color: 'Light',
            horizontalAlignment: 'Center',
            spacing: 'Medium'
        })
    ];
    
    // Organized form sections
    const formContainer = new Container();
    formContainer.spacing = 'Large';
    
    // Personal information section
    const personalSection = new Container();
    personalSection.items = [
        new TextBlock('👤 Personal Information', { 
            weight: 'Bolder',
            size: 'Medium',
            spacing: 'Medium',
            color: 'Dark'
        }),
        new TextBlock('Please provide your full legal name as it appears on your passport:', {
            spacing: 'Small',
            color: 'Dark',
            wrap: true
        })
    ];
    
    const nameInput = new TextInput();
    nameInput.id = 'userNameInput';
    nameInput.placeholder = 'Full Name (e.g., John Michael Smith)';
    nameInput.style = 'Text';
    personalSection.items.push(nameInput);
    
    // Flight selection section
    const flightSection = new Container();
    flightSection.spacing = 'Large';
    flightSection.items = [
        new TextBlock('✈️ Flight Preferences', { 
            weight: 'Bolder',
            size: 'Medium',
            spacing: 'Medium',
            color: 'Dark'
        }),
        new TextBlock('Select your preferred airline and flight option:', {
            spacing: 'Small',
            color: 'Dark',
            wrap: true
        })
    ];

    const routeChoices = currTicket.availableRoutes.map(route => ({
        title: `✈️ ${route.airline[0].name} Flight ${route.flightNumber} - Premium Service`,
        value: `${route.airline[0].name} - ${route.flightNumber}`,
    }));

    const routeInput = new ChoiceSetInput();
    routeInput.id = 'selectedRoute';
    routeInput.style = 'expanded';
    routeInput.placeholder = 'Choose your preferred flight';
    routeInput.choices = routeChoices.map(choice => ({ 
        title: choice.title, 
        value: choice.value 
    }));
    
    flightSection.items.push(routeInput);
    
    formContainer.items = [personalSection, flightSection];
    
    // Premium call-to-action footer
    const footerContainer = new Container();
    footerContainer.spacing = 'Large';
    footerContainer.style = 'emphasis';
    footerContainer.items = [
        new TextBlock('Ready to confirm your premium travel experience? 🎯', { 
            horizontalAlignment: 'Center',
            color: 'Accent',
            weight: 'Bolder'
        })
    ];
    
    card.body = [headerContainer, formContainer, footerContainer];

    card.actions = [new SubmitAction().withTitle('🚀 Confirm Premium Booking').withId('completeBooking')];

    return card;
}

export { generateTravelAssignmentCard, generateTravelPlanningDialogCard, generateSubmittedTravelPlanningCard };
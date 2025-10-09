LangGraph Subgraphs Demo: Travel Planning Assistant ✈️

This demo showcases LangGraph subgraphs through an interactive travel planning assistant. Watch as specialized AI agents collaborate to plan your perfect trip!
What are LangGraph Subgraphs? 🤖

Subgraphs are the key to building modular, scalable AI systems in LangGraph. A subgraph is essentially "a graph that is used as a node in another graph" - enabling powerful encapsulation and reusability. For more info, check out the LangGraph docs.
Key Concepts

    Encapsulation: Each subgraph handles a specific domain with its own expertise
    Modularity: Subgraphs can be developed, tested, and maintained independently
    Reusability: The same subgraph can be used across multiple parent graphs
    State Communication: Subgraphs can share state or use different schemas with transformations

Demo Architecture 🗺️

This travel planner demonstrates supervisor-coordinated subgraphs with human-in-the-loop decision making:
Parent Graph: Travel Supervisor

    Role: Coordinates the travel planning process and routes to specialized agents
    State Management: Maintains a shared itinerary object across all subgraphs
    Intelligence: Determines what's needed and when each agent should be called

Subgraph 1: ✈️ Flights Agent

    Specialization: Finding and booking flight options
    Process: Presents flight options from Amsterdam to San Francisco with recommendations
    Interaction: Uses interrupts to let users choose their preferred flight
    Data: Static flight options (KLM, United) with pricing and duration

Subgraph 2: 🏨 Hotels Agent

    Specialization: Finding and booking accommodation
    Process: Shows hotel options in San Francisco with different price points
    Interaction: Uses interrupts for user to select their preferred hotel
    Data: Static hotel options (Hotel Zephyr, Ritz-Carlton, Hotel Zoe)

Subgraph 3: 🎯 Experiences Agent

    Specialization: Curating restaurants and activities
    Process: AI-powered recommendations based on selected flights and hotels
    Features: Combines 2 restaurants and 2 activities with location-aware suggestions
    Data: Static experiences (Pier 39, Golden Gate Bridge, Swan Oyster Depot, Tartine Bakery)

How It Works 🔄

    User Request: "Help me plan a trip to San Francisco"
    Supervisor Analysis: Determines what travel components are needed
    Sequential Routing: Routes to each agent in logical order:
        First: Flights Agent (get transportation sorted)
        Then: Hotels Agent (book accommodation)
        Finally: Experiences Agent (plan activities)
    Human Decisions: Each agent presents options and waits for user choice via interrupts
    State Building: Selected choices are stored in the shared itinerary object
    Completion: All agents report back to supervisor for final coordination

State Communication Patterns 📊
Shared State Schema

All subgraph agents share and contribute to a common state object. When any agent updates the shared state, these changes are immediately reflected in the frontend through real-time syncing. This ensures that:

    Flight selections from the Flights Agent are visible to subsequent agents
    Hotel choices influence the Experiences Agent's recommendations
    All updates are synchronized with the frontend UI in real-time
    State persistence maintains the travel itinerary throughout the workflow

Human-in-the-Loop Pattern

Two of the specialist agents use interrupts to pause execution and gather user preferences:

    Flights Agent: Presents options → interrupt → waits for selection → continues
    Hotels Agent: Shows hotels → interrupt → waits for choice → continues

Try These Examples! 💡
Getting Started

    "Help me plan a trip to San Francisco"
    "I want to visit San Francisco from Amsterdam"
    "Plan my travel itinerary"

During the Process

When the Flights Agent presents options:

    Choose between KLM ($650, 11h 30m) or United ($720, 12h 15m)

When the Hotels Agent shows accommodations:

    Select from Hotel Zephyr, The Ritz-Carlton, or Hotel Zoe

The Experiences Agent will then provide tailored recommendations based on your choices!
Frontend Capabilities 👁️

    Human-in-the-loop with interrupts from subgraphs for user decision making
    Subgraphs detection and streaming to show which agent is currently active
    Real-time state updates as the shared itinerary is built across agents

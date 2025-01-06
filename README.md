# CFC - College Fest Central Frontend

## Description

CFC (College Fest Central) is a platform and management system designed for the creation, management, and publication of college events and fests. This web application allows two types of users:

- **Organizer**: Can create, manage, and publish events or programs.
- **Participant**: Can filter and view events and programs.

This is a **crude implementation** using React, TypeScript, and TailwindCSS. The platform consists of several pages, including login/register pages, dashboards, event creation, and registration analytics. Participants can also download analytics in XLSX and PDF formats.

Some underused features, such as **interests**, can be easily implemented in the future.

## Requirements

- Node.js (v14 or higher recommended)
- A working backend (for proper data handling) – You can find the backend repository [here](https://github.com/Mathew005/cfc).

## Installation and Setup

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/Mathew005/event-platform.git
    ```

2. **Install Dependencies**:
    Navigate to the project folder and install the required dependencies:
    ```bash
    cd cfc-frontend
    npm install
    # Or if there are dependency issues, try:
    npm install --force
    ```

3. **Run the Development Server**:
    Start the development server to view the application in your browser:
    ```bash
    npm run dev
    ```

    The app should now be available at [http://localhost:3000](http://localhost:3000).

## Features

- **Login / Register Page**: For user authentication.
- **Homepage**: For browsing events, programs and navigation.
- **Profile Page**: User profile management.
- **Organizer Dashboard**: For managing created events and programs.
- **Participant Dashboard**: For viewing registered programs.
- **Event/Program Creation Page**: Organizers can create events or programs.
- **Event/Program Overview**: Overview page for events and programs.
- **Registration & Analytics Page**: View registration details and download analytics in XLSX/PDF formats.
  
### Technologies Used

- **React** with **TypeScript**
- **TailwindCSS**
- **V0 Libraries** (A lot of V0 implementations)

## Author

- **Mathew005**

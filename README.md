# CYBER DIARY
### Digitalized Investigation & Case Analysis Tool

> ***Cyber Diary*** is a secure, full-stack investigation management system designed for cybercrime units. It streamlines the entire lifecycle of a case—from initial FIR entry to evidence seizure and final reporting—while providing real-time analytics on case pendency and officer efficiency.
>
> ---

## Live Demo
****[View Live Project](https://digitalized-diary.vercel.app)****
---

## Key Features

#### Case Management
- **Digital Case Files:** Create detailed profiles with Case Numbers, Incident Dates, and Descriptions.
- **Witness & Suspect Tracking:** Log contact details and statements for every person involved.
- **Seizure Lists:** Digital inventory for physical evidence (laptops, mobiles) seized during raids.

#### File Security 
- **Magic Number Verification:** Uploads are checked at the **binary level** (File Signatures). 
- **Memory-Based Processing:** Files are processed in RAM (Stream Buffers) for security, ensuring no malicious files touch the disk.


#### Analytics & Reminders
- **Stagnant Case Detector:** Automatically alerts officers upon login if a case has been open for >10 days without updates.
- **Pendency Rates:** Visual Pie Charts and Bar Graphs showing efficiency and backlog.
- **Timeline Tracking:** Analyze how many days it takes to close specific types of cases.

---

## Installation & Setup

Follow these steps to run the project locally.

#### 1. Clone the Repository
```bash
git clone
cd digitalized-diary
```
#### 2. Backend Setup
```
cd backend
npm install
```
Create a .env file in the backend folder
```
MONGO_URI=your_mongodb_connection_string
PORT=8000
```
#### 3. Frontend Setup
```
cd ../frontend
npm install
```
Create a .env file in the backend folder
```
cd ../frontend
npm install
```
#### 4. Run locally
Terminal 1
```

cd backend
npm start
```
Terminal 2
```
cd frontend
npm run dev
```

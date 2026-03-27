# ADUN E-Learn 🎓
**Software Engineering Department E-Learning System & Performance Analytics**

This project is the official E-Learning System built for the Software Engineering Department at Admiralty University of Nigeria (ADUN). It empowers students, lecturers, and administrators with a feature-rich, deeply analytical dashboard environment driven by real-time progression tracking.

### 🌐 Live Deployment
**Live Link:** [https://adun-elearn.vercel.app](https://adun-elearn.vercel.app) *(Represents production domain)*

---

## 🎯 Features & Dashboards

The application is segregated into three distinct, powerful perspectives:

1. **Student Dashboard:**
   - Real-time **Current CGPA** calculation natively parsing grades from all enrolled SWE courses.
   - Dynamic **GPA Trend LineChart** visualizing academic health across semesters.
   - Live **Pending Tasks** and **Content Progress**.

2. **Lecturer Dashboard:**
   - Immediate **Class Pass Rate** tracking alongside grading backlogs.
   - Automatic **Average Grade per Course BarChart** summarizing performance distributions per class.
   - **At-Risk System** to alert professors of students needing critical guidance.

3. **Admin Dashboard:**
   - Centralized **Department Overview** covering total volume of students, lecturers, and active SWE courses.
   - Dedicated **Export Report Module** permitting 1-click **PDF** and **CSV** tabular reports natively extracted from Postgres CDC.
   - Segmented **Average GPA by Level BarChart** for administrative academic insight.

---

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router, React Compiler)
- **Database Architecture:** Prisma ORM mapped to PostgreSQL (via Supabase)
- **Real-time Synchronicity:** `@supabase/ssr` leveraging websockets onto `queryClient.invalidateQueries`
- **Frontend & Styling:** TailwindCSS, Shadcn UI, Recharts (Data Visualization)
- **Export Utility:** `jspdf` & `jspdf-autotable`

---

## 🚀 How to Run Locally

To boot this application on your local machine for testing or expansion:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/newman-theinnovator/adun-elearn.git
   cd adun-elearn
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   Duplicate the provided `.env.example` into a local `.env` file, supplying your Postgres connection string and Supabase Auth credentials.

4. **Initialize the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser to view the application.

---

## 💾 How to Seed Data (Defense Setup)

To automatically inject hundreds of realistic Nigerian students, software engineering courses, and relational academic history (for populating the charts perfectly):

Ensure your `.env` contains a valid Postgres string, then execute:
```bash
npx prisma db seed
```
**Optimized Execution:** The seed utilizes high-efficiency caching and batch `createMany` transactions that instantly format relational data models flawlessly without bottlenecking database connection limits.

---
> *Developed for Final Year Project Defense (March 2026).*

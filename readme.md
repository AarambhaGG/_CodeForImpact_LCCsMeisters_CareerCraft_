CareerCraft – AI Career Gap Analyser
"Know Your Gap. Close Your Gap."

🎯 The Problem
Job seekers apply blindly without knowing if they're qualified. 
Result: wasted time, unclear skill gaps, and no clear path forward.
💡 Our Solution
CareerCraft uses AI to analyse your profile against your dream job, tells you if you're FIT or UNFIT, and gives you a personalised week-by-week roadmap to get job-ready.

🔄 How It Works
📄 Upload Resume → 🎯 Enter Dream Job → 🤖 AI Analyzes Gap → ✅ Get FIT/UNFIT Status → 🗺️ Receive Personalized Roadmap
Input: Resume + Job Description
AI Analysis: Skill matching, experience evaluation, gap calculation
Output: Clear eligibility + actionable learning path

✨ Key Features

**Core Analysis**
- Smart Parsing: Extracts skills, experience, and education from resumes
- Semantic Matching: AI understands skill relationships (not just keywords)
- Gap Analysis: Identifies missing critical & preferred skills
- FIT/UNFIT Assessment: Clear yes/no with confidence score
- Custom Roadmap: Week-by-week plan to close skill gaps

**Advanced Features**
- 🎯 **Real-Time Streaming Analysis**: Progressive job eligibility analysis with live metrics updates
- 📊 **Detailed Match Scoring**: 11 granular scoring metrics including:
  - Skills match score
  - Experience match score
  - Education match score
  - Culture fit score
  - Location match score
  - Salary match score
  - Technical skills score
  - Soft skills score
  - Domain knowledge score
  - Readiness percentage
  - Confidence level assessment
- 💬 **AI Career Chat**: Interactive AI-powered conversations about your analysis results
- 🎨 **Multiple Job Input Methods**: 
  - Describe your dream role approach
  - Paste job posting approach
- 📝 **Comprehensive Analysis Output**:
  - Strengths identification
  - Detailed gaps with severity/priority levels
  - Actionable recommendations
  - Next steps for improvement
  - Priority improvements list
  - Learning resources
- 👤 **Complete Profile Management**:
  - Education records with skills mapping
  - Work experience with skill validation
  - Projects portfolio with technology tagging
  - Certifications with skill validation
  - User skills with proficiency levels
- 📈 **My Analyses**: View, track, and manage all previous job analyses
- 🎤 **Interview Prep**: Access curated interview questions by role and difficulty
- ⚙️ **Settings Dashboard**: Manage profile, education, experience, projects, skills, and certifications
- 📱 **Responsive Dark Mode**: Beautiful UI with full dark mode support


🌍 Why Open Innovation?
✅ Problem-First Approach: Solves universal career confusion
✅ Democratizes Access: Career guidance for everyone, not just the privileged few
✅ Multi-Stakeholder Impact: Helps job seekers, employers and educators
✅ Scalable Across Domains: Works for any industry, role, or region


🚀 Impact

For Job Seekers: Stop guessing, start preparing with clarity
For Employers: Receive better-prepared candidates
For Educators: Understand real market skill gaps


🔮 Future Scope
🔗 LinkedIn integration | � Resume optimization | 📊 Enhanced progress tracking | 🎓 Learning path customization | 📧 Email notifications

🛠️ Tech Stack

**Backend**
- Python/Django: REST API framework
- LangChain: LLM orchestration and chain management
- OpenAI GPT-4 / Google Gemini: AI-powered analysis and chat
- PostgreSQL: Primary database
- Redis: Caching and real-time updates
- Celery: Async task processing
- Django REST Framework: API development

**Frontend**
- Next.js 14+: React framework with App Router
- TypeScript: Type-safe development
- Tailwind CSS: Utility-first styling
- React Query (TanStack Query): Server state management
- Lucide React: Icon library
- Dark mode support with theme provider

**DevOps & Deployment**
- Docker: Containerization
- Docker Compose: Multi-container orchestration
- SQLite (Development) / PostgreSQL (Production)

🔌 API Endpoints

**Job Analysis**
- `POST /api/jobs/eligibility/analyze/` - Streaming job eligibility analysis
- `POST /api/jobs/eligibility/stream-analyze/` - Stream job analysis with real-time updates
- `POST /api/jobs/eligibility/chat/` - AI chat about analysis results
- `POST /api/jobs/eligibility/reanalyze/` - Re-run analysis with additional context
- `GET /api/jobs/eligibility/` - Get all analyses
- `GET /api/jobs/eligibility/{id}/` - Get specific analysis

**Profile Management**
- `GET /api/profiles/` - User profile
- `POST /api/profiles/upload-resume/` - Resume parsing and profile creation
- `GET /api/profiles/education/` - Education records
- `POST /api/profiles/education/` - Add education
- `GET /api/profiles/experience/` - Work experience
- `POST /api/profiles/experience/` - Add work experience
- `GET /api/profiles/projects/` - Projects portfolio
- `POST /api/profiles/projects/` - Add project
- `GET /api/profiles/certifications/` - Certifications
- `POST /api/profiles/certifications/` - Add certification

**Skills Management**
- `GET /api/skills/` - All available skills
- `GET /api/skills/user/` - User's skills
- `POST /api/skills/user/` - Add user skill
- `PATCH /api/skills/user/{id}/` - Update user skill proficiency

**User Management**
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/refresh/` - Refresh tokens
- `GET /api/users/profile/` - User profile info

📱 Dashboard Features

**Main Dashboard**
- Job match score overview
- Current skills count
- Dream job status
- Recent analyses widget

**Dream Job Section**
- Two input methods: describe role or paste job posting
- Real-time streaming analysis visualization
- Progress tracking with detailed metrics

**Job Match Analysis**
- 11-point scoring system with visual breakdown
- Skills matching with color-coded indicators
- Experience gap analysis
- Next steps and recommendations
- Priority improvements list
- Learning resources

**My Analyses**
- List of all previous analyses
- Quick access to full analysis details
- Analysis history with timestamps

**Skills Section**
- View all skills
- Track proficiency levels (Beginner, Intermediate, Advanced, Expert)
- Add new skills
- Skills categorization

**Settings**
- Edit personal information
- Manage education records
- Update work experience
- Manage projects portfolio
- Update certifications
- Edit skills proficiency

**Interview Prep**
- Role-based interview questions
- Difficulty levels (Easy, Medium, Hard)
- Bookmark important questions
- Interview tracking

**AI Career Chat**
- Real-time AI assistance
- Chat about analysis results
- Career guidance and advice
- Question answering about gaps and improvements

import asyncio
from datetime import datetime, timezone, timedelta
from app.database.session import async_session_maker, init_db
from app.database.models import User, UserProfile, UserInterest, Source, Article, Opportunity, OpportunityMatch


def utc_now():
    return datetime.now(timezone.utc)


async def seed():
    print("Initializing database tables...")
    await init_db()

    async with async_session_maker() as db:
        # Check if already seeded
        from sqlalchemy import select
        existing_user = (await db.execute(select(User))).scalars().first()
        if existing_user:
            print("Database already contains data. Skipping duplicate seed.")
            return

        print("Seeding demo user and profile...")
        user = User(
            email="alex.sharma@example.in",
            hashed_password="argon2id$mock$hash",
            full_name="Alex Sharma",
            is_active=True,
            is_admin=True,
        )
        db.add(user)
        await db.flush()

        profile = UserProfile(
            user_id=user.id,
            country="India",
            state="Karnataka",
            education_level="undergraduate",
            course_or_degree="B.Tech in Computer Science & Engineering",
            academic_year=3,
            annual_income=400000.0,
            age=21,
            skills=["Python", "Cloud Architecture", "Next.js", "Machine Learning", "FastAPI"],
            preferences={"notifications": True, "digest_frequency": "daily", "telegram_enabled": False},
        )
        db.add(profile)

        interests = [
            UserInterest(user_id=user.id, topic="Artificial Intelligence", weight=1.0),
            UserInterest(user_id=user.id, topic="Cloud & DevOps", weight=0.9),
            UserInterest(user_id=user.id, topic="Indian Tech Policy & Startups", weight=0.85),
            UserInterest(user_id=user.id, topic="Cybersecurity", weight=0.7),
        ]
        db.add_all(interests)

        print("Seeding approved source registry...")
        sources = [
            Source(
                name="Press Information Bureau (PIB Tech & Education)",
                slug="pib-tech-edu",
                category="government_scheme",
                source_type="rss",
                base_url="https://pib.gov.in",
                feed_url="https://pib.gov.in/RssMain.aspx?ModId=6",
                country="India",
                region="National",
                trust_level="official",
                fetch_interval_minutes=360,
                last_status="success",
            ),
            Source(
                name="National Scholarship Portal (NSP)",
                slug="nsp-official",
                category="scholarship",
                source_type="official_website",
                base_url="https://scholarships.gov.in",
                feed_url=None,
                country="India",
                region="National",
                trust_level="official",
                fetch_interval_minutes=720,
                last_status="success",
            ),
            Source(
                name="AICTE Official Internship Portal",
                slug="aicte-internships",
                category="career",
                source_type="api",
                base_url="https://internship.aicte-india.org",
                feed_url=None,
                country="India",
                region="National",
                trust_level="official",
                fetch_interval_minutes=360,
                last_status="success",
            ),
            Source(
                name="GitHub Education & Dev Pack",
                slug="github-education",
                category="company_offer",
                source_type="html",
                base_url="https://education.github.com/pack",
                feed_url=None,
                country="Global",
                region="Global",
                trust_level="official",
                fetch_interval_minutes=1440,
                last_status="success",
            ),
            Source(
                name="TechCrunch & Open Source Releases",
                slug="techcrunch-dev",
                category="news",
                source_type="rss",
                base_url="https://techcrunch.com",
                feed_url="https://techcrunch.com/category/artificial-intelligence/feed/",
                country="Global",
                region="Global",
                trust_level="verified_publisher",
                fetch_interval_minutes=60,
                last_status="success",
            ),
        ]
        db.add_all(sources)
        await db.flush()

        print("Seeding curated intelligence news...")
        articles = [
            Article(
                source_id=sources[4].id,
                title="India's Semiconductor Mission: 3 New Fabrication Facilities Approved with ₹1.26 Lakh Crore Outlay",
                canonical_url="https://pib.gov.in/PressReleasePage.aspx?PRID=2010200",
                author="Cabinet Committee on Economic Affairs",
                published_at=utc_now() - timedelta(hours=3),
                topic="Technology Policy",
                quality_score=0.96,
                relevance_score=0.92,
                summary_bullets=[
                    "Government has given final approval for three semiconductor plants in Gujarat and Assam with direct investment of ₹1,26,000 Crore.",
                    "Tata Electronics partners with Taiwan's PSMC to produce 28nm chips, creating an estimated 20,000 direct high-tech engineering jobs.",
                    "Commercial chip production targeted within 36 months, focusing on automotive, telecommunications, and defense electronics.",
                ],
                personal_impact="Directly expands Indian VLSI and hardware-firmware engineering job markets; universities across Karnataka and neighboring states are introducing sponsored R&D tracks.",
                practical_actions=[
                    "Check AICTE's portal for semiconductor design internship openings starting next quarter.",
                    "Review introductory Verilog and RISC-V course modules available through NPTEL with full fee waivers.",
                ],
                is_verified=True,
            ),
            Article(
                source_id=sources[4].id,
                title="OpenAI and Google Release Optimized Lightweight Models for Local On-Device AI Development",
                canonical_url="https://techcrunch.com/2026/open-source-lightweight-models-release",
                author="TechCrunch AI Desk",
                published_at=utc_now() - timedelta(hours=8),
                topic="Artificial Intelligence",
                quality_score=0.91,
                relevance_score=0.95,
                summary_bullets=[
                    "New sub-3-billion parameter quantized models run smoothly on standard laptops with 8GB RAM without cloud GPU dependencies.",
                    "Benchmark performance matches 2024 frontier models in code generation, JSON extraction, and document Q&A.",
                    "Native Ollama and llama.cpp compatibility allows complete local offline agent execution with zero token billing.",
                ],
                personal_impact="Enables local development of privacy-preserving background agents without API rate limits or recurring API expenditure.",
                practical_actions=[
                    "Test local model execution using Ollama for personal data extraction tasks.",
                    "Evaluate token latency on dev machines for real-time document summarization.",
                ],
                is_verified=True,
            ),
            Article(
                source_id=sources[0].id,
                title="Karnataka Digital Economy Mission Announces ₹25 Lakh Innovation Grants for Student Founders",
                canonical_url="https://kdem.karnataka.gov.in/student-grants-2026",
                author="Department of Electronics, IT & BT, Karnataka",
                published_at=utc_now() - timedelta(days=1),
                topic="Startups & Grants",
                quality_score=0.94,
                relevance_score=0.88,
                summary_bullets=[
                    "KDEM has opened applications for early-stage prototype grants offering up to ₹25,00,000 equity-free funding.",
                    "Eligible categories include AI for vernacular languages, agritech automation, and local supply chain logistics.",
                    "Shortlisted teams receive 6 months of cloud infrastructure support and incubation access across Bengaluru, Mysuru, and Mangaluru.",
                ],
                personal_impact="Alex Sharma resides in Karnataka and studies Computer Science, meeting 100% of the founding team residency criteria.",
                practical_actions=[
                    "Prepare 5-slide pitch deck highlighting prototype problem statement and tech stack.",
                    "Submit initial registration before the closing deadline on December 15, 2026.",
                ],
                is_verified=True,
            ),
        ]
        db.add_all(articles)

        print("Seeding opportunities with deterministic eligibility conditions...")
        opportunities = [
            Opportunity(
                source_id=sources[1].id,
                title="Central Sector Scheme of Scholarship for College and University Students (PM-USP)",
                category="scholarship",
                provider="Ministry of Education, Govt. of India",
                country="India",
                region="National",
                description="Financial assistance to meritorious students from low-income families to meet day-to-day college expenses while pursuing higher education.",
                benefit_type="financial",
                benefit_amount=20000.0,
                currency="INR",
                benefit_summary="₹12,000 / year for graduation + ₹20,000 / year for post-graduation",
                eligibility_rules={
                    "education_level": ["undergraduate", "postgraduate"],
                    "income_limit": 450000,
                    "min_marks_percentile": 80,
                    "allowed_regions": ["National", "All"],
                },
                application_deadline=utc_now() + timedelta(days=28),
                official_url="https://scholarships.gov.in/",
                supporting_url="https://pib.gov.in/PressReleasePage.aspx?PRID=2001923",
                verification_status="officially_verified",
                status="open",
            ),
            Opportunity(
                source_id=sources[3].id,
                title="GitHub Student Developer Pack (Free Cloud Credits & Dev Tools)",
                category="company_offer",
                provider="GitHub & Partner Ecosystem",
                country="Global",
                region="Global",
                description="Comprehensive bundle providing $100 DigitalOcean credits, $100 Microsoft Azure student credits, free JetBrains IDE licenses, free domains, and GitHub Copilot access.",
                benefit_type="credit",
                benefit_amount=150000.0,
                currency="INR",
                benefit_summary="Valued at over $2,000 (~₹1.6 Lakhs) in free developer software, cloud hosting & AI tooling",
                eligibility_rules={
                    "education_level": ["undergraduate", "postgraduate", "diploma"],
                    "requires_student_email": True,
                    "allowed_regions": ["Global", "All"],
                },
                application_deadline=utc_now() + timedelta(days=180),
                official_url="https://education.github.com/pack",
                supporting_url="https://github.blog/education-pack-updates",
                verification_status="officially_verified",
                status="open",
            ),
            Opportunity(
                source_id=sources[2].id,
                title="AICTE - Google Cloud Generative AI Career Internship & Certification Cohort",
                category="career",
                provider="AICTE in partnership with Google Cloud",
                country="India",
                region="National",
                description="Two-month sponsored virtual internship focusing on Cloud Architecture and Large Language Model deployment, including free vouchers for Google Cloud Associate Cloud Engineer exam.",
                benefit_type="internship",
                benefit_amount=0.0,
                currency="INR",
                benefit_summary="Free certification voucher (worth ₹10,500) + official AICTE digital badge + industry mentorship",
                eligibility_rules={
                    "education_level": ["undergraduate"],
                    "min_academic_year": 2,
                    "domains": ["Computer Science", "IT", "Electrical", "Electronics"],
                    "allowed_regions": ["National", "All"],
                },
                application_deadline=utc_now() + timedelta(days=12),
                official_url="https://internship.aicte-india.org",
                supporting_url="https://aicte-india.org/schemes/students-development-schemes",
                verification_status="officially_verified",
                status="open",
            ),
            Opportunity(
                source_id=sources[0].id,
                title="Karnataka State Post-Matric Scholarship (SSP Portal)",
                category="government_scheme",
                provider="Social Welfare Department, Government of Karnataka",
                country="India",
                region="Karnataka",
                description="Fee reimbursement and monthly maintenance allowance for students pursuing technical and professional degree courses in Karnataka recognized institutions.",
                benefit_type="financial",
                benefit_amount=35000.0,
                currency="INR",
                benefit_summary="Full tuition fee concession + ₹35,000 maintenance grant",
                eligibility_rules={
                    "education_level": ["undergraduate", "postgraduate"],
                    "state": "Karnataka",
                    "income_limit": 250000,
                    "allowed_regions": ["Karnataka"],
                },
                application_deadline=utc_now() + timedelta(days=45),
                official_url="https://ssp.postmatric.karnataka.gov.in/",
                supporting_url="https://sw.karnataka.gov.in/",
                verification_status="officially_verified",
                status="open",
            ),
        ]
        db.add_all(opportunities)
        await db.flush()

        print("Generating deterministic user matches against profile...")
        # 1. PM-USP: Income is 400k (<= 450k) -> MATCHED
        m1 = OpportunityMatch(
            user_id=user.id,
            opportunity_id=opportunities[0].id,
            match_status="MATCHED",
            fit_score=0.94,
            passed_criteria=["Education: Undergraduate", "Income: ₹4,00,000 is under the ₹4,50,000 ceiling"],
            failed_criteria=[],
            unknown_criteria=["High school percentile certificate requires upload verification"],
            reasons=["Your enrolled degree and family income strictly qualify under central guidelines."],
        )

        # 2. GitHub Pack: Undergrad student -> MATCHED
        m2 = OpportunityMatch(
            user_id=user.id,
            opportunity_id=opportunities[1].id,
            match_status="MATCHED",
            fit_score=0.98,
            passed_criteria=["Enrolled undergraduate student", "Active student status"],
            failed_criteria=[],
            unknown_criteria=[],
            reasons=["All enrolled college students are immediately eligible with college ID or edu email."],
        )

        # 3. AICTE Google Cloud: Year 3 CS -> MATCHED
        m3 = OpportunityMatch(
            user_id=user.id,
            opportunity_id=opportunities[2].id,
            match_status="MATCHED",
            fit_score=0.95,
            passed_criteria=["Academic Year: 3 is >= Year 2", "Degree: Computer Science matches allowed domains"],
            failed_criteria=[],
            unknown_criteria=[],
            reasons=["You meet all degree and year criteria for this cohort."],
        )

        # 4. Karnataka SSP: State matches (Karnataka), but income 400k exceeds 250k ceiling -> NOT_ELIGIBLE / POTENTIALLY_ELIGIBLE depending on category
        m4 = OpportunityMatch(
            user_id=user.id,
            opportunity_id=opportunities[3].id,
            match_status="POTENTIALLY_ELIGIBLE",
            fit_score=0.62,
            passed_criteria=["State: Karnataka domicile matches"],
            failed_criteria=["Income: ₹4,00,000 exceeds standard ₹2,50,000 category cutoff"],
            unknown_criteria=["Fee waiver may apply if enrolled via CET government quota seat"],
            reasons=["General cutoff is ₹2.5L, but fee waivers apply to CET government quota engineering admissions regardless of income."],
        )

        db.add_all([m1, m2, m3, m4])
        await db.commit()
        print("Database seed completed successfully with verified realistic data!")


if __name__ == "__main__":
    asyncio.run(seed())

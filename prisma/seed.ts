// Realistic seed for Software Engineering Department only – Final Year Project March 2026
// 3 academic sessions (2 fully completed + current), realistic multi-session student
// progression, and a bell-shaped GPA distribution across a much larger cohort.

import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
    console.log("🌍 Seeding full realistic data for Software Engineering Department...");

    // Clear everything
    await prisma.activityLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.contentProgress.deleteMany();
    await prisma.forumReply.deleteMany();
    await prisma.forumPost.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.answer.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.question.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.content.deleteMany();
    await prisma.module.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = hashSync("password123", 10);
    const department = "Software Engineering";

    function daysAgo(days: number) {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
    }

    function randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Average of 3 uniform draws approximates a bell curve centered at 0.5 —
    // used as a per-student "ability" so a given student's grades are
    // consistently strong/average/weak across courses and sessions instead of
    // being independently random every time (which looked unrealistic).
    function studentAbility() {
        return (Math.random() + Math.random() + Math.random()) / 3;
    }

    function gradeFromTotal(total: number): { grade: string; gradePoint: number } {
        if (total >= 70) return { grade: "A", gradePoint: 5 };
        if (total >= 60) return { grade: "B", gradePoint: 4 };
        if (total >= 50) return { grade: "C", gradePoint: 3 };
        if (total >= 45) return { grade: "D", gradePoint: 2 };
        if (total >= 40) return { grade: "E", gradePoint: 1 };
        return { grade: "F", gradePoint: 0 };
    }

    // Builds a full CA1/CA2/Exam/Total/Grade record for one course, given a
    // student's ability (0-1). Centered around a total score of ~60 (mean 42 +
    // 0.5*36) with a ~7-point spread, so the distribution lands mostly in the
    // B/C band (~85% of grades) with only ~8% reaching A and a small D/E/F
    // tail — "mostly average, few high performers".
    function generateGrade(ability: number) {
        const base = 42 + ability * 36;
        const noise = (Math.random() - 0.5) * 12;
        const total = Math.max(30, Math.min(98, Math.round(base + noise)));

        const examPct = 0.45 + Math.random() * 0.15;
        const exam = Math.round(total * examPct);
        const remaining = total - exam;
        const ca1 = Math.round(remaining * (0.4 + Math.random() * 0.2));
        const ca2 = remaining - ca1;

        const { grade, gradePoint } = gradeFromTotal(total);
        return { ca1, ca2, exam, total, grade, gradePoint };
    }

    // 1. Admin
    console.log("Creating Admin...");
    await prisma.user.create({
        data: {
            email: "admin@adun.edu.ng",
            password: hashedPassword,
            firstName: "System",
            lastName: "Administrator",
            role: "ADMIN",
            department,
            isActive: true,
        },
    });

    // 2. Lecturers (8)
    console.log("Creating Lecturers...");
    const lecturersData = [
        { email: "n.eze@adun.edu.ng", firstName: "Ngozi", lastName: "Eze", staffId: "SWE-LEC-001" },
        {
            email: "c.okoro@adun.edu.ng",
            firstName: "Chinedu",
            lastName: "Okoro",
            staffId: "SWE-LEC-002",
        },
        {
            email: "a.bello@adun.edu.ng",
            firstName: "Aisha",
            lastName: "Bello",
            staffId: "SWE-LEC-003",
        },
        {
            email: "m.suleiman@adun.edu.ng",
            firstName: "Musa",
            lastName: "Suleiman",
            staffId: "SWE-LEC-004",
        },
        {
            email: "f.okonkwo@adun.edu.ng",
            firstName: "Funmilayo",
            lastName: "Okonkwo",
            staffId: "SWE-LEC-005",
        },
        {
            email: "e.igwe@adun.edu.ng",
            firstName: "Emeka",
            lastName: "Igwe",
            staffId: "SWE-LEC-006",
        },
        {
            email: "h.abubakar@adun.edu.ng",
            firstName: "Halima",
            lastName: "Abubakar",
            staffId: "SWE-LEC-007",
        },
        {
            email: "t.adewale@adun.edu.ng",
            firstName: "Tunde",
            lastName: "Adewale",
            staffId: "SWE-LEC-008",
        },
    ];
    const lecturers: any[] = [];
    for (const l of lecturersData) {
        const lec = await prisma.user.create({
            data: { ...l, password: hashedPassword, role: "LECTURER", department, isActive: true },
        });
        lecturers.push(lec);
    }

    // 3. Courses (16, spanning all four levels)
    console.log("Creating Courses with Modules, Content & Assessments...");
    const coursesData = [
        // 100 Level
        {
            code: "SWE 101",
            title: "Introduction to Computing",
            level: 100,
            unit: 3,
            semester: "First",
        },
        {
            code: "SWE 102",
            title: "Elementary Programming",
            level: 100,
            unit: 3,
            semester: "First",
        },
        {
            code: "SWE 103",
            title: "Discrete Structures",
            level: 100,
            unit: 3,
            semester: "Second",
        },
        {
            code: "SWE 104",
            title: "Computer Ethics & Society",
            level: 100,
            unit: 2,
            semester: "Second",
        },
        // 200 Level
        {
            code: "SWE 201",
            title: "Introduction to Software Engineering",
            level: 200,
            unit: 3,
            semester: "First",
        },
        {
            code: "SWE 202",
            title: "Software Requirements Engineering",
            level: 200,
            unit: 3,
            semester: "First",
        },
        {
            code: "SWE 203",
            title: "Data Structures & Algorithms",
            level: 200,
            unit: 3,
            semester: "Second",
        },
        {
            code: "SWE 204",
            title: "Web Application Development",
            level: 200,
            unit: 3,
            semester: "Second",
        },
        // 300 Level
        {
            code: "SWE 301",
            title: "Object-Oriented Analysis & Design",
            level: 300,
            unit: 3,
            semester: "First",
        },
        {
            code: "SWE 305",
            title: "Operating Systems",
            level: 300,
            unit: 3,
            semester: "First",
        },
        {
            code: "SWE 302",
            title: "Software Architecture & Patterns",
            level: 300,
            unit: 3,
            semester: "Second",
        },
        {
            code: "SWE 303",
            title: "Database Systems for SWE",
            level: 300,
            unit: 3,
            semester: "Second",
        },
        // 400 Level
        {
            code: "SWE 401",
            title: "Software Testing & Quality Assurance",
            level: 400,
            unit: 3,
            semester: "First",
        },
        {
            code: "SWE 405",
            title: "Distributed Systems",
            level: 400,
            unit: 3,
            semester: "First",
        },
        {
            code: "SWE 402",
            title: "Software Project Management",
            level: 400,
            unit: 3,
            semester: "Second",
        },
        {
            code: "SWE 404",
            title: "Human-Computer Interaction",
            level: 400,
            unit: 2,
            semester: "Second",
        },
    ];

    const courses: any[] = [];
    // Per-course lookup of the pieces we'll need later to seed submissions,
    // answers, and content progress against the right records.
    const courseExtras: Record<
        string,
        { contentIds: string[]; quizId: string; assignmentId: string }
    > = {};

    // Real, publicly-reachable sample media so course content actually plays/
    // downloads in a live demo instead of linking to fake example.com URLs.
    const sampleVideos = [
        "https://www.w3schools.com/html/mov_bbb.mp4",
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    ];
    const sampleDocs = [
        "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    ];

    for (let i = 0; i < coursesData.length; i++) {
        const course = await prisma.course.create({
            data: {
                ...coursesData[i],
                description: `Official curriculum for ${coursesData[i].title}.`,
                instructorId: lecturers[i % lecturers.length].id,
                isPublished: true,
            },
        });
        courses.push(course);

        // Module 1: Fundamentals
        const mod1 = await prisma.module.create({
            data: { title: "Fundamentals", order: 1, courseId: course.id },
        });
        const lecture1 = await prisma.content.create({
            data: {
                title: `Lecture 1: Introduction to ${course.title}`,
                type: "VIDEO",
                url: sampleVideos[i % sampleVideos.length],
                duration: 45,
                order: 1,
                moduleId: mod1.id,
            },
        });
        const reading1 = await prisma.content.create({
            data: {
                title: "Lecture Notes: Chapter 1 Handout",
                type: "DOCUMENT",
                url: sampleDocs[i % sampleDocs.length],
                duration: 0,
                order: 2,
                moduleId: mod1.id,
            },
        });

        // Module 2: Advanced Topics
        const mod2 = await prisma.module.create({
            data: {
                title: "Advanced Topics & Case Studies",
                order: 2,
                courseId: course.id,
            },
        });
        const lecture2 = await prisma.content.create({
            data: {
                title: `Lecture 2: Core Concepts in ${course.code}`,
                type: "VIDEO",
                url: sampleVideos[(i + 1) % sampleVideos.length],
                duration: 50,
                order: 1,
                moduleId: mod2.id,
            },
        });
        const reading2 = await prisma.content.create({
            data: {
                title: "Recommended Reading & Reference Slides",
                type: "DOCUMENT",
                url: sampleDocs[(i + 1) % sampleDocs.length],
                duration: 0,
                order: 2,
                moduleId: mod2.id,
            },
        });

        // Assessments — First Semester courses are already complete (past due
        // dates); Second Semester courses are still ongoing (due dates ahead).
        const isCompletedSemester = course.semester === "First";
        const quiz = await prisma.assessment.create({
            data: {
                title: `Mid-Semester Quiz - ${course.code}`,
                type: "QUIZ",
                courseId: course.id,
                totalMarks: 30,
                passMark: 15,
                duration: 30,
                dueDate: isCompletedSemester ? daysAgo(45) : daysAgo(-21),
                isPublished: true,
            },
        });
        const assignment = await prisma.assessment.create({
            data: {
                title: `Term Paper - ${course.code}`,
                type: "ASSIGNMENT",
                courseId: course.id,
                totalMarks: 40,
                passMark: 20,
                dueDate: isCompletedSemester ? daysAgo(30) : daysAgo(-35),
                isPublished: true,
            },
        });

        courseExtras[course.id] = {
            contentIds: [lecture1.id, reading1.id, lecture2.id, reading2.id],
            quizId: quiz.id,
            assignmentId: assignment.id,
        };
    }

    const coursesByLevel: Record<number, any[]> = {};
    for (const course of courses) {
        (coursesByLevel[course.level] ??= []).push(course);
    }

    // 4. Students (100, spread across all four levels)
    console.log("Creating 100 Students...");
    const firstNames = [
        "Olumide",
        "Fatima",
        "Ade",
        "Binta",
        "Emeka",
        "Nneka",
        "Oluwaseun",
        "Zainab",
        "Kelechi",
        "Blessing",
        "Emmanuel",
        "Chiamaka",
        "Damilola",
        "Abubakar",
        "Funke",
        "Ibrahim",
        "Tolu",
        "Yusuf",
        "Chioma",
        "Samuel",
        "Ngozi",
        "Chukwuemeka",
        "Aisha",
        "Segun",
        "Amaka",
        "Yakubu",
        "Ronke",
        "Uche",
        "Halima",
        "Godwin",
    ];
    const lastNames = [
        "Adeyemi",
        "Yusuf",
        "Okafor",
        "Abdullahi",
        "Igu",
        "Nwosu",
        "Balogun",
        "Suleiman",
        "Okeke",
        "Adebayo",
        "Eze",
        "Obi",
        "Ogunleye",
        "Danladi",
        "Ademola",
        "Mustapha",
        "Adebowale",
        "Garba",
        "Nwachukwu",
        "Ojo",
        "Bello",
        "Chukwu",
        "Sani",
        "Uzoma",
        "Fashola",
        "Aliyu",
        "Nnamdi",
        "Okorie",
        "Lawal",
        "Umeh",
    ];

    // Admission year (2-digit) per current level — higher levels were
    // admitted earlier, e.g. a 400L student's matric year predates a
    // freshly-admitted 100L student's.
    const admissionYearByLevel: Record<number, string> = {
        100: "25",
        200: "24",
        300: "23",
        400: "22",
    };

    // Three academic sessions: two fully completed, one current (in progress,
    // Second Semester). A student's course history is derived from how many
    // of these sessions they've been enrolled for — a 400L student has been
    // around for all 3 (200L → 300L → 400L); a fresh 100L student has only
    // this one.
    const SESSIONS = ["2023/2024", "2024/2025", "2025/2026"];
    const CURRENT_SESSION = SESSIONS[SESSIONS.length - 1];

    function sessionHistoryForLevel(currentLevel: number) {
        const historyDepth = currentLevel === 100 ? 1 : currentLevel === 200 ? 2 : 3;
        const startIdx = SESSIONS.length - historyDepth;
        const pairs: { session: string; level: number; isCurrent: boolean }[] = [];
        for (let i = startIdx; i < SESSIONS.length; i++) {
            const stepsFromCurrent = SESSIONS.length - 1 - i;
            pairs.push({
                session: SESSIONS[i],
                level: currentLevel - stepsFromCurrent * 100,
                isCurrent: i === SESSIONS.length - 1,
            });
        }
        return pairs;
    }

    const currentLevels = [100, 200, 300, 400];
    const studentsPerLevel = 25;

    const students: any[] = [];
    let studentIndex = 0;
    for (const level of currentLevels) {
        for (let j = 0; j < studentsPerLevel; j++) {
            const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
            const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
            const matricNumber = `ADUN/FS/SEN/${admissionYearByLevel[level]}/${String(studentIndex + 1).padStart(3, "0")}`;

            const student = await prisma.user.create({
                data: {
                    email: `stu${studentIndex}@adun.edu.ng`,
                    password: hashedPassword,
                    firstName: fn,
                    lastName: ln,
                    role: "STUDENT",
                    department,
                    level,
                    matricNumber,
                    isActive: true,
                },
            });
            students.push({ ...student, ability: studentAbility() });
            studentIndex++;
        }
    }

    // 5. Enrollments (current session only) + full multi-session grade history
    console.log("Creating Enrollments & Multi-Session Grade History...");
    const enrollmentsData: any[] = [];
    const gradesData: any[] = [];

    for (const student of students) {
        const history = sessionHistoryForLevel(student.level!);

        for (const pair of history) {
            const levelCourses = coursesByLevel[pair.level] || [];

            if (pair.isCurrent) {
                // Current session: enroll in every course at their level. First
                // Semester courses are already graded; Second Semester is
                // still ongoing (handled via submissions/content-progress below).
                for (const course of levelCourses) {
                    enrollmentsData.push({
                        userId: student.id,
                        courseId: course.id,
                        progress: randomInt(20, 90),
                    });

                    if (course.semester === "First") {
                        gradesData.push({
                            userId: student.id,
                            courseId: course.id,
                            ...generateGrade(student.ability),
                            semester: "First",
                            session: pair.session,
                        });
                    }
                }
            } else {
                // Past session: fully graded, both semesters.
                for (const course of levelCourses) {
                    gradesData.push({
                        userId: student.id,
                        courseId: course.id,
                        ...generateGrade(student.ability),
                        semester: course.semester,
                        session: pair.session,
                    });
                }
            }
        }
    }

    // Bulk inserts
    await prisma.enrollment.createMany({ data: enrollmentsData });
    await prisma.grade.createMany({ data: gradesData });

    // 6. Forum Discussions (rich, realistic content across courses)
    console.log("Creating Forum Discussions...");

    const courseEnrolledStudents: Record<string, string[]> = {};
    for (const e of enrollmentsData) {
        (courseEnrolledStudents[e.courseId] ??= []).push(e.userId);
    }

    // 7. Quiz questions, submissions, answers & content progress — this is what
    // actually feeds student/lecturer/department analytics (predicted grades,
    // pass rates, engagement scores). Without it every dashboard shows zeros.
    console.log("Creating Quiz Questions...");

    const questionBank = [
        {
            text: "Which of these best describes the primary goal of software engineering?",
            options: [
                "Applying engineering principles to build reliable software systems",
                "Writing code as fast as possible",
                "Designing computer hardware",
                "Managing office IT support",
            ],
            correctAnswer: "Applying engineering principles to build reliable software systems",
        },
        {
            text: "Which SDLC phase focuses on gathering what the system must do?",
            options: ["Requirements Analysis", "Deployment", "Maintenance", "Coding"],
            correctAnswer: "Requirements Analysis",
        },
        {
            text: "What is the main purpose of a version control system like Git?",
            options: [
                "Track and manage changes to code over time",
                "Compile source code faster",
                "Design user interfaces",
                "Send automated emails",
            ],
            correctAnswer: "Track and manage changes to code over time",
        },
        {
            text: "In Agile methodology, what is a 'sprint'?",
            options: [
                "A time-boxed iteration of development work",
                "A critical software bug",
                "A deployment pipeline",
                "A type of database index",
            ],
            correctAnswer: "A time-boxed iteration of development work",
        },
        {
            text: "What does database 'normalization' primarily achieve?",
            options: [
                "Reduces data redundancy and improves integrity",
                "Encrypts sensitive data",
                "Compresses file storage",
                "Speeds up network requests",
            ],
            correctAnswer: "Reduces data redundancy and improves integrity",
        },
    ];

    const questionsData: any[] = [];
    const courseQuestionIds: Record<string, string[]> = {};

    for (const course of courses) {
        const { quizId } = courseExtras[course.id];
        const qIds: string[] = [];
        for (let q = 0; q < 4; q++) {
            const qId = randomUUID();
            const bank = questionBank[q % questionBank.length];
            questionsData.push({
                id: qId,
                text: bank.text,
                type: "MCQ",
                options: bank.options,
                correctAnswer: bank.correctAnswer,
                marks: 1,
                order: q + 1,
                assessmentId: quizId,
            });
            qIds.push(qId);
        }
        courseQuestionIds[course.id] = qIds;
    }
    await prisma.question.createMany({ data: questionsData });

    console.log("Creating Submissions, Answers & Content Progress...");
    const submissionsData: any[] = [];
    const answersData: any[] = [];
    const contentProgressData: any[] = [];

    for (const e of enrollmentsData) {
        const course = courses.find((c) => c.id === e.courseId)!;
        const extras = courseExtras[course.id];
        const isFirstSemester = course.semester === "First";

        // Quiz submission + per-question answers. First semester is always
        // submitted and graded (it's complete); second semester is a mix of
        // submitted/graded/not-yet-attempted so lecturers have a real "pending
        // grading" queue and students have a real "pending tasks" count.
        const quizSubmitted = isFirstSemester || Math.random() < 0.75;
        if (quizSubmitted) {
            const submissionId = randomUUID();
            const quizGraded = isFirstSemester || Math.random() < 0.7;
            const quizScorePct = randomInt(30, 98);
            const quizScore = quizGraded ? Math.round((quizScorePct / 100) * 30) : null;

            submissionsData.push({
                id: submissionId,
                userId: e.userId,
                assessmentId: extras.quizId,
                status: quizGraded ? "GRADED" : "SUBMITTED",
                score: quizScore,
                feedback: quizGraded
                    ? quizScorePct >= 70
                        ? "Excellent understanding of the core concepts."
                        : "Good effort — review the areas you missed."
                    : null,
                submittedAt: daysAgo(isFirstSemester ? randomInt(70, 110) : randomInt(2, 20)),
                gradedAt: quizGraded
                    ? daysAgo(isFirstSemester ? randomInt(65, 100) : randomInt(1, 15))
                    : null,
            });

            courseQuestionIds[course.id].forEach((qId, idx) => {
                const isCorrect = Math.random() < quizScorePct / 100;
                answersData.push({
                    id: randomUUID(),
                    submissionId,
                    questionId: qId,
                    answer: isCorrect
                        ? questionBank[idx % questionBank.length].correctAnswer
                        : "An incorrect option",
                    isCorrect: quizGraded ? isCorrect : null,
                    marksAwarded: quizGraded ? (isCorrect ? 1 : 0) : null,
                });
            });
        }

        // Term paper submission — similar mix for second semester
        const assignmentSubmitted = isFirstSemester || Math.random() < 0.65;
        if (assignmentSubmitted) {
            const assignGraded = isFirstSemester || Math.random() < 0.6;
            const assignScorePct = randomInt(35, 96);

            submissionsData.push({
                id: randomUUID(),
                userId: e.userId,
                assessmentId: extras.assignmentId,
                status: assignGraded ? "GRADED" : "SUBMITTED",
                fileUrl: "https://example.com/submissions/term-paper.pdf",
                score: assignGraded ? Math.round((assignScorePct / 100) * 40) : null,
                feedback: assignGraded
                    ? "Well-structured submission, good use of references."
                    : null,
                submittedAt: daysAgo(isFirstSemester ? randomInt(60, 100) : randomInt(1, 15)),
                gradedAt: assignGraded
                    ? daysAgo(isFirstSemester ? randomInt(55, 90) : randomInt(1, 10))
                    : null,
            });
        }

        // Content progress — First Semester courses are mostly completed by
        // now; Second Semester is a realistic partial/in-progress split.
        for (const contentId of extras.contentIds) {
            const completed = isFirstSemester ? Math.random() < 0.9 : Math.random() < 0.5;
            contentProgressData.push({
                id: randomUUID(),
                userId: e.userId,
                contentId,
                completed,
                timeSpent: completed ? randomInt(300, 3600) : randomInt(30, 900),
                lastAccessed: daysAgo(isFirstSemester ? randomInt(30, 100) : randomInt(1, 25)),
            });
        }
    }

    await prisma.submission.createMany({ data: submissionsData });
    await prisma.answer.createMany({ data: answersData });
    await prisma.contentProgress.createMany({ data: contentProgressData });

    // 8. Activity logs — powers each student's engagement score on their
    // analytics dashboard (login count over the current academic session).
    console.log("Creating Activity Logs...");
    const activityData: any[] = [];
    for (const student of students) {
        const loginCount = randomInt(10, 45);
        for (let i = 0; i < loginCount; i++) {
            activityData.push({
                id: randomUUID(),
                userId: student.id,
                action: "LOGIN",
                metadata: {},
                createdAt: daysAgo(randomInt(0, 110)),
            });
        }
    }
    await prisma.activityLog.createMany({ data: activityData });

    // Forum discussions across the whole catalog
    for (const course of courses) {
        const instructor = lecturers.find((l) => l.id === course.instructorId)!;
        const enrolled = courseEnrolledStudents[course.id] || [];
        if (enrolled.length === 0) continue;

        const pickStudent = () => enrolled[Math.floor(Math.random() * enrolled.length)];
        const isFirstSemester = course.semester === "First";

        // Lecturer's pinned welcome announcement
        const announcement = await prisma.forumPost.create({
            data: {
                title: `Welcome to ${course.code} — ${course.semester} Semester`,
                body: `Hello everyone, welcome to ${course.title}. Please review the course outline in Module 1 and reach out here with any questions. Office hours are Tuesdays and Thursdays.`,
                courseId: course.id,
                authorId: instructor.id,
                isPinned: true,
                likes: Math.floor(Math.random() * 8) + 2,
                createdAt: daysAgo(isFirstSemester ? 90 : 30),
            },
        });
        await prisma.forumReply.create({
            data: {
                body: "Thank you, sir! Looking forward to the semester.",
                postId: announcement.id,
                authorId: pickStudent(),
                likes: Math.floor(Math.random() * 3),
                createdAt: daysAgo(isFirstSemester ? 89 : 29),
            },
        });

        // Student question about assessment requirements, answered by lecturer
        const question = await prisma.forumPost.create({
            data: {
                title: `Clarification needed on ${course.code} Term Paper requirements`,
                body: "Hi everyone, does the term paper need to follow IEEE format, or is APA acceptable? Also, is there a minimum page count?",
                courseId: course.id,
                authorId: pickStudent(),
                likes: Math.floor(Math.random() * 5),
                createdAt: daysAgo(isFirstSemester ? 60 : 10),
            },
        });
        await prisma.forumReply.create({
            data: {
                body: "APA is fine as long as citations are consistent. Minimum 8 pages excluding references.",
                postId: question.id,
                authorId: instructor.id,
                likes: Math.floor(Math.random() * 6) + 1,
                createdAt: daysAgo(isFirstSemester ? 59 : 9),
            },
        });
        await prisma.forumReply.create({
            data: {
                body: "Thanks for asking this — I had the same question!",
                postId: question.id,
                authorId: pickStudent(),
                likes: Math.floor(Math.random() * 4),
                createdAt: daysAgo(isFirstSemester ? 58 : 8),
            },
        });

        // Peer-organized study group thread
        const studyThread = await prisma.forumPost.create({
            data: {
                title: `Study group for ${course.code} — anyone interested?`,
                body: "I'm putting together a small study group to go over past questions before the exam. Drop a reply if you'd like to join.",
                courseId: course.id,
                authorId: pickStudent(),
                likes: Math.floor(Math.random() * 7),
                createdAt: daysAgo(isFirstSemester ? 40 : 5),
            },
        });
        await prisma.forumReply.create({
            data: {
                body: "Count me in! What time works for everyone?",
                postId: studyThread.id,
                authorId: pickStudent(),
                likes: Math.floor(Math.random() * 3),
                createdAt: daysAgo(isFirstSemester ? 39 : 4),
            },
        });
    }

    console.log("✅ Seeding completed successfully!");
    console.log(
        `→ ${students.length} students, ${lecturers.length} lecturers, ${courses.length} courses`
    );
    console.log(
        `→ 3 academic sessions tracked: ${SESSIONS.join(", ")} (current: ${CURRENT_SESSION})`
    );
    console.log("→ Students carry multi-session grade history matching their current level");
    console.log("→ First semester of the current session is graded; Second semester is ongoing");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

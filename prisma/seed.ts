// Realistic seed for Software Engineering Department only – Final Year Project March 2026
// Fully dynamic: First semester fully graded + Second semester ongoing + rich content

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

    // 2. Lecturers
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
    ];
    const lecturers: any[] = [];
    for (const l of lecturersData) {
        const lec = await prisma.user.create({
            data: { ...l, password: hashedPassword, role: "LECTURER", department, isActive: true },
        });
        lecturers.push(lec);
    }

    // 3. Courses (First + Second Semester)
    console.log("Creating Courses with Modules, Content & Assessments...");
    const coursesData = [
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
            code: "SWE 301",
            title: "Object-Oriented Analysis & Design",
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
        {
            code: "SWE 401",
            title: "Software Testing & Quality Assurance",
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

        // Create Module + Content for each course
        const mod = await prisma.module.create({
            data: { title: "Module 1: Fundamentals", order: 1, courseId: course.id },
        });
        const lecture = await prisma.content.create({
            data: {
                title: "Course Overview Lecture",
                type: "VIDEO",
                url: "https://example.com/video.mp4",
                duration: 60,
                order: 1,
                moduleId: mod.id,
            },
        });
        const reading = await prisma.content.create({
            data: {
                title: "Reading Material",
                type: "DOCUMENT",
                url: "https://example.com/reading.pdf",
                duration: 0,
                order: 2,
                moduleId: mod.id,
            },
        });

        // Create Assessments for every course
        const quiz = await prisma.assessment.create({
            data: {
                title: `Mid-Semester Quiz - ${course.code}`,
                type: "QUIZ",
                courseId: course.id,
                totalMarks: 30,
                passMark: 15,
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
                isPublished: true,
            },
        });

        courseExtras[course.id] = {
            contentIds: [lecture.id, reading.id],
            quizId: quiz.id,
            assignmentId: assignment.id,
        };
    }

    // 4. Students
    console.log("Creating 40 Students...");
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
    ];

    const students: any[] = [];
    for (let i = 0; i < 40; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        // Only 200/300/400-level courses exist in the catalog — assigning a
        // student to 100L would leave them with zero eligible courses and a
        // permanently blank dashboard, so we don't generate that level.
        const levelCode = [200, 300, 400][i % 3];

        const student = await prisma.user.create({
            data: {
                email: `stu${i}@adun.edu.ng`,
                password: hashedPassword,
                firstName: fn,
                lastName: ln,
                role: "STUDENT",
                department,
                level: levelCode,
                matricNumber: `SWE/${levelCode}/${1000 + i}`,
                isActive: true,
            },
        });
        students.push(student);
    }

    // 5. Enrollments + First Semester Grades (completed) + Second Semester ongoing
    console.log("Creating Enrollments, Assessments, Submissions, Grades & Progress...");
    const enrollmentsData: any[] = [];
    const gradesData: any[] = [];

    for (const student of students) {
        const eligibleCourses = courses.filter((c) => c.level <= student.level!);
        const selectedCourses = eligibleCourses.sort(() => 0.5 - Math.random()).slice(0, 5);

        for (const course of selectedCourses) {
            // Enrollment
            enrollmentsData.push({
                userId: student.id,
                courseId: course.id,
                progress: Math.floor(Math.random() * 100),
            });

            // If First Semester course → fully graded
            if (course.semester === "First") {
                const total = Math.floor(Math.random() * 35) + 65; // 65-99
                let gradeLetter = "F";
                let gp = 0;
                if (total >= 70) {
                    gradeLetter = "A";
                    gp = 5;
                } else if (total >= 60) {
                    gradeLetter = "B";
                    gp = 4;
                } else if (total >= 50) {
                    gradeLetter = "C";
                    gp = 3;
                } else if (total >= 45) {
                    gradeLetter = "D";
                    gp = 2;
                } else if (total >= 40) {
                    gradeLetter = "E";
                    gp = 1;
                }

                gradesData.push({
                    userId: student.id,
                    courseId: course.id,
                    ca1: Math.floor(Math.random() * 30) + 15,
                    ca2: Math.floor(Math.random() * 40) + 20,
                    exam: Math.floor(Math.random() * 60) + 25,
                    total,
                    grade: gradeLetter,
                    gradePoint: gp,
                    semester: "First",
                    session: "2025/2026",
                });
            }
            // Second Semester → ongoing (some submissions only)
            else {
                // We'll leave some grades empty for second semester (current)
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

    function daysAgo(days: number) {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
    }

    function randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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

    // Cover most courses with discussion activity, keep seed runtime reasonable
    const forumSeedCourses = courses.slice(0, 6);

    for (const course of forumSeedCourses) {
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
    console.log("→ First semester courses are fully graded");
    console.log("→ Second semester courses have enrollments and partial data");
    console.log("→ Modules, content, assessments, and forum are populated");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

// Realistic seed for Software Engineering Department only – Final Year Project March 2026 (Optimized + Fixed)

import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding the database for Software Engineering Department...');

    // Clear existing data safely
    console.log('Cleaning up existing database...');
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

    // 1. Create Admin
    console.log('Creating Admin...');
    await prisma.user.create({
        data: {
            email: "admin@adun.edu.ng",
            password: hashedPassword,
            firstName: "System",
            lastName: "Administrator",
            role: "ADMIN",
            department,
            isActive: true,
        }
    });

    // 2. Create Lecturers
    console.log('Creating Lecturers...');
    const lecturersData = [
        { email: "n.eze@adun.edu.ng", firstName: "Ngozi", lastName: "Eze", staffId: "SWE-LEC-001" },
        { email: "c.okoro@adun.edu.ng", firstName: "Chinedu", lastName: "Okoro", staffId: "SWE-LEC-002" },
        { email: "a.bello@adun.edu.ng", firstName: "Aisha", lastName: "Bello", staffId: "SWE-LEC-003" },
    ];

    const lecturers: any[] = [];
    for (const l of lecturersData) {
        const lecturer = await prisma.user.create({
            data: {
                ...l,
                password: hashedPassword,
                role: "LECTURER",
                department,
                isActive: true,
            }
        });
        lecturers.push(lecturer);
    }

    // 3. Create Courses and Core Materials
    console.log('Creating Courses...');
    const coursesData = [
        { code: "SWE 201", title: "Introduction to Software Engineering", level: 200, unit: 3, semester: "First" },
        { code: "SWE 202", title: "Software Requirements Engineering", level: 200, unit: 3, semester: "Second" },
        { code: "SWE 301", title: "Object-Oriented Analysis & Design", level: 300, unit: 3, semester: "First" },
        { code: "SWE 302", title: "Software Architecture & Patterns", level: 300, unit: 3, semester: "Second" },
        { code: "SWE 303", title: "Database Systems for SWE", level: 300, unit: 3, semester: "First" },
        { code: "SWE 401", title: "Software Testing & Quality Assurance", level: 400, unit: 3, semester: "First" },
        { code: "SWE 402", title: "Software Project Management", level: 400, unit: 3, semester: "Second" },
        { code: "SWE 404", title: "Human-Computer Interaction", level: 400, unit: 2, semester: "Second" },
    ];

    const courses: any[] = [];
    const coreAssessments: any[] = [];
    const coreContents: any[] = [];

    for (let i = 0; i < coursesData.length; i++) {
        const course = await prisma.course.create({
            data: {
                ...coursesData[i],
                description: `Official curriculum for ${coursesData[i].title}.`,
                instructorId: lecturers[i % lecturers.length].id,
                isPublished: true,
            }
        });
        courses.push(course);

        const mod = await prisma.module.create({
            data: { title: "Week 1: Introduction", order: 1, courseId: course.id }
        });
        const content = await prisma.content.create({
            data: { title: "Course Overview Lecture", type: "VIDEO", url: "https://example.com/video.mp4", duration: 45, order: 1, moduleId: mod.id }
        });
        coreContents.push(content);

        const quiz = await prisma.assessment.create({
            data: { title: `Mid-Semester Quiz - ${course.code}`, type: "QUIZ", courseId: course.id, totalMarks: 30, passMark: 15, isPublished: true }
        });
        const assignment = await prisma.assessment.create({
            data: { title: `Term Paper - ${course.code}`, type: "ASSIGNMENT", courseId: course.id, totalMarks: 40, passMark: 20, isPublished: true }
        });
        coreAssessments.push(quiz, assignment);
    }

    // 4. Create Students
    console.log('Creating 40 Students...');
    const firstNames = ["Olumide", "Fatima", "Ade", "Binta", "Emeka", "Nneka", "Oluwaseun", "Zainab", "Kelechi", "Blessing", "Emmanuel", "Chiamaka", "Damilola", "Abubakar", "Funke", "Ibrahim", "Tolu", "Yusuf", "Chioma", "Samuel"];
    const lastNames = ["Adeyemi", "Yusuf", "Okafor", "Abdullahi", "Igu", "Nwosu", "Balogun", "Suleiman", "Okeke", "Adebayo", "Eze", "Obi", "Ogunleye", "Danladi", "Ademola", "Mustapha", "Adebowale", "Garba", "Nwachukwu", "Ojo"];

    const students: any[] = [];
    for (let i = 0; i < 40; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        const levelCode = [100, 200, 300, 400][i % 4];

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
            }
        });
        students.push(student);
    }

    // 5. Generate Bulk Data in Memory
    console.log('Generating Bulk Academic Records...');
    const enrollmentsData: any[] = [];
    const submissionsData: any[] = [];
    const gradesData: any[] = [];
    const progressData: any[] = [];
    const activityData: any[] = [];

    const pastOneWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pastTwoWeeks = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    for (const student of students) {
        const eligibleCourses = courses.filter(c => c.level <= student.level!);
        let limit = Math.floor(Math.random() * 3) + 4;
        if (eligibleCourses.length < limit) limit = eligibleCourses.length;

        const selectedCourses = eligibleCourses.sort(() => 0.5 - Math.random()).slice(0, limit);

        for (const course of selectedCourses) {
            enrollmentsData.push({ userId: student.id, courseId: course.id, progress: Math.floor(Math.random() * 100) });

            const courseQuiz = coreAssessments.find(a => a.courseId === course.id && a.type === "QUIZ");
            const courseAssignment = coreAssessments.find(a => a.courseId === course.id && a.type === "ASSIGNMENT");

            const isAtRisk = Math.random() < 0.15;
            const isTop = Math.random() < 0.20;
            const getScore = (max: number) =>
                isAtRisk ? Math.floor(Math.random() * (max * 0.45))
                    : isTop ? Math.floor(Math.random() * (max * 0.2)) + (max * 0.8)
                        : Math.floor(Math.random() * (max * 0.35)) + (max * 0.5);

            const ca1Score = getScore(30);
            const assignmentScore = getScore(40);
            const examScore = getScore(60);

            if (courseQuiz) submissionsData.push({ userId: student.id, assessmentId: courseQuiz.id, status: "GRADED", score: ca1Score, submittedAt: pastTwoWeeks });
            if (courseAssignment) submissionsData.push({ userId: student.id, assessmentId: courseAssignment.id, status: "GRADED", score: assignmentScore, submittedAt: pastOneWeek });

            const finalTotal = Math.min(100, Math.floor(ca1Score + (assignmentScore / 40) * 30 + (examScore / 60) * 40));
            let gradeLetter = "F"; let gp = 0.0;
            if (finalTotal >= 70) { gradeLetter = "A"; gp = 5.0; }
            else if (finalTotal >= 60) { gradeLetter = "B"; gp = 4.0; }
            else if (finalTotal >= 50) { gradeLetter = "C"; gp = 3.0; }
            else if (finalTotal >= 45) { gradeLetter = "D"; gp = 2.0; }
            else if (finalTotal >= 40) { gradeLetter = "E"; gp = 1.0; }

            gradesData.push({
                userId: student.id,
                courseId: course.id,
                ca1: ca1Score,
                ca2: assignmentScore,
                exam: examScore,
                total: finalTotal,
                grade: gradeLetter,
                gradePoint: gp,
                semester: course.semester,
                session: "2025/2026",
            });

            // Progress (safe version)
            const courseContent = coreContents.find(() => true); // simple safe pick
            if (courseContent) {
                progressData.push({
                    userId: student.id,
                    contentId: courseContent.id,
                    completed: true,
                    timeSpent: Math.floor(Math.random() * 1200) + 300
                });
            }
        }

        // Activity Logs (max 5)
        const numLogins = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < numLogins; i++) {
            activityData.push({ userId: student.id, action: "LOGIN" });
        }
    }

    // 6. Bulk Inserts
    console.log(`Writing ${enrollmentsData.length} Enrollments...`);
    await prisma.enrollment.createMany({ data: enrollmentsData });

    console.log(`Writing ${submissionsData.length} Submissions...`);
    await prisma.submission.createMany({ data: submissionsData });

    console.log(`Writing ${gradesData.length} Grades...`);
    await prisma.grade.createMany({ data: gradesData });

    console.log(`Writing ${progressData.length} Progress Logs...`);
    await prisma.contentProgress.createMany({
        data: progressData,
        skipDuplicates: true
    });

    console.log(`Writing ${activityData.length} Activity Logs...`);
    await prisma.activityLog.createMany({ data: activityData });

    console.log('✅ Seeding completed successfully!');
    console.log(`Created: 1 Admin • 3 Lecturers • 8 Courses • 40 Students`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
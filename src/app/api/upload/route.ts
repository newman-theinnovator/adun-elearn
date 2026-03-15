import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file provided" }, { status: 400 });
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB
            return NextResponse.json({ message: "File exceeds 50MB limit" }, { status: 400 });
        }

        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
            .from('elearn-assets')
            .upload(`uploads/${fileName}`, buffer, {
                contentType: file.type,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json({ message: "File upload failed" }, { status: 500 });
        }

        const { data: publicData } = supabase.storage
            .from('elearn-assets')
            .getPublicUrl(`uploads/${fileName}`);

        return NextResponse.json({ url: publicData.publicUrl }, { status: 201 });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

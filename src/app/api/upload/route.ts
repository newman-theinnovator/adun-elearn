import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { apiSuccess, unauthorized, apiError } from "@/lib/api-response";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return apiError(400, "No file provided");
        }

        if (file.size > 50 * 1024 * 1024) {
            // 50MB
            return apiError(400, "File exceeds 50MB limit");
        }

        const fileExtension = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error } = await supabase.storage
            .from("elearn-assets")
            .upload(`uploads/${fileName}`, buffer, {
                contentType: file.type,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return apiError(500, "File upload failed");
        }

        const { data: publicData } = supabase.storage
            .from("elearn-assets")
            .getPublicUrl(`uploads/${fileName}`);

        return apiSuccess({ url: publicData.publicUrl }, 201);
    } catch (error) {
        console.error("Error uploading file:", error);
        return apiError(500, "Internal server error");
    }
}

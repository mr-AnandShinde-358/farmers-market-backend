import  imagekit  from "../config/imagekit.config";

export interface UploadedImage {
  url: string;
  fileId: string;
  thumbnailUrl: string;
}

const uploadSingleImage = async (
    fileBuffer: Buffer,
    fileName: string,
    folder: string = "farm-connect/products"
): Promise<UploadedImage> => {
    const base64 = fileBuffer.toString("base64");

    const response = await imagekit.upload({
        file: base64,
        fileName,
        folder,
        transformation: {
            pre: 'e-bgremove,e-dropshadow,e-upscale',
        },
        overwriteFile: false
    });

    const thumbnailUrl = imagekit.url({
        src: response.url,
        transformation: [{ fo: "auto", w: "400", h: "400", c: "at_max" }]
    });

    return {
        url: response.url,
        fileId: response.fileId,
        thumbnailUrl
    };
};

export const uploadProductImages = async (
    // files: Express.Multer.File[]
    files:any[]
): Promise<UploadedImage[]> => {

    const results = await Promise.allSettled(
        files.map((file) =>
            uploadSingleImage(
                file.buffer,
                `${Date.now()}-${file.originalname}`
            )
        )
    );

    // Jo successfully upload hue unhe track karo
    const uploaded: UploadedImage[] = [];
    const failed = results.some((result, i) => {
        if (result.status === "fulfilled") {
            uploaded.push(result.value);
            return false;
        }
        console.error(`Image ${files?.[i]?.originalname} upload failed:`, result.reason);
        return true;
    });

    // Koi bhi fail hua toh sab rollback
    if (failed) {
        await Promise.allSettled(
            uploaded.map((img) => imagekit.deleteFile(img.fileId))
        );
        throw new Error("One or more images failed to upload. All uploads rolled back.");
    }

    return uploaded;
};

export const deleteProductImages = async (
    fileIds: string[]
): Promise<void> => {
    await Promise.allSettled(
        fileIds.map((id) => imagekit.deleteFile(id))
    );
};
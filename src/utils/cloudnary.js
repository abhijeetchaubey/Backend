import {v2 as cloudinary} from "cloudinary"
import fs from  "fs"



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.cloud_name, 
        api_key:process.env.api_key, 
        api_secret:process.env.api_secret 
    });
    
    // Upload an image
    const uploadONCloudinary = async(localFilePath)=>{
        try {
            if (!localFilePath) return null
            // upload the file on cloudinary
            const response = await cloudinary.uploader(localFilePath,{
                resource_type:"auto"
            }
            )
            // file has been uploaded successfully
            console.log("file is uploaded on cloudinary",
            response.url);

            return response;
        } catch (error) {
            fs.unlinkSync(localFilePath) //remove the locally saves temporiraly file
            return null
        }
    }

export {uploadONCloudinary}